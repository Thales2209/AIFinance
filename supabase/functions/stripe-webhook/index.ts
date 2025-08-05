declare const Deno: any;

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@11.1.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Esta função é o "ouvinte" que recebe a notificação do Stripe
// quando um pagamento é bem-sucedido.
async function handler(req: Request) {
  const signature = req.headers.get('Stripe-Signature')
  const body = await req.text()

  // Pega as chaves secretas que configuramos no painel do Supabase
  const stripeApiKey = Deno.env.get('STRIPE_API_KEY')
  const webhookSigningSecret = Deno.env.get('STRIPE_WEBHOOK_SIGNING_SECRET')
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  if (!stripeApiKey || !webhookSigningSecret || !supabaseUrl || !supabaseServiceRoleKey) {
    console.error('Variáveis de ambiente não configuradas corretamente.')
    return new Response('Configuração do servidor incompleta.', { status: 500 })
  }
  
  const stripe = new Stripe(stripeApiKey, {
    apiVersion: '2022-11-15',
    httpClient: Stripe.createFetchHttpClient(),
  })

  try {
    // Verifica se o evento veio mesmo do Stripe (segurança)
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature!,
      webhookSigningSecret
    )

    // A mágica acontece aqui: se o evento for de pagamento completo...
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const userEmail = session.customer_details?.email;
      const stripeCustomerId = session.customer as string;

      if (!userEmail) {
        throw new Error('Email do cliente não encontrado na sessão do Stripe.');
      }

      // Cria um cliente Supabase com permissões de administrador para atualizar dados
      const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

      // Encontra o ID do usuário no Supabase a partir do email
      const { data: { users }, error: userError } = await supabaseAdmin.auth.admin.listUsers({ email: userEmail });
      
      if (userError || !users || users.length === 0) {
        throw new Error(`Usuário não encontrado no Supabase com o email: ${userEmail}`);
      }
      const userId = users[0].id;
      
      // Atualiza o perfil do usuário para Pro!
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({ is_pro: true, stripe_customer_id: stripeCustomerId })
        .eq('id', userId);

      if (updateError) {
        console.error('Erro ao atualizar perfil:', updateError)
        throw updateError
      };
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (err) {
    console.error('Erro no webhook:', err.message);
    return new Response(err.message, { status: 400 });
  }
}

// Inicia o servidor da função para "ouvir" as requisições
serve(handler)

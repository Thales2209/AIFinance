import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// =================================================================================
// !! CONFIGURAÇÃO OBRIGATÓRIA !!
// =================================================================================
// Para conectar o aplicativo ao seu banco de dados, você precisa adicionar
// a URL e a Chave "anon public" do seu projeto Supabase abaixo.
//
// Você pode encontrar essas informações no painel do seu projeto em:
// Project Settings > API
//
// Exemplo:
// const supabaseUrl = 'https://xxxxxxxxxxxxxx.supabase.co';
// const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
// =================================================================================

const supabaseUrl = 'COLOQUE_A_URL_DO_SEU_PROJETO_SUPABASE_AQUI';
const supabaseKey = 'COLOQUE_A_CHAVE_ANON_PUBLIC_DO_SEU_PROJETO_AQUI';

// A verificação abaixo garante que as chaves foram adicionadas.
// O aplicativo não funcionará corretamente sem elas.
if (supabaseUrl.includes('COLOQUE_A_URL') || supabaseKey.includes('COLOQUE_A_CHAVE')) {
  const errorMessage = "CONFIGURAÇÃO NECESSÁRIA:\n\nAs chaves do Supabase não foram configuradas. Por favor, edite o arquivo 'services/supabaseClient.ts' e adicione a URL e a chave 'anon public' do seu projeto para continuar.";
  // Usamos um alert para garantir que esta mensagem seja vista.
  alert(errorMessage);
  // Lançamos um erro para parar a execução do aplicativo.
  throw new Error("As chaves do Supabase não estão configuradas.");
}

// Cria e exporta o cliente Supabase para ser usado em toda a aplicação.
export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

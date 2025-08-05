
declare const Deno: any;

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenAI } from "npm:@google/genai";

// Get the API key from the environment variables.
const API_KEY = Deno.env.get("GEMINI_API_KEY");
if (!API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable not set");
}

// Initialize the GoogleGenAI client.
const ai = new GoogleGenAI({ apiKey: API_KEY });

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Predefined categories for the AI model to choose from.
const categories = [
    'Alimentação', 'Moradia', 'Transporte', 'Saúde', 'Educação',
    'Lazer', 'Vestuário', 'Assinaturas e Serviços', 'Cuidados Pessoais',
    'Investimentos', 'Impostos', 'Dívidas', 'Doações', 'Renda', 'Outros'
];

serve(async (req: Request) => {
  // Handle CORS preflight requests.
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { description } = await req.json();

    if (!description) {
      return new Response(JSON.stringify({ error: "Description is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    // Ask the model to categorize the transaction.
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Categorize a seguinte transação: "${description}". Responda apenas com uma das seguintes categorias: ${categories.join(', ')}.`,
        config: {
            temperature: 0,
        }
    });

    let category = response.text.trim().replace('.', '');

    // Fallback if the model returns an unexpected value.
    if (!categories.includes(category)) {
      category = "Outros";
    }

    return new Response(JSON.stringify({ category }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in categorize-transaction function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

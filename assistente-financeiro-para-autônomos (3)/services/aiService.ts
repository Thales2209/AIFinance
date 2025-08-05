
import { supabase } from './supabaseClient';

// Esta função agora invoca uma Supabase Edge Function, que é a maneira segura
// de usar a API Gemini sem expor sua chave secreta no frontend.
export const getCategoryFromAI = async (description: string): Promise<string> => {
    if (!description) return "Outros";

    try {
        // Invoca a função 'categorize-transaction' que faremos o deploy
        const { data, error } = await supabase.functions.invoke('categorize-transaction', {
            body: { description },
        });

        if (error) {
            throw error;
        }

        // A função de backend retorna um objeto { category: "..." }
        return data.category || "Outros";

    } catch (error) {
        console.error("AI Categorization Error (via Supabase Function):", error);
        // Retorna "Outros" como fallback em caso de erro na chamada da função
        return "Outros";
    }
};

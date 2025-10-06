import { createClient } from '@supabase/supabase-js';

// As variáveis de ambiente devem ser acessadas via import.meta.env
// E devem ter o prefixo VITE_

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Verifica se as chaves foram carregadas (boa prática de segurança)
if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
        'As variáveis de ambiente do Supabase (VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY) não estão definidas.'
    );
}

// Inicializa e exporta o cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

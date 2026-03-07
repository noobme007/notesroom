import { createClient } from '@supabase/supabase-js';
import { env } from './env';

if (!env.supabase.url || !env.supabase.serviceKey) {
    console.warn('Supabase URL or Service Key is missing. Storage functionality might fail.');
}

export const supabase = createClient(
    env.supabase.url || 'https://placeholder.supabase.co',
    env.supabase.serviceKey || 'placeholder'
);

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { SUPABASE_URL, SUPABASE_KEY } from './supabase_config.js';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export function subscribeToTransactions(onUpdate) {
  return supabase
    .channel('public:transactions')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, payload => {
      onUpdate(payload);
    })
    .subscribe();
}

export async function fetchUserTransactions(retries = 3, backoff = 1000) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    
    const { data, error } = await supabase
      .from('transactions')
      .select('id, user_id, date, merchant, amount, category, submitted, created_at, source')
      .eq('user_id', user.id)
      .order('date', { ascending: false });
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    if (retries > 0) {
      console.log(`Retrying fetch... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, backoff));
      return fetchUserTransactions(retries - 1, backoff * 2);
    }
    return [];
  }
}

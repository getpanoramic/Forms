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

export async function fetchUserTransactions() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  
  // Explicitly select all columns to ensure 'submitted' is included
  const { data, error } = await supabase
    .from('transactions')
    .select('id, user_id, date, merchant, amount, category, submitted, created_at')
    .eq('user_id', user.id)
    .order('date', { ascending: false });
    
  if (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
  return data;
}

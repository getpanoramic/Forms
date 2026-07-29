import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = 'https://rjfjojghtzkccbscwqby.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Ru7-0nrBOOWTjHQdjla8Wg_b-GBNaY4';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export async function fetchUserTransactions() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user.id);
    
  if (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
  return data;
}

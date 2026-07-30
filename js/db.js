import { supabase } from './supabase.js';

export async function saveTransactions(transactions) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  // Supabase upsert requires a unique constraint. 
  // Since we don't have one on merchant/date/amount, we need to handle this differently.
  // The best way for now, assuming user is logged in, is to delete all existing
  // for this user and re-insert, OR just upsert if we had a unique constraint.
  // Given the current architecture, we will delete all and re-insert for this user.
  
  await supabase.from('transactions').delete().eq('user_id', user.id);
  
  const transactionsToUpload = transactions.map(t => ({
    user_id: user.id,
    date: t.date,
    merchant: t.merchant,
    amount: t.amountEur || t.amount || 0,
    category: t.csvCategory || t.category || 'Diversos',
    submitted: !!t.submitted
  }));
  
  await supabase.from('transactions').insert(transactionsToUpload);
}

export async function getAllTransactions() {
  // If user is logged in, we should be using Supabase, not local DB.
  return []; 
}

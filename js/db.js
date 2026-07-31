import { supabase } from './supabase.js';

export async function saveTransactions(transactions) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.log('DEBUG: No user, skipping save.');
    return;
  }

  console.log(`DEBUG: Deleting existing transactions for user: ${user.id}`);
  const { error: deleteError } = await supabase.from('transactions').delete().eq('user_id', user.id);
  if (deleteError) {
      console.error('DEBUG: Error deleting:', deleteError);
      throw deleteError;
  }
  
  const transactionsToUpload = transactions.map(t => ({
    user_id: user.id,
    date: t.date,
    merchant: t.merchant,
    amount: t.amountEur || t.amount || 0,
    category: t.csvCategory || t.category || 'Diversos',
    submitted: !!t.submitted,
    source: t.source || 'csv'
  }));
  
  console.log(`DEBUG: Inserting ${transactionsToUpload.length} transactions.`);
  const { error: insertError } = await supabase.from('transactions').upsert(transactionsToUpload);
  if (insertError) {
      console.error('DEBUG: Error upserting:', insertError);
      throw insertError;
  }
  console.log('DEBUG: Successfully saved transactions.');
}

export async function getAllTransactions() {
  // If user is logged in, we should be using Supabase, not local DB.
  return []; 
}

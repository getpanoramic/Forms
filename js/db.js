import { supabase } from './supabase.js';

export async function saveTransactions(transactions) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.log('DEBUG: No user, skipping save.');
    return;
  }

  // Determine source based on the first transaction, defaulting to 'csv'
  const source = transactions.length > 0 ? (transactions[0].source || 'csv') : 'csv';
  console.log(`DEBUG: Deleting existing '${source}' transactions for user: ${user.id}`);
  
  // Refined deletion: Only delete transactions of the same source
  const { error: deleteError } = await supabase.from('transactions')
    .delete()
    .eq('user_id', user.id)
    .eq('source', source); // Only delete same-source transactions

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
  
  console.log(`DEBUG: Inserting ${transactionsToUpload.length} transactions as '${source}'.`);
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

import {redirect} from 'next/navigation';

// The former dashboard used legacy "musim_tanam/pengeluaran" tables.
// Keep old links functional while the canonical app uses farm_projects/budget_items/expenses.
export default function LegacyDashboardRedirect(){
 redirect('/home');
}

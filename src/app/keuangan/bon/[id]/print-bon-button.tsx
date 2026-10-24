'use client';
import FarmIcon from '@/components/farm-icon';
export default function PrintBonButton(){
 return <button type="button" onClick={()=>window.print()} className="farm-button farm-button-primary w-full sm:w-auto">
  <FarmIcon name="receipt" size={18}/> Cetak / Simpan PDF
 </button>;
}

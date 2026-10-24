/* Minimal standards-compliant XLSX writer for Yanzen E-Farmer.
   No external packages; uses typed Open XML parts inside an uncompressed ZIP. */
export type BudgetExportRow = {
  name: string;
  category: string;
  quantity: number;
  unit: string;
  unit_price: number;
};
export type BudgetExportProject = { name: string; crop: string; area_tumbak: number };

const XML = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
const NS = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main';

function escapeXml(v: string): string {
  return v.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c] as string))
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g,'');
}
function textCell(ref:string,v:string,style=0):string {
 return '<c r="'+ref+'" s="'+style+'" t="inlineStr"><is><t xml:space="preserve">'+escapeXml(v)+'</t></is></c>';
}
function numericCell(ref:string,n:number,style=0):string {
 return '<c r="'+ref+'" s="'+style+'"><v>'+String(n)+'</v></c>';
}
function formulaCell(ref:string,formula:string,cached:number,style=2):string {
 return '<c r="'+ref+'" s="'+style+'"><f>'+escapeXml(formula)+'</f><v>'+String(cached)+'</v></c>';
}
function row(n:number,cells:string):string{return '<row r="'+n+'">'+cells+'</row>';}
function worksheet(rows:string[],widths:number[],freeze=0,filter?:string):string {
 const cols=widths.map((w,i)=>'<col min="'+(i+1)+'" max="'+(i+1)+'" width="'+w+'" customWidth="1"/>').join('');
 const pane=freeze?'<sheetViews><sheetView workbookViewId="0"><pane ySplit="'+freeze+'" topLeftCell="A'+(freeze+1)+'" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>':'<sheetViews><sheetView workbookViewId="0"/></sheetViews>';
 return XML+'<worksheet xmlns="'+NS+'">'+pane+'<cols>'+cols+'</cols><sheetData>'+rows.join('')+'</sheetData>'+(filter?'<autoFilter ref="'+filter+'"/>':'')+'</worksheet>';
}
function crc32(input:Buffer):number {
 let crc=0xffffffff;
 for (const byte of input){crc^=byte;for(let i=0;i<8;i++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}
 return (crc^0xffffffff)>>>0;
}
function zip(files:Array<{name:string;content:string}>):Buffer {
 const local:Buffer[]=[];const central:Buffer[]=[];let offset=0;let centralBytes=0;
 for(const f of files) {
  const name=Buffer.from(f.name,'utf8'),data=Buffer.from(f.content,'utf8'),crc=crc32(data);
  const h=Buffer.alloc(30);
  h.writeUInt32LE(0x04034b50,0);h.writeUInt16LE(20,4);h.writeUInt16LE(0,6);h.writeUInt16LE(0,8);
  h.writeUInt32LE(crc,14);h.writeUInt32LE(data.length,18);h.writeUInt32LE(data.length,22);h.writeUInt16LE(name.length,26);
  local.push(h,name,data);
  const c=Buffer.alloc(46);
  c.writeUInt32LE(0x02014b50,0);c.writeUInt16LE(20,4);c.writeUInt16LE(20,6);
  c.writeUInt32LE(crc,16);c.writeUInt32LE(data.length,20);c.writeUInt32LE(data.length,24);
  c.writeUInt16LE(name.length,28);c.writeUInt32LE(offset,42);
  central.push(c,name);centralBytes+=46+name.length;offset+=30+name.length+data.length;
 }
 const end=Buffer.alloc(22);
 end.writeUInt32LE(0x06054b50,0);
 end.writeUInt16LE(files.length,8);end.writeUInt16LE(files.length,10);
 end.writeUInt32LE(centralBytes,12);end.writeUInt32LE(offset,16);
 return Buffer.concat([...local,...central,end]);
}
export function buildBudgetXlsx(project:BudgetExportProject,items:BudgetExportRow[]):Buffer {
 const budget=items.reduce((s,x)=>s+Number(x.quantity)*Number(x.unit_price),0);
 const last=5+items.length;
 const totalRow=last+1;
 const a:string[]=[];
 a.push(row(1,textCell('A1','YANZEN E-FARMER | ANGGARAN PROYEK',1)));
 a.push(row(2,textCell('A2','Proyek')+textCell('B2',project.name)));
 a.push(row(3,textCell('A3','Komoditas')+textCell('B3',project.crop)+textCell('D3','Luas tumbak')+numericCell('E3',Number(project.area_tumbak))));
 a.push(row(5,['No','Kebutuhan','Kategori','Jumlah','Satuan','Harga satuan (Rp)','Total (Rp)'].map((x,i)=>textCell('ABCDEFG'[i]+'5',x,1)).join('')));
 items.forEach((x,i)=>{
  const r=i+6;
  a.push(row(r,numericCell('A'+r,i+1)+textCell('B'+r,x.name)+textCell('C'+r,x.category)
   +numericCell('D'+r,Number(x.quantity))+textCell('E'+r,x.unit)+numericCell('F'+r,Number(x.unit_price),2)
   +formulaCell('G'+r,'D'+r+'*F'+r,Number(x.quantity)*Number(x.unit_price))));
 });
 a.push(row(totalRow,textCell('F'+totalRow,'TOTAL ANGGARAN',1)+formulaCell('G'+totalRow,'SUM(G6:G'+last+')',budget)));
 const categories=[...new Set(items.map(x=>x.category))].sort((x,y)=>x.localeCompare(y,'id'));
 const b:string[]=[
  row(1,textCell('A1','RINGKASAN ANGGARAN',1)),
  row(3,textCell('A3','Kategori',1)+textCell('B3','Total biaya (Rp)',1)+textCell('C3','Jumlah komponen',1))
 ];
 categories.forEach((category,i)=>{
  const r=i+4;
  const subtotal=items.filter(x=>x.category===category).reduce((s,x)=>s+Number(x.quantity)*Number(x.unit_price),0);
  const count=items.filter(x=>x.category===category).length;
  b.push(row(r,textCell('A'+r,category)+formulaCell('B'+r,'SUMIF(Anggaran!$C$6:$C$'+last+',A'+r+',Anggaran!$G$6:$G$'+last+')',subtotal)
    +formulaCell('C'+r,'COUNTIF(Anggaran!$C$6:$C$'+last+',A'+r+')',count,0)));
 });
 const bTotal=4+categories.length;
 b.push(row(bTotal,textCell('A'+bTotal,'TOTAL',1)
   +formulaCell('B'+bTotal,'SUM(B4:B'+(bTotal-1)+')',budget)
   +formulaCell('C'+bTotal,'SUM(C4:C'+(bTotal-1)+')',items.length,0)));
 b.push(row(bTotal+2,textCell('A'+(bTotal+2),'Biaya per tumbak')
   +formulaCell('B'+(bTotal+2),'IF(Anggaran!E3>0,B'+bTotal+'/Anggaran!E3,0)',
    Number(project.area_tumbak)>0?budget/Number(project.area_tumbak):0)));
 const tips=[
  '1. Ubah jumlah dan harga satuan pada sheet Anggaran.',
  '2. Kolom total biaya menghitung otomatis dengan rumus Excel.',
  '3. Ringkasan memakai SUMIF dan COUNTIF dari sheet Anggaran.',
  '4. Berkas ini adalah salinan anggaran rencana dari Yanzen E-Farmer.',
  '5. Perubahan di Excel tidak otomatis tersimpan ke database Supabase.',
  '6. Untuk pengeluaran aktual dan cetak bon, gunakan menu Keuangan pada aplikasi.'
 ];
 const c=[row(1,textCell('A1','PETUNJUK PENGGUNAAN',1)),...tips.map((v,i)=>row(i+3,textCell('A'+(i+3),v)))];
 const contentTypes=XML+'<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
  +'<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
  +'<Default Extension="xml" ContentType="application/xml"/>'
  +'<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'
  +'<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>'
  +[1,2,3].map(i=>'<Override PartName="/xl/worksheets/sheet'+i+'.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>').join('')+'</Types>';
 const rootRels=XML+'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>';
 const book=XML+'<workbook xmlns="'+NS+'" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>'
  +'<sheet name="Anggaran" sheetId="1" r:id="rId1"/><sheet name="Ringkasan" sheetId="2" r:id="rId2"/><sheet name="Petunjuk" sheetId="3" r:id="rId3"/>'
  +'</sheets><calcPr calcId="0" fullCalcOnLoad="1"/></workbook>';
 const rels=XML+'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
  +[1,2,3].map(i=>'<Relationship Id="rId'+i+'" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet'+i+'.xml"/>').join('')
  +'<Relationship Id="rId4" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>';
 const styles=XML+'<styleSheet xmlns="'+NS+'">'
  +'<numFmts count="1"><numFmt numFmtId="164" formatCode="#,##0.00"/></numFmts>'
  +'<fonts count="2"><font><sz val="11"/><name val="Aptos"/></font><font><b/><color rgb="FFFFFFFF"/><sz val="11"/><name val="Aptos"/></font></fonts>'
  +'<fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF103E32"/><bgColor indexed="64"/></patternFill></fill></fills>'
  +'<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>'
  +'<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>'
  +'<cellXfs count="3"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/>'
  +'<xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFill="1" applyFont="1"/>'
  +'<xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>'
  +'</cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>';
 return zip([
  {name:'[Content_Types].xml',content:contentTypes},
  {name:'_rels/.rels',content:rootRels},
  {name:'xl/workbook.xml',content:book},
  {name:'xl/_rels/workbook.xml.rels',content:rels},
  {name:'xl/styles.xml',content:styles},
  {name:'xl/worksheets/sheet1.xml',content:worksheet(a,[8,29,20,14,13,23,23],5,items.length?'A5:G'+last:undefined)},
  {name:'xl/worksheets/sheet2.xml',content:worksheet(b,[29,25,20])},
  {name:'xl/worksheets/sheet3.xml',content:worksheet(c,[105])}
 ]);
}

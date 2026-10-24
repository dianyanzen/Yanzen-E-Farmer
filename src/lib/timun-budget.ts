export type BudgetItem = {name:string;qty:number;unit:string;price:number;category:string};
export const initialBudget:BudgetItem[] = [
['Lokasi',1150,'tumbak',11000,'Lahan'],['Macul',1150,'tumbak',11000,'Tenaga kerja'],
['Binih Model',90,'amplop',41000,'Benih'],['Saena',70,'amplop',60000,'Benih'],
['Tawon',500,'kg',12000,'Pupuk'],['Grower',300,'kg',17500,'Pupuk'],['Mutiara',600,'kg',17000,'Pupuk'],
['Antrakol',2,'bungkus',155000,'Pestisida'],['Rodomil',2,'bungkus',175000,'Pestisida'],
['Benlok',6,'bungkus',87000,'Pestisida'],['Hajar',6,'botol',200000,'Pestisida'],
['Genotive',40,'unit',54000,'Pestisida'],['Dewadewi',9,'unit',55000,'Pestisida'],
['Java Blom',10,'unit',58000,'Pupuk'],['Jago Subur',15,'unit',40000,'Pupuk'],
['Benang',115,'kg',14000,'Perlengkapan'],['Fenite',4,'unit',190000,'Pestisida'],
['zhepyr',4,'unit',65000,'Pestisida'],['Pegawai 18-23',73,'orang',85000,'Tenaga kerja'],
['Pegawai 23 P',7,'orang',60000,'Tenaga kerja'],['Angkut Turus',1,'mobil',500000,'Transportasi'],
['Melakan Perempuan',20,'orang',100000,'Tenaga kerja'],['Melakan Laki',9,'orang',130000,'Tenaga kerja'],
['Aduk Tai Hayam',40,'karung',12000,'Tenaga kerja']
].map(([name,qty,unit,price,category])=>({name:String(name),qty:Number(qty),unit:String(unit),price:Number(price),category:String(category)}));

#!/usr/bin/env node
/** Search the versioned YZ Farm Life asset database without loading files in the game. */
import {readFileSync} from "node:fs";
const db=JSON.parse(readFileSync(new URL("../../game-assets/catalog/asset-database.json",import.meta.url),"utf8"));
const args=process.argv.slice(2);
function option(flag,fall=""){const i=args.indexOf(flag);return i<0?fall:args[i+1]||fall}
const query=option("--search").toLocaleLowerCase("id");
const style=option("--style"),kind=option("--kind"),purpose=option("--purpose"),stage=option("--stage");
const dupOnly=args.includes("--duplicates"),templates=args.includes("--shared-templates");
const limit=Math.max(1,Math.min(200,Number(option("--limit","30"))||30));
let rows=db.rows.filter(r=>(!query||r[0].toLocaleLowerCase("id").includes(query))&&
 (!style||r[6]===style)&&(!kind||r[3]===kind)&&(!purpose||r[5]===purpose)&&
 (!stage||r[4]===stage)&&(!dupOnly||r[8]!==null)&&(!templates||r[9]==="shared-template-sprite"));
const categories={};for(const r of rows){const k=r[5];categories[k]=(categories[k]||0)+1}
console.log(JSON.stringify({matched:rows.length,total:db.stats.fileCount,shown:Math.min(rows.length,limit),categories,
 records:rows.slice(0,limit).map(row=>Object.fromEntries(db.columns.map((k,i)=>[k,row[i]])))},null,2));

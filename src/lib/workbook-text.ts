import {read,utils} from 'xlsx';
import {parseWorkbook,fetchWorkbookBytes} from './workbook';
import rules from '../data/text-rules.json';
import type {TextRecord} from './types';

const normalize=(text:string)=>text.normalize('NFKC').trim().replace(/\s+/gu,' ');
const match=(text:string)=>(normalize(text).toLowerCase().match(/[a-z0-9]+/g)??[]).join(' ');
const stop=new Set(rules.stop),boilerplate=new Set(rules.boilerplate);
function phrases(text:string) {
  const tokens=normalize(text).toLowerCase().match(/[a-z0-9]+(?:['-][a-z]+)?/g)??[], counts=new Map<string,number>();
  for(const n of [1,2,3]) for(let i=0;i<=tokens.length-n;i++) {
    const span=tokens.slice(i,i+n);
    if(stop.has(span[0])||stop.has(span[n-1])||!span.some(t=>!stop.has(t)&&!boilerplate.has(t)&&t.length>2)||(n===1&&boilerplate.has(span[0]))) continue;
    const phrase=span.join(' ');counts.set(phrase,(counts.get(phrase)??0)+1);
  }
  return counts;
}
export async function parseWorkbookText(buffer:ArrayBuffer):Promise<(TextRecord&{phrases:string[]})[]> {
  const records=await parseWorkbook(buffer);
  const cells=utils.sheet_to_json<unknown[]>(read(buffer,{type:'array'}).Sheets.Sheet1,{header:1,defval:null,blankrows:false}).slice(1);
  const result:(TextRecord&{phrases:string[]})[]=[];
  for(const [index,row] of cells.entries()) for(const [field,column] of [['incident',21],['best',30],['improvement',31]] as const) {
    const original=String(row[column]??''),clean=normalize(original);
    if(clean==='No service failure is included in this persona.'||(field==='incident'&&!records[index].failure)||!/[a-zA-Z]/.test(clean)||clean.length<5)continue;
    const text=original.replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,'[email redacted]').replace(/(?<!\w)\+?\d[\d ()-]{8,}\d(?!\w)/g,s=>{const n=s.replace(/\D/g,'').length;return n>=10&&n<=15?'[phone redacted]':s;});
    const padded=' '+match(text)+' ';
    result.push({id:records[index].id,provider:records[index].provider,field,text,themes:rules.themes.filter(t=>t.phrases.some(p=>padded.includes(' '+match(p)+' '))).map(t=>t.id),sentiment:'unavailable',compound:null,phrases:[]});
  }
  for(const field of ['incident','best','improvement']) {
    const group=result.filter(r=>r.field===field),counts=group.map(r=>phrases(r.text)),df=new Map<string,number>();
    for(const c of counts)for(const p of c.keys())df.set(p,(df.get(p)??0)+1);
    counts.forEach((c,i)=>{
      const score=(p:string)=>c.get(p)!*(Math.log((1+group.length)/(1+df.get(p)!))+1);
      group[i].phrases=[...c.keys()].filter(p=>df.get(p)!>=2).sort((a,b)=>score(b)-score(a)||(a<b?-1:a>b?1:0)).slice(0,12);
    });
  }
  return result;
}
export async function fetchWorkbookText(){return parseWorkbookText(await fetchWorkbookBytes());}

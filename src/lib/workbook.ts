import {read, utils} from 'xlsx';
import manifest from '../../public/data/manifest.json';
import type {SurveyRecord} from './types';

export const workbookUrl = 'https://raw.githubusercontent.com/GurucharanSavanth/Airtel-VS-JIO/main/data/survey.xlsx';
const normalize = (value:unknown) => String(value ?? '').normalize('NFKC').trim().replace(/\s+/gu, ' ');
const selections = (value:unknown) => [...new Set(normalize(value).split(';').map(normalize).filter(Boolean))];
const columns:Record<string,number> = {reliability:8,coverage:9,speed:10,promise:11,access:13,response:14,resolution:15,assurance:16,empathy:17,digital:18,recovery:22,fairness:24,continue:28,recommend:29};

export async function parseWorkbook(buffer:ArrayBuffer):Promise<SurveyRecord[]> {
  const hash = [...new Uint8Array(await crypto.subtle.digest('SHA-256', buffer))].map(b=>b.toString(16).padStart(2,'0')).join('');
  if (hash !== manifest.source.sha256) throw Error('The workbook has changed. Rebuild the audited data and text analysis before publishing this version.');
  const book = read(buffer, {type:'array'});
  const sheet = book.Sheets.Sheet1;
  if (!sheet) throw Error('The workbook is missing Sheet1.');
  const rows = utils.sheet_to_json<unknown[]>(sheet, {header:1,defval:null,blankrows:false});
  if (rows.length !== 947 || rows[0].length !== 32) throw Error('Unexpected survey dimensions.');
  return rows.slice(1).map((row,index)=>{
    const provider = normalize(row[4]);
    if (provider !== 'Airtel' && provider !== 'Jio') throw Error('Unexpected provider.');
    const bool = (column:number) => {
      const value=normalize(row[column]);
      if(value !== 'Yes' && value !== 'No') throw Error('Unexpected eligibility answer.');
      return value === 'Yes';
    };
    const ratings = Object.fromEntries(Object.entries(columns).map(([key,column])=>{
      const value=row[column];
      if(value === null || normalize(value) === '') return [key,null];
      if(typeof value !== 'number' || !Number.isInteger(value) || value<1 || value>5) throw Error('Invalid rating.');
      return [key,value];
    }));
    return {id:`r${String(index+1).padStart(4,'0')}`,provider,services:selections(row[5]),tenure:normalize(row[6]),selectionReason:normalize(row[7]),support:bool(12),failure:bool(19),switching:bool(26),failureTypes:normalize(row[20])==='None'?[]:selections(row[20]),remedy:normalize(row[23]).replaceAll('Explantion','Explanation'),trust:normalize(row[25]),switchReasons:selections(row[27]),ratings};
  });
}

let download:Promise<ArrayBuffer>|null=null;
export function fetchWorkbookBytes() {
  download ??= fetch(workbookUrl, {signal:AbortSignal.timeout(30000)}).then(response=>{
    if(!response.ok) throw Error(`The GitHub workbook could not be loaded (${response.status}).`);
    return response.arrayBuffer();
  }).catch(error=>{download=null;throw error;});
  return download;
}
export async function fetchWorkbook() {return parseWorkbook(await fetchWorkbookBytes());}

import test from 'node:test';
import {createHash} from 'node:crypto';
import {parseWorkbookText} from '../src/lib/workbook-text';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {parseWorkbook} from '../src/lib/workbook';
import {sitePath,basePath} from '../src/lib/paths';

test('raw workbook ingestion exactly matches all audited records and rejects changed data',async()=>{
  const bytes = new Uint8Array(readFileSync('data/survey.xlsx'));
  assert.deepEqual(await parseWorkbook(bytes.buffer), JSON.parse(readFileSync('public/data/survey.json','utf8')));
  bytes[100] ^= 1;
  await assert.rejects(parseWorkbook(bytes.buffer), /workbook has changed/);
  assert.equal(sitePath('/studio/'),basePath+'/studio/');
  assert.equal(sitePath('https://example.com/'), 'https://example.com/');
  assert.equal(sitePath('#main'), '#main');
  assert.equal(sitePath(sitePath('/studio/')),sitePath('/studio/'));
});


test('runtime text, themes and retained phrases reproduce the audited corpus without publishing a duplicate',async()=>{
  const rows=await parseWorkbookText(new Uint8Array(readFileSync('data/survey.xlsx')).buffer);
  const projection=rows.map(({id,provider,field,text,themes,phrases})=>({id,provider,field,text,themes,phrases}));
  assert.equal(createHash('sha256').update(JSON.stringify(projection)).digest('hex'),'a8d833471267264cdf8f1ffe343e6b37a0ec3493fd6f983876d59b72d9502ebc');
});

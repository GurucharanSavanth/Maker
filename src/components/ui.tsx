'use client';
import AppLink from '@/components/AppLink';


import {useEffect,useState,useCallback} from 'react';
import {sources} from '@/lib/catalog';
export function Arrow({diagonal=false}:{diagonal?:boolean}){return <span aria-hidden="true">{diagonal?'↗':'→'}</span>}
export function Badge({children,tone='neutral'}:{children:React.ReactNode;tone?:string}){return <span className={`badge ${tone}`}>{children}</span>}
export function SourceLink({ids=['source-deck']}:{ids?:string[]}){return <div className="source-line"><span>Evidence</span>{ids.map(id=>{const s=sources.find(s=>s.id===id);return s?<AppLink key={id} href={`/sources/#${id}`}>{s.title.split(' · ')[0]} <Arrow diagonal/></AppLink>:<span key={id}>{id}</span>})}</div>}
export function SectionHead({eyebrow,title,description}:{eyebrow:string;title:string;description?:string}){return <header className="section-head"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1>{description&&<p className="lede">{description}</p>}</header>}
export function Notice({title,children}:{title:string;children:React.ReactNode}){return <aside className="notice"><strong>{title}</strong><div>{children}</div></aside>}
export function Loading({label='Loading the analytical view…'}:{label?:string}){return <div className="loading" role="status"><span className="loading-bar"/><p>{label}</p></div>}
export function Empty({title='No responses match this selection.',children}:{title?:string;children?:React.ReactNode}){return <div className="empty"><span aria-hidden="true">∅</span><h3>{title}</h3><p>{children??'Broaden the filters or reset the selection to return to the full sample.'}</p></div>}
export function useQuery(){const [query,setQ]=useState<URLSearchParams>(new URLSearchParams());useEffect(()=>{const sync=()=>setQ(new URLSearchParams(window.location.search));sync();window.addEventListener('popstate',sync);window.addEventListener('querychange',sync);return()=>{window.removeEventListener('popstate',sync);window.removeEventListener('querychange',sync)}},[]);const setQuery=useCallback((changes:Record<string,string|null>,replace=false)=>{const q=new URLSearchParams(window.location.search);for(const[k,v]of Object.entries(changes))if(v)q.set(k,v);else q.delete(k);const search=q.toString();window.history[replace?'replaceState':'pushState']({},'',window.location.pathname+(search?'?'+search:'')+window.location.hash);window.dispatchEvent(new Event('querychange'));},[]);return {query,setQuery};}
export const number=(v:number|null|undefined,dec=2)=>v==null||!Number.isFinite(v)?'—':v.toFixed(dec);
export const pvalue=(v:number|null|undefined)=>v==null?'Unavailable':v<.001?'< .001':v.toFixed(3);

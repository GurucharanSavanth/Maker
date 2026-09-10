import Report from '@/components/Report';
import {reportPages,evidencePages} from '@/lib/catalog';
import {notFound} from 'next/navigation';
export const dynamicParams=false;
export function generateStaticParams(){return [...reportPages.slice(1),...evidencePages].map(([url])=>({slug:url.split('/').filter(Boolean)}))}
export async function generateMetadata({params}:{params:Promise<{slug:string[]}>}){const {slug}=await params;const path='/'+slug.join('/')+'/';return {title:[...reportPages,...evidencePages].find(p=>p[0]===path)?.[1]??'Report'};}
export default async function Page({params}:{params:Promise<{slug:string[]}>}){const {slug}=await params;const page='/'+slug.join('/')+'/';if(![...reportPages,...evidencePages].some(p=>p[0]===page))notFound();return <Report page={page}/>}

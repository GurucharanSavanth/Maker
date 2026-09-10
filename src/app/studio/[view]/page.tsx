import Studio from '@/components/Studio';
export const dynamicParams=false;
export function generateStaticParams(){return ['ratings','recovery','retention','relationships','text','quality'].map(view=>({view}))}
export async function generateMetadata({params}:{params:Promise<{view:string}>}){const {view}=await params;return {title:'Studio · '+view.charAt(0).toUpperCase()+view.slice(1)}}
export default async function Page({params}:{params:Promise<{view:string}>}){const {view}=await params;return <Studio view={view}/>}

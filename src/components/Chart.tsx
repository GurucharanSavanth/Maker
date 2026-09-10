'use client';
import {useEffect,useRef} from 'react';
import * as echarts from 'echarts/core';
import {BarChart,ScatterChart,HeatmapChart} from 'echarts/charts';
import {GridComponent,TooltipComponent,LegendComponent,AriaComponent,VisualMapComponent} from 'echarts/components';
import {SVGRenderer} from 'echarts/renderers';
import type {EChartsCoreOption} from 'echarts/core';
echarts.use([BarChart,ScatterChart,HeatmapChart,GridComponent,TooltipComponent,LegendComponent,AriaComponent,VisualMapComponent,SVGRenderer]);
export default function Chart({option,label,height=300,onInspect}:{option:EChartsCoreOption;label:string;height?:number;onInspect?:(name:string,value:unknown,pin:boolean)=>void}){
  const ref=useRef<HTMLDivElement>(null),instance=useRef<echarts.EChartsType|null>(null),callback=useRef(onInspect),current=useRef({option,label});callback.current=onInspect;current.current={option,label};
  useEffect(()=>{if(!ref.current)return;const chart=echarts.init(ref.current,undefined,{renderer:'svg'});instance.current=chart;const media=matchMedia('(prefers-reduced-motion: reduce)');const apply=()=>chart.setOption({...current.current.option,animation:!media.matches&&document.documentElement.dataset.motion!=='off',animationDuration:600,animationDurationUpdate:450,animationEasingUpdate:'cubicOut',textStyle:{fontFamily:'Arial, sans-serif'},aria:{enabled:true,description:current.current.label}},{replaceMerge:['series']});apply();media.addEventListener('change',apply);window.addEventListener('motionchange',apply);chart.on('mouseover',p=>callback.current?.(p.name,p.value,false));chart.on('click',p=>callback.current?.(p.name,p.value,true));const resize=new ResizeObserver(()=>chart.resize());resize.observe(ref.current);const visibility=new IntersectionObserver(([entry])=>{if(entry.isIntersecting&&document.documentElement.dataset.motion!=='off')chart.getZr().animation.start();else chart.getZr().animation.stop()});visibility.observe(ref.current);return()=>{visibility.disconnect();resize.disconnect();media.removeEventListener('change',apply);window.removeEventListener('motionchange',apply);chart.dispose();instance.current=null}},[]);
  useEffect(()=>{instance.current?.setOption({...option,animation:!matchMedia('(prefers-reduced-motion: reduce)').matches&&document.documentElement.dataset.motion!=='off',aria:{enabled:true,description:label}},{replaceMerge:['series']})},[option,label]);
  return <div className="echart" ref={ref} role="img" aria-label={label} style={{height}}/>;
}

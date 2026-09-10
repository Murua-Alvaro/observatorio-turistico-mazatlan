import { ArrowRight, Globe2, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartFrame, tooltipStyle } from '../components/ChartFrame';
import { Panel } from '../components/Panel';
import { SectionHeader } from '../components/SectionHeader';
import { data, nationalityMonthly } from '../data/model';
import { integer } from '../lib/format';
import type { ObservatoryYear } from '../lib/export';

type Props={year:ObservatoryYear};

export function Markets({year}:Props){
  const [limit,setLimit]=useState<5|10>(10);
  const monthly=nationalityMonthly.filter((d:any)=>Number(d.anio)===year);
  const countries=useMemo(()=>data.nationality.countries.filter((d:any)=>Number(d.anio)===year).sort((a:any,b:any)=>b.valor_entradas-a.valor_entradas),[year]);
  const total=countries.reduce((s:number,d:any)=>s+d.valor_entradas,0);
  const top2=total?countries.slice(0,2).reduce((s:number,d:any)=>s+d.valor_entradas,0)/total*100:0;
  const top5=total?countries.slice(0,5).reduce((s:number,d:any)=>s+d.valor_entradas,0)/total*100:0;

  return <>
    <SectionHeader kicker="Mercados de origen" title={`Entradas aéreas de extranjeros · ${year}`} description="Una vista comercial del origen internacional registrado para Mazatlán. Sirve para segmentar promoción y vigilar concentración; no equivale a pasajeros terminales ni huéspedes únicos." />
    <div className="module-tabs module-tabs--compact"><button className={limit===5?'active':''} onClick={()=>setLimit(5)}>Top 5</button><button className={limit===10?'active':''} onClick={()=>setLimit(10)}>Top 10</button></div>
    <div className="market-kpis"><article><span>Entradas registradas</span><strong>{integer.format(total)}</strong><small>acumulado disponible {year}</small></article><article><span>Concentración top 2</span><strong>{top2.toFixed(1)}%</strong><small>participación de los dos principales países</small></article><article><span>Concentración top 5</span><strong>{top5.toFixed(1)}%</strong><small>participación conjunta de los cinco principales</small></article></div>
    <div className="split-grid split-grid--wide-left"><Panel title="Evolución mensual" subtitle="Entradas registradas por UPM/DataTur"><ChartFrame large><ResponsiveContainer width="100%" height="100%"><AreaChart data={monthly} margin={{top:10,right:10,left:-4,bottom:0}}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#dfe8e4"/><XAxis dataKey="label" tick={{fontSize:11,fill:'#66756f'}} tickLine={false} axisLine={false}/><YAxis tick={{fontSize:11,fill:'#66756f'}} tickLine={false} axisLine={false} tickFormatter={(v:any)=>`${Math.round(Number(v)/1000)}k`}/><Tooltip contentStyle={tooltipStyle} formatter={(v:any)=>integer.format(Number(v))}/><Area dataKey="valor_entradas" name="Entradas" stroke="#1b7466" strokeWidth={2.5} fill="#e4efeb"/></AreaChart></ResponsiveContainer></ChartFrame></Panel><Panel title={`Mercados principales ${year}`} subtitle={`${limit} países con más entradas registradas`}><div className="ranking ranking--clean">{countries.slice(0,limit).map((d:any,i:number)=><div className="rank" key={d.pais}><span className="rank__number">{String(i+1).padStart(2,'0')}</span><div><strong>{d.pais}</strong><span>{integer.format(d.valor_entradas)} entradas</span></div><div className="rank__bar"><span style={{width:`${Math.max(3,d.valor_entradas/(countries[0]?.valor_entradas||1)*100)}%`}}/></div></div>)}</div></Panel></div>
    <div className="callout"><Users size={20}/><div><strong>Lectura comercial</strong><p>Una concentración alta facilita campañas muy enfocadas, pero vuelve al destino más expuesto a choques de pocos mercados. Use esta sección para discutir diversificación y no sólo volumen.</p></div></div>
    <section className="market-actions"><article><Globe2 size={18}/><div><strong>Segmentar promoción</strong><p>Priorice idiomas, temporadas, alianzas y canales según el peso observado de cada mercado.</p></div></article><article><ArrowRight size={18}/><div><strong>Vigilar diversificación</strong><p>Compare la participación top 2 y top 5 para detectar dependencia creciente o expansión hacia mercados secundarios.</p></div></article></section>
  </>;
}

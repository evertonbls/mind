import React, { useState } from 'react';

function lerp(a,b,t){ return a+(b-a)*t; }
function minmax(arr){ const mn=Math.min(...arr),mx=Math.max(...arr); return {mn,mx,range:mx-mn||1}; }

function LineChart({ data, keys, colors, labels, height=140, title }){
  const [hover,setHover]=useState(null);
  if(!data||data.length<2) return null;
  const W=560,H=height,PAD={l:36,r:16,t:16,b:28};
  const iW=W-PAD.l-PAD.r, iH=H-PAD.t-PAD.b;
  const n=data.length;

  // Normalize each key independently
  const scales = keys.map(k => minmax(data.map(d=>parseFloat(d[k])||0)));

  function px(i){ return PAD.l + (i/(n-1))*iW; }
  function py(v,scale){ return PAD.t + iH - ((v-scale.mn)/scale.range)*iH; }

  function makePath(k, scale){
    return data.map((d,i)=>`${i===0?'M':'L'}${px(i).toFixed(1)} ${py(parseFloat(d[k])||0,scale).toFixed(1)}`).join(' ');
  }
  function makeArea(k, scale){
    const pts = data.map((d,i)=>`${px(i).toFixed(1)},${py(parseFloat(d[k])||0,scale).toFixed(1)}`).join(' ');
    const last=`${px(n-1).toFixed(1)},${(PAD.t+iH).toFixed(1)}`;
    const first=`${PAD.l.toFixed(1)},${(PAD.t+iH).toFixed(1)}`;
    return `M ${first} L ${data.map((d,i)=>`${px(i).toFixed(1)},${py(parseFloat(d[k])||0,scale).toFixed(1)}`).join(' L ')} L ${last} Z`;
  }

  return (
    <div>
      {title&&<div style={{fontSize:11,color:'var(--t3)',marginBottom:6,textTransform:'uppercase',letterSpacing:'.07em'}}>{title}</div>}
      <div style={{position:'relative'}}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{width:'100%',height:H,display:'block'}}>
          {/* Grid */}
          {[0,.25,.5,.75,1].map(t=>(
            <line key={t} x1={PAD.l} y1={PAD.t+iH*(1-t)} x2={PAD.l+iW} y2={PAD.t+iH*(1-t)} stroke="rgba(255,255,255,0.04)" strokeWidth="1"/>
          ))}
          {/* X labels */}
          {data.map((d,i)=>(
            <text key={i} x={px(i)} y={H-6} textAnchor="middle" style={{fontSize:9,fill:'var(--t3)',fontFamily:'Geist,sans-serif'}}>{d.month}</text>
          ))}

          {/* Areas + Lines */}
          {keys.map((k,ki)=>(
            <g key={k}>
              <path d={makeArea(k,scales[ki])} fill={colors[ki]} opacity="0.07"/>
              <path d={makePath(k,scales[ki])} fill="none" stroke={colors[ki]} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              {/* Dots */}
              {data.map((d,i)=>(
                <circle key={i} cx={px(i)} cy={py(parseFloat(d[k])||0,scales[ki])} r={hover===i?4:2.5}
                  fill={colors[ki]} stroke="var(--bg2)" strokeWidth="1.5"
                  style={{cursor:'pointer',transition:'r .15s'}}
                  onMouseEnter={()=>setHover(i)} onMouseLeave={()=>setHover(null)}/>
              ))}
            </g>
          ))}

          {/* Hover tooltip */}
          {hover!==null&&(
            <g>
              <line x1={px(hover)} y1={PAD.t} x2={px(hover)} y2={PAD.t+iH} stroke="rgba(255,255,255,0.12)" strokeWidth="1" strokeDasharray="3 2"/>
              <rect x={Math.min(px(hover)+8,W-120)} y={PAD.t} width={110} height={keys.length*18+14} rx="6" fill="var(--bg3)" stroke="var(--b3)" strokeWidth="0.5"/>
              <text x={Math.min(px(hover)+14,W-114)} y={PAD.t+12} style={{fontSize:9,fill:'var(--t3)',fontFamily:'Geist,sans-serif'}}>{data[hover].month}</text>
              {keys.map((k,ki)=>(
                <text key={k} x={Math.min(px(hover)+14,W-114)} y={PAD.t+12+16*(ki+1)} style={{fontSize:10,fill:colors[ki],fontFamily:'Geist,sans-serif',fontWeight:500}}>
                  {labels[ki]}: {parseFloat(data[hover][k]||0).toFixed(k==='roas'?1:0)}{k==='cpa'?'':(k==='roas'?'x':'')}
                </text>
              ))}
            </g>
          )}
        </svg>

        {/* Legend */}
        <div style={{display:'flex',gap:14,marginTop:4}}>
          {keys.map((k,ki)=>(
            <div key={k} style={{display:'flex',alignItems:'center',gap:5,fontSize:10,color:'var(--t3)'}}>
              <div style={{width:16,height:2,background:colors[ki],borderRadius:1}}/>
              {labels[ki]}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BarChart({ data, valueKey, color='#FF5C2B', title, prefix='', suffix='', height=100 }){
  const [hover,setHover]=useState(null);
  if(!data||!data.length)return null;
  const vals=data.map(d=>parseFloat(d[valueKey])||0);
  const max=Math.max(...vals)||1;
  const W=560,H=height,PAD={l:8,r:8,t:8,b:24};
  const iW=W-PAD.l-PAD.r,iH=H-PAD.t-PAD.b;
  const bw=(iW/data.length)-4, gap=4;

  return (
    <div>
      {title&&<div style={{fontSize:11,color:'var(--t3)',marginBottom:6,textTransform:'uppercase',letterSpacing:'.07em'}}>{title}</div>}
      <svg viewBox={`0 0 ${W} ${H}`} style={{width:'100%',height:H,display:'block'}}>
        {data.map((d,i)=>{
          const v=parseFloat(d[valueKey])||0;
          const bh=(v/max)*iH;
          const x=PAD.l+i*(bw+gap);
          const y=PAD.t+iH-bh;
          return (
            <g key={i} onMouseEnter={()=>setHover(i)} onMouseLeave={()=>setHover(null)} style={{cursor:'pointer'}}>
              <rect x={x} y={y} width={bw} height={bh} rx="3" fill={hover===i?color:color+'99'} style={{transition:'fill .15s'}}/>
              <text x={x+bw/2} y={H-6} textAnchor="middle" style={{fontSize:9,fill:'var(--t3)',fontFamily:'Geist,sans-serif'}}>{d.month}</text>
              {hover===i&&(
                <text x={x+bw/2} y={y-5} textAnchor="middle" style={{fontSize:9,fill:color,fontFamily:'Geist,sans-serif',fontWeight:600}}>
                  {prefix}{v.toLocaleString('pt-BR')}{suffix}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function GoalBar({ label, current, target, color='#FF5C2B', invert=false, prefix='', suffix='' }){
  const c=parseFloat(current)||0, t=parseFloat(target)||0;
  if(!t) return null;
  const pct=Math.min((c/t)*100,100);
  const ok=invert ? c<=t : c>=t;
  const warn=invert ? c<=t*1.3 : c>=t*0.7;
  const barColor = ok?'#22C55E':warn?'#EAB308':'#EF4444';
  return (
    <div style={{marginBottom:12}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:5}}>
        <div style={{fontSize:12,color:'var(--t2)',fontWeight:500}}>{label}</div>
        <div style={{fontSize:11,color:'var(--t3)'}}>
          <span style={{color:barColor,fontWeight:600}}>{prefix}{c}{suffix}</span>
          <span style={{marginLeft:4}}>/ meta {prefix}{t}{suffix}</span>
        </div>
      </div>
      <div style={{height:6,background:'var(--bg5)',borderRadius:3,position:'relative'}}>
        <div style={{height:'100%',width:pct+'%',background:barColor,borderRadius:3,transition:'width .6s ease'}}/>
        <div style={{position:'absolute',top:-2,left:'100%',width:1,height:10,background:'var(--b3)'}}/>
      </div>
      <div style={{fontSize:10,color:barColor,marginTop:3,textAlign:'right',fontWeight:500}}>{pct.toFixed(0)}% da meta</div>
    </div>
  );
}

export function EvolutionPanel({ history, color }){
  const [metric,setMetric]=useState('roas');
  if(!history||history.length<2) return <div style={{color:'var(--t3)',fontSize:12,padding:'20px 0',textAlign:'center'}}>Adicione histórico para ver evolução.</div>;

  const METRICS=[
    {k:'roas',  label:'ROAS',    color:color||'#FF5C2B'},
    {k:'cpa',   label:'CPA',     color:'#EAB308'},
    {k:'score', label:'Score',   color:'#3B82F6'},
    {k:'revenue',label:'Receita',color:'#22C55E'},
    {k:'budget',label:'Budget',  color:'#A855F7'},
  ];
  const sel=METRICS.find(m=>m.k===metric);

  return (
    <div>
      <div style={{display:'flex',gap:4,marginBottom:14,flexWrap:'wrap'}}>
        {METRICS.map(m=>(
          <button key={m.k} onClick={()=>setMetric(m.k)}
            style={{fontSize:11,padding:'4px 10px',borderRadius:20,background:metric===m.k?m.color+'22':'var(--bg4)',color:metric===m.k?m.color:'var(--t3)',border:`1px solid ${metric===m.k?m.color+'44':'var(--b1)'}`,transition:'all .15s',fontWeight:metric===m.k?500:400}}>
            {m.label}
          </button>
        ))}
      </div>
      {metric==='revenue'||metric==='budget'
        ? <BarChart data={history} valueKey={metric} color={sel.color} prefix="R$" height={120}/>
        : <LineChart data={history} keys={[metric]} colors={[sel.color]} labels={[sel.label]} height={140}/>
      }
    </div>
  );
}

export function GoalsPanel({ client }){
  return (
    <div>
      <GoalBar label="ROAS"    current={client.roas}     target={client.meta_roas}    suffix="x"    color={client.color}/>
      <GoalBar label="CPA"     current={client.cpa}      target={client.meta_cpa}     prefix="R$"   invert  color={client.color}/>
      <GoalBar label="Budget"  current={client.budget}   target={client.meta_budget}  prefix="R$"   color={client.color}/>
      <GoalBar label="Receita" current={client.revenue}  target={client.meta_revenue} prefix="R$"   color={client.color}/>
    </div>
  );
}

export function AlertsPanel({ alerts }){
  if(!alerts||!alerts.length) return (
    <div style={{display:'flex',alignItems:'center',gap:8,padding:'10px 14px',background:'rgba(34,197,94,0.08)',border:'1px solid rgba(34,197,94,0.2)',borderRadius:10}}>
      <span style={{fontSize:14}}>✓</span>
      <span style={{fontSize:12,color:'#22C55E'}}>Tudo certo — nenhum alerta ativo.</span>
    </div>
  );
  return (
    <div style={{display:'flex',flexDirection:'column',gap:6}}>
      {alerts.map((a,i)=>{
        const isDanger=a.level==='danger';
        const c=isDanger?'#EF4444':'#EAB308';
        return (
          <div key={i} style={{display:'flex',alignItems:'flex-start',gap:10,padding:'10px 14px',background:c+'10',border:`1px solid ${c}28`,borderRadius:10}}>
            <span style={{fontSize:13,flexShrink:0}}>{isDanger?'🔴':'🟡'}</span>
            <div>
              <div style={{fontSize:10,color:c,fontWeight:600,marginBottom:1,textTransform:'uppercase',letterSpacing:'.06em'}}>{a.metric}</div>
              <div style={{fontSize:12,color:'var(--t1)',lineHeight:1.5}}>{a.msg}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function CampaignTimeline({ campaigns, onAdd, onUpdate, onDelete }){
  const [showForm,setShowForm]=useState(false);
  const [form,setForm]=useState({name:'',status:'planejada',start:'',end:'',budget:'',result:'',color:'#FF5C2B'});
  const COLORS=['#FF5C2B','#22C55E','#EAB308','#3B82F6','#A855F7','#EC4899'];
  const STATUS_C={ativa:'#22C55E',planejada:'#3B82F6',pausada:'#EAB308',concluida:'#555555'};
  const STATUS_L={ativa:'Ativa',planejada:'Planejada',pausada:'Pausada',concluida:'Concluída'};

  function submit(){
    if(!form.name.trim()||!form.start||!form.end)return;
    onAdd({...form,id:'c'+Math.random().toString(36).slice(2,7)});
    setForm({name:'',status:'planejada',start:'',end:'',budget:'',result:'',color:'#FF5C2B'});
    setShowForm(false);
  }

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
        <div style={{fontSize:11,color:'var(--t3)',textTransform:'uppercase',letterSpacing:'.07em'}}>Timeline de campanhas</div>
        <button onClick={()=>setShowForm(o=>!o)} style={{fontSize:11,padding:'4px 12px',borderRadius:6,background:'var(--orangebg)',color:'var(--orange)',border:'1px solid var(--orangeline)'}}>+ Campanha</button>
      </div>

      {showForm&&(
        <div style={{background:'var(--bg3)',border:'1px solid var(--b2)',borderRadius:12,padding:14,marginBottom:14}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8}}>
            <input value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder="Nome da campanha" style={{gridColumn:'1/-1'}}/>
            <select value={form.status} onChange={e=>setForm(p=>({...p,status:e.target.value}))}>
              {Object.entries(STATUS_L).map(([k,l])=><option key={k} value={k}>{l}</option>)}
            </select>
            <input value={form.budget} onChange={e=>setForm(p=>({...p,budget:e.target.value}))} placeholder="Budget R$"/>
            <input type="date" value={form.start} onChange={e=>setForm(p=>({...p,start:e.target.value}))}/>
            <input type="date" value={form.end}   onChange={e=>setForm(p=>({...p,end:e.target.value}))}/>
            <input value={form.result} onChange={e=>setForm(p=>({...p,result:e.target.value}))} placeholder="Resultado (ex: ROAS 4x)" style={{gridColumn:'1/-1'}}/>
            <div style={{gridColumn:'1/-1',display:'flex',gap:6,alignItems:'center'}}>
              <span style={{fontSize:11,color:'var(--t3)'}}>Cor:</span>
              {COLORS.map(c=><div key={c} onClick={()=>setForm(p=>({...p,color:c}))} style={{width:18,height:18,borderRadius:'50%',background:c,cursor:'pointer',outline:form.color===c?'2px solid #fff':'none',outlineOffset:1}}/>)}
            </div>
          </div>
          <div style={{display:'flex',gap:6,justifyContent:'flex-end'}}>
            <button onClick={()=>setShowForm(false)} style={{fontSize:12,padding:'5px 12px',background:'var(--bg4)',borderRadius:7,border:'1px solid var(--b2)'}}>Cancelar</button>
            <button onClick={submit} style={{fontSize:12,padding:'5px 14px',background:'var(--orange)',color:'#fff',borderRadius:7}}>Salvar</button>
          </div>
        </div>
      )}

      {(!campaigns||!campaigns.length)&&(
        <div style={{color:'var(--t3)',fontSize:12,padding:'16px 0',textAlign:'center'}}>Nenhuma campanha cadastrada.</div>
      )}

      <div style={{display:'flex',flexDirection:'column',gap:8}}>
        {(campaigns||[]).map((camp,i)=>(
          <div key={camp.id} style={{display:'flex',alignItems:'center',gap:12,padding:'11px 14px',background:'var(--bg3)',border:`1px solid var(--b1)`,borderRadius:10,borderLeft:`3px solid ${camp.color||STATUS_C[camp.status]||'#555'}`}}>
            <div style={{flex:1}}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
                <div style={{fontSize:13,fontWeight:500,color:'var(--t1)'}}>{camp.name}</div>
                <span style={{fontSize:9,fontWeight:600,padding:'2px 7px',borderRadius:20,background:(STATUS_C[camp.status]||'#555')+'18',color:STATUS_C[camp.status]||'#555',textTransform:'uppercase',letterSpacing:'.06em'}}>{STATUS_L[camp.status]}</span>
              </div>
              <div style={{display:'flex',gap:12,fontSize:11,color:'var(--t3)'}}>
                <span>📅 {camp.start} → {camp.end}</span>
                {camp.budget&&<span>💰 R${camp.budget}</span>}
                {camp.result&&<span style={{color:'#22C55E'}}>✓ {camp.result}</span>}
              </div>
            </div>
            <div style={{display:'flex',gap:4}}>
              <select value={camp.status} onChange={e=>onUpdate(camp.id,{status:e.target.value})}
                style={{fontSize:11,padding:'3px 6px',width:100,background:'var(--bg4)'}}>
                {Object.entries(STATUS_L).map(([k,l])=><option key={k} value={k}>{l}</option>)}
              </select>
              <button onClick={()=>onDelete(camp.id)} style={{color:'var(--t3)',fontSize:15,padding:'0 4px'}}>×</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import React, { useState, useRef } from 'react';
import { uid, scoreColor } from '../store.js';

const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const BLANK = {
  id:'', month:'', year:'', roas:'', cpa:'', ctr:'', cpc:'', cpm:'', budget:'', revenue:'', conversions:'',
  summary:'', actions:'', nextSteps:'', highlight:'', imageData:'', score:0, createdAt:''
};

function fmt(n){ if(!n||n==='')return'—'; return parseFloat(n).toLocaleString('pt-BR',{maximumFractionDigits:2}); }
function fmtR(n){ if(!n||n==='')return'—'; return 'R$ '+parseFloat(n).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2}); }

function MetricPill({ label, value, unit='', color }){
  return (
    <div style={{background:'var(--bg3)',borderRadius:10,padding:'9px 12px',borderTop:`2px solid ${color||'var(--orange)'}`}}>
      <div style={{fontSize:9,color:'var(--t3)',marginBottom:3,textTransform:'uppercase',letterSpacing:'.07em'}}>{label}</div>
      <div style={{fontSize:16,fontFamily:'var(--font-d)',fontWeight:700,color:color||'var(--t1)'}}>{value}{value!=='—'?unit:''}</div>
    </div>
  );
}

function ResultCard({ entry, onEdit, onDelete, clientColor }){
  const [expanded, setExpanded] = useState(false);
  const sc = scoreColor(entry.score||0);

  return (
    <div style={{background:'var(--bg2)',border:'1px solid var(--b2)',borderRadius:16,overflow:'hidden',transition:'border-color .15s'}}
      onMouseEnter={e=>e.currentTarget.style.borderColor=(clientColor||'#FF5C2B')+'40'}
      onMouseLeave={e=>e.currentTarget.style.borderColor='var(--b2)'}>

      {/* Card header */}
      <div style={{padding:'14px 18px',display:'flex',alignItems:'center',gap:12,borderBottom: expanded?'1px solid var(--b1)':'none',cursor:'pointer'}} onClick={()=>setExpanded(o=>!o)}>
        <div style={{width:40,height:40,borderRadius:10,background:(clientColor||'#FF5C2B')+'18',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',flexShrink:0,border:`1px solid ${clientColor||'#FF5C2B'}28`}}>
          <div style={{fontSize:9,color:clientColor||'var(--orange)',fontWeight:600}}>{entry.year}</div>
          <div style={{fontSize:13,color:clientColor||'var(--orange)',fontWeight:800,lineHeight:1}}>{entry.month?.slice(0,3)}</div>
        </div>
        <div style={{flex:1}}>
          <div style={{fontSize:13,fontWeight:600,color:'var(--t1)',marginBottom:3}}>{entry.month} {entry.year}</div>
          {entry.highlight && <div style={{fontSize:11,color:'var(--t3)',lineHeight:1.4}}>{entry.highlight}</div>}
        </div>
        {/* Quick metrics */}
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          {entry.roas&&<div style={{textAlign:'center'}}><div style={{fontSize:9,color:'var(--t3)'}}>ROAS</div><div style={{fontSize:13,fontWeight:700,color:'var(--orange)'}}>{entry.roas}x</div></div>}
          {entry.cpa&&<div style={{textAlign:'center'}}><div style={{fontSize:9,color:'var(--t3)'}}>CPA</div><div style={{fontSize:13,fontWeight:700,color:'var(--yellow)'}}>R${entry.cpa}</div></div>}
          {entry.score>0&&<div style={{fontSize:11,fontWeight:700,padding:'2px 9px',borderRadius:20,background:sc+'18',color:sc,border:`1px solid ${sc}28`}}>{entry.score}</div>}
        </div>
        <div style={{display:'flex',gap:4}}>
          <button onClick={e=>{e.stopPropagation();onEdit(entry);}} style={{fontSize:11,color:'var(--t3)',padding:'3px 8px',borderRadius:6,border:'1px solid var(--b2)',background:'var(--bg3)'}}>✎</button>
          <button onClick={e=>{e.stopPropagation();onDelete(entry.id);}} style={{fontSize:11,color:'var(--t3)',padding:'3px 7px',borderRadius:6,border:'1px solid var(--b2)',background:'var(--bg3)'}}>×</button>
        </div>
        <span style={{fontSize:12,color:'var(--t3)',transition:'transform .2s',display:'inline-block',transform:expanded?'rotate(180deg)':'none'}}>▾</span>
      </div>

      {expanded&&(
        <div style={{padding:'16px 18px'}}>
          {/* Metrics grid */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(90px,1fr))',gap:8,marginBottom:16}}>
            <MetricPill label="ROAS"       value={fmt(entry.roas)}        unit="x"  color='var(--orange)'/>
            <MetricPill label="CPA"        value={fmtR(entry.cpa)}             color='var(--yellow)'/>
            <MetricPill label="CTR"        value={fmt(entry.ctr)}         unit="%" color='#3B82F6'/>
            <MetricPill label="CPC"        value={fmtR(entry.cpc)}             color='#A855F7'/>
            <MetricPill label="CPM"        value={fmtR(entry.cpm)}             color='#14B8A6'/>
            <MetricPill label="Budget"     value={fmtR(entry.budget)}          color='var(--t2)'/>
            <MetricPill label="Receita"    value={fmtR(entry.revenue)}         color='#22C55E'/>
            <MetricPill label="Conversões" value={fmt(entry.conversions,0)}     color='var(--orange)'/>
          </div>

          {/* Image */}
          {entry.imageData&&(
            <div style={{marginBottom:16}}>
              <div style={{fontSize:10,color:'var(--t3)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:8}}>Print do dashboard</div>
              <img src={entry.imageData} alt="Dashboard" style={{width:'100%',borderRadius:10,border:'1px solid var(--b2)',maxHeight:300,objectFit:'cover'}}/>
            </div>
          )}

          {/* Text blocks */}
          {[
            [entry.summary,    '📋 O que aconteceu'],
            [entry.actions,    '✅ Ações tomadas'],
            [entry.nextSteps,  '🎯 Próximos passos'],
          ].map(([text,label])=>text?(
            <div key={label} style={{marginBottom:12}}>
              <div style={{fontSize:10,color:'var(--t3)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:5}}>{label}</div>
              <div style={{fontSize:13,color:'var(--t1)',lineHeight:1.8,background:'var(--bg3)',borderRadius:10,padding:'12px 14px',whiteSpace:'pre-wrap'}}>{text}</div>
            </div>
          ):null)}

          <div style={{fontSize:10,color:'var(--t3)',marginTop:8}}>Registrado em {new Date(entry.createdAt).toLocaleDateString('pt-BR',{day:'2-digit',month:'short',year:'numeric'})}</div>
        </div>
      )}
    </div>
  );
}

function EntryForm({ initial, onSave, onClose }){
  const [form, setForm]   = useState(initial || {...BLANK, id:'r'+uid(), year:new Date().getFullYear().toString(), month:MONTHS[new Date().getMonth()], createdAt:new Date().toISOString()});
  const fileRef           = useRef();

  function set(k,v){ setForm(p=>({...p,[k]:v})); }

  function handleImage(e){
    const file = e.target.files[0];
    if(!file)return;
    const reader = new FileReader();
    reader.onload = ev => set('imageData', ev.target.result);
    reader.readAsDataURL(file);
  }

  function submit(){
    if(!form.month||!form.year)return;
    onSave(form);
  }

  const now = new Date();

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.75)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:400,padding:'16px'}} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{background:'var(--bg2)',border:'1px solid var(--b3)',borderRadius:20,padding:26,width:560,maxWidth:'100%',maxHeight:'90vh',overflowY:'auto',boxShadow:'0 8px 60px rgba(0,0,0,.8)'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
          <div style={{fontFamily:'var(--font-d)',fontSize:17,fontWeight:700}}>{initial?.id?'Editar resultado':'Novo resultado mensal'}</div>
          <button onClick={onClose} style={{color:'var(--t3)',fontSize:22,lineHeight:1}}>×</button>
        </div>

        {/* Period */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10,marginBottom:18}}>
          <div style={{gridColumn:'1/2'}}>
            <label style={{fontSize:11,color:'var(--t3)',display:'block',marginBottom:4}}>Mês *</label>
            <select value={form.month} onChange={e=>set('month',e.target.value)} style={{width:'100%'}}>
              {MONTHS.map(m=><option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label style={{fontSize:11,color:'var(--t3)',display:'block',marginBottom:4}}>Ano *</label>
            <input value={form.year} onChange={e=>set('year',e.target.value)} style={{width:'100%'}} placeholder={now.getFullYear().toString()}/>
          </div>
          <div>
            <label style={{fontSize:11,color:'var(--t3)',display:'block',marginBottom:4}}>Score (0–100)</label>
            <input type="number" min="0" max="100" value={form.score||''} onChange={e=>set('score',parseInt(e.target.value)||0)} style={{width:'100%'}} placeholder="82"/>
          </div>
        </div>

        {/* Metrics */}
        <div style={{fontSize:11,color:'var(--t3)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:10}}>Métricas do período</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,marginBottom:20}}>
          {[['ROAS','roas','Ex: 4.2'],['CPA','cpa','Ex: 18'],['CTR %','ctr','Ex: 3.1'],['CPC','cpc','Ex: 0.58'],['CPM','cpm','Ex: 12'],['Budget','budget','Ex: 5000'],['Receita','revenue','Ex: 21000'],['Conversões','conversions','Ex: 280']].map(([l,k,ph])=>(
            <div key={k}>
              <label style={{fontSize:10,color:'var(--t3)',display:'block',marginBottom:3}}>{l}</label>
              <input type="number" value={form[k]||''} onChange={e=>set(k,e.target.value)} style={{width:'100%',padding:'6px 10px'}} placeholder={ph}/>
            </div>
          ))}
        </div>

        {/* Highlight */}
        <div style={{marginBottom:14}}>
          <label style={{fontSize:11,color:'var(--t3)',display:'block',marginBottom:4}}>Destaque do mês (aparece no card fechado)</label>
          <input value={form.highlight||''} onChange={e=>set('highlight',e.target.value)} style={{width:'100%'}} placeholder="Ex: Melhor ROAS do trimestre, campanha de remarketing bombou..."/>
        </div>

        {/* Text areas */}
        {[['summary','📋 O que aconteceu — resumo do mês','Descreva os principais acontecimentos, resultados gerais, contexto da conta...'],
          ['actions','✅ Ações tomadas','O que foi feito durante o mês? Novos criativos, mudanças de estratégia, otimizações...'],
          ['nextSteps','🎯 Próximos passos','O que será feito no próximo período? Testes planejados, aumentos de budget, novos públicos...']
        ].map(([k,label,ph])=>(
          <div key={k} style={{marginBottom:14}}>
            <label style={{fontSize:11,color:'var(--t3)',display:'block',marginBottom:4}}>{label}</label>
            <textarea value={form[k]||''} onChange={e=>set(k,e.target.value)} placeholder={ph} style={{width:'100%',minHeight:80,resize:'vertical',lineHeight:1.7,fontSize:13}}/>
          </div>
        ))}

        {/* Image upload */}
        <div style={{marginBottom:20}}>
          <label style={{fontSize:11,color:'var(--t3)',display:'block',marginBottom:8}}>Print do dashboard (opcional)</label>
          <input type="file" accept="image/*" ref={fileRef} onChange={handleImage} style={{display:'none'}}/>
          {form.imageData?(
            <div style={{position:'relative'}}>
              <img src={form.imageData} alt="preview" style={{width:'100%',borderRadius:10,border:'1px solid var(--b2)',maxHeight:200,objectFit:'cover'}}/>
              <button onClick={()=>set('imageData','')} style={{position:'absolute',top:8,right:8,background:'rgba(0,0,0,0.6)',color:'#fff',borderRadius:6,fontSize:12,padding:'3px 8px'}}>Remover</button>
            </div>
          ):(
            <button onClick={()=>fileRef.current.click()} style={{width:'100%',padding:'14px',border:'1px dashed var(--b3)',borderRadius:10,color:'var(--t3)',fontSize:13,transition:'all .15s',background:'transparent'}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--orange)';e.currentTarget.style.color='var(--orange)';}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--b3)';e.currentTarget.style.color='var(--t3)';}}>
              📎 Clique para anexar print do dashboard
            </button>
          )}
        </div>

        <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
          <button onClick={onClose} style={{padding:'9px 18px',background:'var(--bg3)',borderRadius:9,border:'1px solid var(--b2)',fontSize:13}}>Cancelar</button>
          <button onClick={submit} style={{padding:'9px 24px',background:'var(--orange)',color:'#fff',borderRadius:9,fontSize:13,fontWeight:600,boxShadow:'var(--shadow-o)'}}>Salvar resultado</button>
        </div>
      </div>
    </div>
  );
}

export default function Results({ results=[], onChange, clientColor, clientName }){
  const [showForm, setShowForm] = useState(false);
  const [editing,  setEditing]  = useState(null);
  const [filter,   setFilter]   = useState('');

  function openNew()    { setEditing(null); setShowForm(true); }
  function openEdit(e)  { setEditing(e);    setShowForm(true); }
  function onDelete(id) { if(confirm('Deletar este resultado?')) onChange(results.filter(r=>r.id!==id)); }

  function onSave(form){
    if(editing){
      onChange(results.map(r=>r.id===form.id?form:r));
    } else {
      onChange([form,...results]);
    }
    setShowForm(false); setEditing(null);
  }

  const sorted   = [...results].sort((a,b)=>{
    const months = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
    const ai = parseInt(a.year)*12+months.indexOf(a.month);
    const bi = parseInt(b.year)*12+months.indexOf(b.month);
    return bi-ai;
  });
  const filtered = filter ? sorted.filter(r=>r.month===filter||r.year===filter) : sorted;

  // Stats from latest entry
  const latest   = sorted[0];
  const prev     = sorted[1];
  const roasDiff = latest&&prev&&latest.roas&&prev.roas ? ((parseFloat(latest.roas)-parseFloat(prev.roas))/parseFloat(prev.roas)*100).toFixed(1) : null;
  const cpaDiff  = latest&&prev&&latest.cpa&&prev.cpa   ? ((parseFloat(latest.cpa) -parseFloat(prev.cpa)) /parseFloat(prev.cpa) *100).toFixed(1) : null;

  return (
    <div style={{height:'100%',display:'flex',flexDirection:'column',overflow:'hidden'}}>
      {/* Header */}
      <div style={{padding:'14px 20px',borderBottom:'1px solid var(--b2)',background:'var(--bg2)',flexShrink:0,display:'flex',alignItems:'center',gap:12,flexWrap:'wrap'}}>
        <div>
          <div style={{fontFamily:'var(--font-d)',fontSize:16,fontWeight:700}}>Resultados mensais</div>
          <div style={{fontSize:11,color:'var(--t3)',marginTop:2}}>{results.length} registro{results.length!==1?'s':''} · {clientName}</div>
        </div>

        {/* Vs last month */}
        {roasDiff!==null&&(
          <div style={{display:'flex',gap:10,marginLeft:8}}>
            <div style={{background:'var(--bg3)',borderRadius:9,padding:'6px 12px'}}>
              <div style={{fontSize:9,color:'var(--t3)',marginBottom:1}}>ROAS vs mês ant.</div>
              <div style={{fontSize:13,fontWeight:700,color:parseFloat(roasDiff)>=0?'#22C55E':'#EF4444'}}>
                {parseFloat(roasDiff)>=0?'+':''}{roasDiff}%
              </div>
            </div>
            {cpaDiff!==null&&(
              <div style={{background:'var(--bg3)',borderRadius:9,padding:'6px 12px'}}>
                <div style={{fontSize:9,color:'var(--t3)',marginBottom:1}}>CPA vs mês ant.</div>
                <div style={{fontSize:13,fontWeight:700,color:parseFloat(cpaDiff)<=0?'#22C55E':'#EF4444'}}>
                  {parseFloat(cpaDiff)>=0?'+':''}{cpaDiff}%
                </div>
              </div>
            )}
          </div>
        )}

        <div style={{marginLeft:'auto',display:'flex',gap:8,alignItems:'center'}}>
          <select value={filter} onChange={e=>setFilter(e.target.value)} style={{fontSize:12,padding:'5px 8px',width:130}}>
            <option value="">Todos os meses</option>
            {[...new Set(sorted.map(r=>r.month))].map(m=><option key={m} value={m}>{m}</option>)}
          </select>
          <button onClick={openNew} style={{padding:'8px 18px',background:'var(--orange)',color:'#fff',borderRadius:9,fontWeight:600,fontSize:12,boxShadow:'var(--shadow-o)',whiteSpace:'nowrap'}}>
            + Novo resultado
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{flex:1,overflowY:'auto',padding:'16px 20px'}}>
        {filtered.length===0&&(
          <div style={{textAlign:'center',padding:'60px 0',color:'var(--t3)'}}>
            <div style={{fontSize:32,marginBottom:12}}>📊</div>
            <div style={{fontSize:14,fontWeight:500,marginBottom:6}}>Nenhum resultado registrado ainda</div>
            <div style={{fontSize:12,marginBottom:20}}>Registre os resultados mensais do cliente para acompanhar a evolução.</div>
            <button onClick={openNew} style={{padding:'10px 24px',background:'var(--orange)',color:'#fff',borderRadius:10,fontWeight:600,fontSize:13,boxShadow:'var(--shadow-o)'}}>
              + Registrar primeiro resultado
            </button>
          </div>
        )}
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {filtered.map(entry=>(
            <ResultCard key={entry.id} entry={entry} onEdit={openEdit} onDelete={onDelete} clientColor={clientColor}/>
          ))}
        </div>
      </div>

      {showForm&&(
        <EntryForm initial={editing} onSave={onSave} onClose={()=>{setShowForm(false);setEditing(null);}}/>
      )}
    </div>
  );
}

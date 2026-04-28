import React, { useState } from 'react';
import { uid } from '../store.js';

const STAGES = [
  { id:'lead',      label:'Lead',      color:'#555' },
  { id:'contato',   label:'Contato',   color:'#3B82F6' },
  { id:'proposta',  label:'Proposta',  color:'#EAB308' },
  { id:'negociacao',label:'Negociação',color:'#F97316' },
  { id:'fechado',   label:'Fechado',   color:'#22C55E' },
  { id:'perdido',   label:'Perdido',   color:'#EF4444' },
];

const BLANK = { name:'', niche:'', platform:'', budget:'', contact:'', notes:'', value:'' };

function Card({ lead, onMove, onEdit, onDelete, stages }) {
  const stage = stages.find(s=>s.id===lead.stage)||stages[0];
  return (
    <div style={{ background:'var(--bg3)', border:'1px solid var(--b2)', borderRadius:12, padding:'12px 14px', marginBottom:8, borderLeft:`3px solid ${stage.color}`, cursor:'pointer', transition:'all .15s' }}
      onMouseEnter={e=>e.currentTarget.style.borderColor=stage.color}
      onMouseLeave={e=>e.currentTarget.style.borderLeftColor=stage.color}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
        <div style={{ fontSize:13, fontWeight:600, color:'var(--t1)', lineHeight:1.3 }}>{lead.name}</div>
        <div style={{ display:'flex', gap:4 }}>
          <button onClick={()=>onEdit(lead)} style={{ fontSize:11, color:'var(--t3)', padding:'1px 6px', borderRadius:4, border:'1px solid var(--b2)', background:'var(--bg4)' }}>✎</button>
          <button onClick={()=>onDelete(lead.id)} style={{ fontSize:11, color:'var(--t3)', padding:'1px 6px', borderRadius:4, border:'1px solid var(--b2)', background:'var(--bg4)' }}>×</button>
        </div>
      </div>
      <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:8 }}>
        {lead.niche    && <span style={{ fontSize:10, padding:'1px 7px', borderRadius:20, background:stage.color+'18', color:stage.color }}>{lead.niche}</span>}
        {lead.platform && <span style={{ fontSize:10, padding:'1px 7px', borderRadius:20, background:'rgba(255,255,255,0.06)', color:'var(--t3)' }}>{lead.platform}</span>}
      </div>
      {lead.value && <div style={{ fontSize:12, color:'#22C55E', fontWeight:600, marginBottom:6 }}>💰 R$ {parseFloat(lead.value).toLocaleString('pt-BR')}/mês</div>}
      {lead.contact && <div style={{ fontSize:11, color:'var(--t3)', marginBottom:6 }}>📱 {lead.contact}</div>}
      {lead.notes && <div style={{ fontSize:11, color:'var(--t3)', lineHeight:1.5, borderTop:'1px solid var(--b1)', paddingTop:6, marginTop:4 }}>{lead.notes}</div>}
      {/* Move buttons */}
      <div style={{ display:'flex', gap:4, marginTop:8, flexWrap:'wrap' }}>
        {stages.filter(s=>s.id!==lead.stage).map(s=>(
          <button key={s.id} onClick={()=>onMove(lead.id, s.id)}
            style={{ fontSize:9, padding:'2px 7px', borderRadius:20, background:s.color+'18', color:s.color, border:`1px solid ${s.color}28`, fontWeight:500 }}>
            → {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function CRM({ leads=[], onChange }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]   = useState(null);
  const [form, setForm]         = useState({ ...BLANK, stage:'lead' });
  const [search, setSearch]     = useState('');

  function openNew(stage='lead') { setForm({ ...BLANK, stage }); setEditing(null); setShowForm(true); }
  function openEdit(lead) { setForm({ ...lead }); setEditing(lead.id); setShowForm(true); }

  function save() {
    if (!form.name.trim()) return;
    if (editing) {
      onChange(leads.map(l => l.id === editing ? { ...form } : l));
    } else {
      onChange([...leads, { ...form, id: 'lead'+uid(), createdAt: new Date().toISOString() }]);
    }
    setShowForm(false);
  }

  function move(id, stage) { onChange(leads.map(l => l.id===id ? { ...l, stage } : l)); }
  function del(id) { onChange(leads.filter(l=>l.id!==id)); }

  const filtered = leads.filter(l => l.name.toLowerCase().includes(search.toLowerCase()));
  const totalValue = leads.filter(l=>l.stage==='fechado').reduce((s,l)=>s+parseFloat(l.value||0),0);
  const pipeline   = leads.filter(l=>l.stage!=='fechado'&&l.stage!=='perdido').reduce((s,l)=>s+parseFloat(l.value||0),0);

  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', overflow:'hidden' }}>
      {/* Header */}
      <div style={{ padding:'14px 20px', borderBottom:'1px solid var(--b2)', background:'var(--bg2)', flexShrink:0, display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
        <div style={{ fontFamily:'var(--font-d)', fontSize:20, fontWeight:800 }}>CRM</div>
        <div style={{ display:'flex', gap:10 }}>
          <div style={{ background:'var(--bg3)', borderRadius:9, padding:'6px 12px' }}>
            <div style={{ fontSize:9, color:'var(--t3)', marginBottom:1 }}>PIPELINE</div>
            <div style={{ fontSize:13, fontWeight:600, color:'var(--orange)' }}>R$ {pipeline.toLocaleString('pt-BR')}</div>
          </div>
          <div style={{ background:'var(--bg3)', borderRadius:9, padding:'6px 12px' }}>
            <div style={{ fontSize:9, color:'var(--t3)', marginBottom:1 }}>FECHADOS</div>
            <div style={{ fontSize:13, fontWeight:600, color:'#22C55E' }}>R$ {totalValue.toLocaleString('pt-BR')}/mês</div>
          </div>
        </div>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar..." style={{ fontSize:12, padding:'5px 10px', width:160 }}/>
        <button onClick={()=>openNew()} style={{ marginLeft:'auto', padding:'7px 16px', background:'var(--orange)', color:'#fff', borderRadius:8, fontWeight:600, fontSize:12, boxShadow:'var(--shadow-o)' }}>+ Novo lead</button>
      </div>

      {/* Kanban board */}
      <div style={{ flex:1, overflowX:'auto', overflowY:'hidden', display:'flex', gap:12, padding:'16px 20px' }}>
        {STAGES.map(stage => {
          const cards = filtered.filter(l=>l.stage===stage.id);
          const stageVal = cards.reduce((s,l)=>s+parseFloat(l.value||0),0);
          return (
            <div key={stage.id} style={{ width:220, flexShrink:0, display:'flex', flexDirection:'column' }}>
              {/* Column header */}
              <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:10, padding:'0 2px' }}>
                <div style={{ width:8, height:8, borderRadius:'50%', background:stage.color }}/>
                <span style={{ fontSize:12, fontWeight:600, color:'var(--t2)' }}>{stage.label}</span>
                <span style={{ fontSize:10, color:'var(--t3)', background:'var(--bg3)', padding:'1px 6px', borderRadius:20 }}>{cards.length}</span>
                {stageVal>0&&<span style={{ fontSize:10, color:stage.color, marginLeft:'auto' }}>R${stageVal.toLocaleString('pt-BR')}</span>}
              </div>
              {/* Cards */}
              <div style={{ flex:1, overflowY:'auto', paddingRight:2 }}>
                {cards.map(lead=>(
                  <Card key={lead.id} lead={lead} stages={STAGES} onMove={move} onEdit={openEdit} onDelete={del}/>
                ))}
                <button onClick={()=>openNew(stage.id)} style={{ width:'100%', padding:'8px', borderRadius:9, border:'1px dashed var(--b2)', color:'var(--t3)', fontSize:12, transition:'all .15s', marginTop:4, background:'transparent' }}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=stage.color;e.currentTarget.style.color=stage.color;}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--b2)';e.currentTarget.style.color='var(--t3)';}}>
                  + Lead
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Form modal */}
      {showForm&&(
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:300 }} onClick={e=>e.target===e.currentTarget&&setShowForm(false)}>
          <div style={{ background:'var(--bg2)', border:'1px solid var(--b3)', borderRadius:18, padding:24, width:380, maxWidth:'95vw' }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:18 }}>
              <div style={{ fontFamily:'var(--font-d)', fontSize:16, fontWeight:700 }}>{editing?'Editar lead':'Novo lead'}</div>
              <button onClick={()=>setShowForm(false)} style={{ color:'var(--t3)', fontSize:20 }}>×</button>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              {[['Nome *','name','text','1/-1'],['Nicho','niche','text',''],['Plataforma','platform','text',''],['Contato','contact','text','1/-1'],['Budget mensal','value','number',''],['','','','']].map(([l,k,t,col])=>l?(
                <div key={k} style={{ gridColumn:col||undefined }}>
                  <label style={{ fontSize:11, color:'var(--t3)', display:'block', marginBottom:3 }}>{l}</label>
                  <input type={t} value={form[k]||''} onChange={e=>setForm(p=>({...p,[k]:e.target.value}))} style={{ width:'100%' }} placeholder={l.replace(' *','')}/>
                </div>
              ):null)}
              <div style={{ gridColumn:'1/-1' }}>
                <label style={{ fontSize:11, color:'var(--t3)', display:'block', marginBottom:3 }}>Estágio</label>
                <select value={form.stage} onChange={e=>setForm(p=>({...p,stage:e.target.value}))} style={{ width:'100%' }}>
                  {STAGES.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              </div>
              <div style={{ gridColumn:'1/-1' }}>
                <label style={{ fontSize:11, color:'var(--t3)', display:'block', marginBottom:3 }}>Notas</label>
                <textarea value={form.notes||''} onChange={e=>setForm(p=>({...p,notes:e.target.value}))} style={{ width:'100%', minHeight:70, resize:'vertical' }} placeholder="Observações sobre o lead..."/>
              </div>
            </div>
            <div style={{ display:'flex', gap:8, justifyContent:'flex-end', marginTop:16 }}>
              <button onClick={()=>setShowForm(false)} style={{ padding:'8px 16px', background:'var(--bg3)', borderRadius:8, border:'1px solid var(--b2)', fontSize:13 }}>Cancelar</button>
              <button onClick={save} style={{ padding:'8px 20px', background:'var(--orange)', color:'#fff', borderRadius:8, fontSize:13, fontWeight:600 }}>Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

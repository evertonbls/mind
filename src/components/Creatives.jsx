import React, { useState } from 'react';
import { uid } from '../store.js';

const FORMATS  = ['Vídeo','Carrossel','Imagem estática','Stories','Reels','GIF'];
const PLATFORMS= ['Meta','Google','TikTok','LinkedIn','YouTube','Pinterest'];
const RESULTS  = ['Melhor','Bom','Médio','Ruim','Pausado'];
const RES_C    = { Melhor:'#22C55E',Bom:'#3B82F6',Médio:'#EAB308',Ruim:'#EF4444',Pausado:'#555' };
const BLANK    = { title:'', client:'', format:'Vídeo', platform:'Meta', hook:'', ctr:'', cpa:'', roas:'', result:'Médio', notes:'', tags:'', link:'' };

function CreativeCard({ c, onEdit, onDelete }) {
  const rc = RES_C[c.result]||'#555';
  return (
    <div style={{ background:'var(--bg2)', border:'1px solid var(--b2)', borderRadius:14, padding:16, transition:'all .15s' }}
      onMouseEnter={e=>e.currentTarget.style.borderColor=rc+'60'}
      onMouseLeave={e=>e.currentTarget.style.borderColor='var(--b2)'}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:13, fontWeight:600, marginBottom:4, lineHeight:1.4 }}>{c.title||'Sem título'}</div>
          <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
            <span style={{ fontSize:10, padding:'1px 7px', borderRadius:20, background:rc+'18', color:rc, fontWeight:600 }}>{c.result}</span>
            <span style={{ fontSize:10, padding:'1px 7px', borderRadius:20, background:'rgba(255,255,255,0.06)', color:'var(--t3)' }}>{c.format}</span>
            <span style={{ fontSize:10, padding:'1px 7px', borderRadius:20, background:'rgba(255,92,43,0.1)', color:'var(--orange)' }}>{c.platform}</span>
            {c.client&&<span style={{ fontSize:10, padding:'1px 7px', borderRadius:20, background:'rgba(59,130,246,0.1)', color:'#3B82F6' }}>{c.client}</span>}
          </div>
        </div>
        <div style={{ display:'flex', gap:4 }}>
          <button onClick={()=>onEdit(c)} style={{ fontSize:11, color:'var(--t3)', padding:'2px 7px', borderRadius:5, border:'1px solid var(--b2)', background:'var(--bg3)' }}>✎</button>
          <button onClick={()=>onDelete(c.id)} style={{ fontSize:11, color:'var(--t3)', padding:'2px 6px', borderRadius:5, border:'1px solid var(--b2)', background:'var(--bg3)' }}>×</button>
        </div>
      </div>

      {/* Métricas */}
      {(c.ctr||c.cpa||c.roas) && (
        <div style={{ display:'flex', gap:8, marginBottom:10 }}>
          {c.ctr  && <div style={{ background:'var(--bg3)', borderRadius:7, padding:'5px 9px' }}><div style={{ fontSize:9, color:'var(--t3)' }}>CTR</div><div style={{ fontSize:12, fontWeight:600 }}>{c.ctr}%</div></div>}
          {c.cpa  && <div style={{ background:'var(--bg3)', borderRadius:7, padding:'5px 9px' }}><div style={{ fontSize:9, color:'var(--t3)' }}>CPA</div><div style={{ fontSize:12, fontWeight:600 }}>R${c.cpa}</div></div>}
          {c.roas && <div style={{ background:'var(--bg3)', borderRadius:7, padding:'5px 9px' }}><div style={{ fontSize:9, color:'var(--t3)' }}>ROAS</div><div style={{ fontSize:12, fontWeight:600 }}>{c.roas}x</div></div>}
        </div>
      )}

      {c.hook  && <div style={{ fontSize:12, color:'var(--t2)', fontStyle:'italic', marginBottom:6, borderLeft:'2px solid var(--orange)', paddingLeft:8 }}>"{c.hook}"</div>}
      {c.notes && <div style={{ fontSize:11, color:'var(--t3)', lineHeight:1.5, marginBottom:6 }}>{c.notes}</div>}
      {c.link  && <a href={c.link} target="_blank" rel="noreferrer" style={{ fontSize:11, color:'var(--orange)', textDecoration:'none' }}>🔗 Ver criativo</a>}
      {c.tags  && <div style={{ display:'flex', gap:4, flexWrap:'wrap', marginTop:8 }}>{c.tags.split(',').map(t=>t.trim()).filter(Boolean).map(t=><span key={t} style={{ fontSize:9, padding:'1px 7px', borderRadius:20, background:'var(--bg4)', color:'var(--t3)' }}>{t}</span>)}</div>}
    </div>
  );
}

export default function Creatives({ creatives=[], clients=[], onChange }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState(BLANK);
  const [editId, setEditId]     = useState(null);
  const [filter, setFilter]     = useState({ platform:'', result:'', client:'', search:'' });

  function openNew()   { setForm(BLANK); setEditId(null); setShowForm(true); }
  function openEdit(c) { setForm({...c}); setEditId(c.id); setShowForm(true); }

  function save() {
    if(!form.title.trim()) return;
    const updated = editId
      ? creatives.map(c=>c.id===editId?{...form,id:editId}:c)
      : [...creatives,{...form,id:'cr'+uid(),createdAt:new Date().toISOString()}];
    onChange(updated); setShowForm(false); setForm(BLANK); setEditId(null);
  }

  function del(id) { onChange(creatives.filter(c=>c.id!==id)); }

  const filtered = creatives.filter(c=>{
    if(filter.platform&&c.platform!==filter.platform)return false;
    if(filter.result  &&c.result  !==filter.result)  return false;
    if(filter.client  &&c.client  !==filter.client)  return false;
    if(filter.search  &&!c.title.toLowerCase().includes(filter.search.toLowerCase())&&!c.hook?.toLowerCase().includes(filter.search.toLowerCase()))return false;
    return true;
  });

  const bestCount = creatives.filter(c=>c.result==='Melhor').length;
  const clientList = [...new Set(creatives.map(c=>c.client).filter(Boolean))];

  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', overflow:'hidden' }}>
      {/* Header */}
      <div style={{ padding:'14px 20px', borderBottom:'1px solid var(--b2)', background:'var(--bg2)', flexShrink:0, display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
        <div style={{ fontFamily:'var(--font-d)', fontSize:20, fontWeight:800 }}>Criativos</div>
        <div style={{ display:'flex', gap:10 }}>
          <div style={{ background:'var(--bg3)', borderRadius:9, padding:'6px 12px' }}>
            <div style={{ fontSize:9, color:'var(--t3)', marginBottom:1 }}>TOTAL</div>
            <div style={{ fontSize:13, fontWeight:600 }}>{creatives.length}</div>
          </div>
          <div style={{ background:'var(--bg3)', borderRadius:9, padding:'6px 12px' }}>
            <div style={{ fontSize:9, color:'var(--t3)', marginBottom:1 }}>MELHORES</div>
            <div style={{ fontSize:13, fontWeight:600, color:'#22C55E' }}>{bestCount}</div>
          </div>
        </div>
        <button onClick={openNew} style={{ marginLeft:'auto', padding:'7px 16px', background:'var(--orange)', color:'#fff', borderRadius:8, fontWeight:600, fontSize:12, boxShadow:'var(--shadow-o)' }}>+ Criativo</button>
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap:8, padding:'10px 20px', borderBottom:'1px solid var(--b1)', flexShrink:0, flexWrap:'wrap', background:'var(--bg2)' }}>
        <input value={filter.search} onChange={e=>setFilter(p=>({...p,search:e.target.value}))} placeholder="Buscar..." style={{ fontSize:12, padding:'5px 10px', width:160 }}/>
        {[['platform','Plataforma',PLATFORMS],['result','Resultado',RESULTS],['client','Cliente',clientList]].map(([k,ph,opts])=>(
          <select key={k} value={filter[k]} onChange={e=>setFilter(p=>({...p,[k]:e.target.value}))} style={{ fontSize:12, padding:'5px 8px' }}>
            <option value="">Todos — {ph}</option>
            {opts.map(o=><option key={o} value={o}>{o}</option>)}
          </select>
        ))}
        {Object.values(filter).some(v=>v)&&<button onClick={()=>setFilter({platform:'',result:'',client:'',search:''})} style={{ fontSize:12, color:'var(--orange)', padding:'4px 10px', borderRadius:6, border:'1px solid var(--orangeline)', background:'var(--orangebg)' }}>Limpar</button>}
      </div>

      {/* Grid */}
      <div style={{ flex:1, overflowY:'auto', padding:'16px 20px' }}>
        {filtered.length===0&&<div style={{ color:'var(--t3)', fontSize:13, textAlign:'center', padding:'40px 0' }}>Nenhum criativo encontrado.</div>}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:12 }}>
          {filtered.map(c=><CreativeCard key={c.id} c={c} onEdit={openEdit} onDelete={del}/>)}
        </div>
      </div>

      {/* Form */}
      {showForm&&(
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.72)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:300 }} onClick={e=>e.target===e.currentTarget&&setShowForm(false)}>
          <div style={{ background:'var(--bg2)', border:'1px solid var(--b3)', borderRadius:18, padding:24, width:460, maxWidth:'95vw', maxHeight:'90vh', overflowY:'auto' }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:18 }}>
              <div style={{ fontFamily:'var(--font-d)', fontSize:16, fontWeight:700 }}>{editId?'Editar criativo':'Novo criativo'}</div>
              <button onClick={()=>setShowForm(false)} style={{ color:'var(--t3)', fontSize:20 }}>×</button>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              <div style={{ gridColumn:'1/-1' }}>
                <label style={{ fontSize:11, color:'var(--t3)', display:'block', marginBottom:3 }}>Título *</label>
                <input value={form.title||''} onChange={e=>setForm(p=>({...p,title:e.target.value}))} style={{ width:'100%' }} placeholder="Nome do criativo" autoFocus/>
              </div>
              {[['Formato','format',FORMATS],['Plataforma','platform',PLATFORMS],['Resultado','result',RESULTS]].map(([l,k,opts])=>(
                <div key={k}>
                  <label style={{ fontSize:11, color:'var(--t3)', display:'block', marginBottom:3 }}>{l}</label>
                  <select value={form[k]||''} onChange={e=>setForm(p=>({...p,[k]:e.target.value}))} style={{ width:'100%' }}>
                    {opts.map(o=><option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              ))}
              <div>
                <label style={{ fontSize:11, color:'var(--t3)', display:'block', marginBottom:3 }}>Cliente</label>
                <input value={form.client||''} onChange={e=>setForm(p=>({...p,client:e.target.value}))} style={{ width:'100%' }} placeholder="Nome do cliente"/>
              </div>
              {[['CTR %','ctr'],['CPA','cpa'],['ROAS','roas']].map(([l,k])=>(
                <div key={k}>
                  <label style={{ fontSize:11, color:'var(--t3)', display:'block', marginBottom:3 }}>{l}</label>
                  <input type="number" value={form[k]||''} onChange={e=>setForm(p=>({...p,[k]:e.target.value}))} style={{ width:'100%' }} placeholder="—"/>
                </div>
              ))}
              <div style={{ gridColumn:'1/-1' }}>
                <label style={{ fontSize:11, color:'var(--t3)', display:'block', marginBottom:3 }}>Hook (primeiros segundos)</label>
                <input value={form.hook||''} onChange={e=>setForm(p=>({...p,hook:e.target.value}))} style={{ width:'100%' }} placeholder="O que chama atenção no início..."/>
              </div>
              <div style={{ gridColumn:'1/-1' }}>
                <label style={{ fontSize:11, color:'var(--t3)', display:'block', marginBottom:3 }}>Observações</label>
                <textarea value={form.notes||''} onChange={e=>setForm(p=>({...p,notes:e.target.value}))} style={{ width:'100%', minHeight:70, resize:'vertical' }} placeholder="O que funcionou, o que não funcionou..."/>
              </div>
              <div style={{ gridColumn:'1/-1' }}>
                <label style={{ fontSize:11, color:'var(--t3)', display:'block', marginBottom:3 }}>Link do criativo</label>
                <input value={form.link||''} onChange={e=>setForm(p=>({...p,link:e.target.value}))} style={{ width:'100%' }} placeholder="https://drive.google.com/..."/>
              </div>
              <div style={{ gridColumn:'1/-1' }}>
                <label style={{ fontSize:11, color:'var(--t3)', display:'block', marginBottom:3 }}>Tags (separadas por vírgula)</label>
                <input value={form.tags||''} onChange={e=>setForm(p=>({...p,tags:e.target.value}))} style={{ width:'100%' }} placeholder="ugc, oferta, produto, remarketing..."/>
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

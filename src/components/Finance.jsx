import React, { useState } from 'react';
import { uid } from '../store.js';

const STATUS_C = { pago:'#22C55E', pendente:'#EAB308', atrasado:'#EF4444', cancelado:'#555' };
const STATUS_L = { pago:'Pago', pendente:'Pendente', atrasado:'Atrasado', cancelado:'Cancelado' };

function fmt(n){ return isNaN(n)?'—':'R$ '+parseFloat(n).toLocaleString('pt-BR',{minimumFractionDigits:2}); }

const BLANK_C = { clientName:'', value:'', startDate:'', endDate:'', notes:'', type:'mensal' };
const BLANK_P = { description:'', amount:'', dueDate:'', status:'pendente', contractId:'' };

export default function Finance({ contracts=[], payments=[], clients=[], onContracts, onPayments }) {
  const [tab, setTab]         = useState('resumo');
  const [showCForm, setShowCF]= useState(false);
  const [showPForm, setShowPF]= useState(false);
  const [cForm, setCForm]     = useState(BLANK_C);
  const [pForm, setPForm]     = useState(BLANK_P);
  const [editC, setEditC]     = useState(null);
  const [editP, setEditP]     = useState(null);

  // Stats
  const mrr   = contracts.filter(c=>c.type==='mensal'&&c.active!==false).reduce((s,c)=>s+parseFloat(c.value||0),0);
  const pago   = payments.filter(p=>p.status==='pago').reduce((s,p)=>s+parseFloat(p.amount||0),0);
  const pendente = payments.filter(p=>p.status==='pendente').reduce((s,p)=>s+parseFloat(p.amount||0),0);
  const atrasado = payments.filter(p=>p.status==='atrasado').reduce((s,p)=>s+parseFloat(p.amount||0),0);

  function saveC() {
    if(!cForm.clientName.trim()||!cForm.value) return;
    const updated = editC
      ? contracts.map(c=>c.id===editC?{...cForm,id:editC,active:true}:c)
      : [...contracts,{...cForm,id:'ct'+uid(),active:true,createdAt:new Date().toISOString()}];
    onContracts(updated); setShowCF(false); setCForm(BLANK_C); setEditC(null);
  }

  function saveP() {
    if(!pForm.description.trim()||!pForm.amount) return;
    const updated = editP
      ? payments.map(p=>p.id===editP?{...pForm,id:editP}:p)
      : [...payments,{...pForm,id:'py'+uid(),createdAt:new Date().toISOString()}];
    onPayments(updated); setShowPF(false); setPForm(BLANK_P); setEditP(null);
  }

  function toggleContract(id) { onContracts(contracts.map(c=>c.id===id?{...c,active:!c.active}:c)); }
  function delContract(id)    { onContracts(contracts.filter(c=>c.id!==id)); }
  function setPayStatus(id,s) { onPayments(payments.map(p=>p.id===id?{...p,status:s}:p)); }
  function delPayment(id)     { onPayments(payments.filter(p=>p.id!==id)); }

  function openEditC(c){ setCForm({...c}); setEditC(c.id); setShowCF(true); }
  function openEditP(p){ setPForm({...p}); setEditP(p.id); setShowPF(true); }

  const TABS=[['resumo','Resumo'],['contratos','Contratos'],['pagamentos','Pagamentos']];

  return (
    <div style={{height:'100%',display:'flex',flexDirection:'column',overflow:'hidden'}}>
      {/* Header */}
      <div style={{padding:'14px 20px',borderBottom:'1px solid var(--b2)',background:'var(--bg2)',flexShrink:0,display:'flex',alignItems:'center',gap:12,flexWrap:'wrap'}}>
        <div style={{fontFamily:'var(--font-d)',fontSize:20,fontWeight:800}}>Financeiro</div>
        <div style={{display:'flex',gap:2,background:'var(--bg3)',borderRadius:10,padding:3,marginLeft:'auto'}}>
          {TABS.map(([t,l])=>(
            <button key={t} onClick={()=>setTab(t)} style={{fontSize:12,padding:'5px 14px',borderRadius:8,background:tab===t?'var(--bg)':'transparent',color:tab===t?'var(--orange)':'var(--t2)',border:tab===t?'1px solid var(--b2)':'none',transition:'all .15s',fontWeight:tab===t?500:400}}>{l}</button>
          ))}
        </div>
        {tab==='contratos'&&<button onClick={()=>{setCForm(BLANK_C);setEditC(null);setShowCF(true);}} style={{padding:'7px 16px',background:'var(--orange)',color:'#fff',borderRadius:8,fontWeight:600,fontSize:12,boxShadow:'var(--shadow-o)'}}>+ Contrato</button>}
        {tab==='pagamentos'&&<button onClick={()=>{setPForm(BLANK_P);setEditP(null);setShowPF(true);}} style={{padding:'7px 16px',background:'var(--orange)',color:'#fff',borderRadius:8,fontWeight:600,fontSize:12,boxShadow:'var(--shadow-o)'}}>+ Lançamento</button>}
      </div>

      <div style={{flex:1,overflowY:'auto',padding:'18px 20px'}}>
        {/* RESUMO */}
        {tab==='resumo'&&(
          <div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',gap:12,marginBottom:24}}>
              {[
                {l:'MRR (contratos ativos)',v:fmt(mrr),c:'var(--orange)'},
                {l:'Recebido',v:fmt(pago),c:'#22C55E'},
                {l:'Pendente',v:fmt(pendente),c:'#EAB308'},
                {l:'Atrasado',v:fmt(atrasado),c:'#EF4444'},
              ].map(s=>(
                <div key={s.l} style={{background:'var(--bg2)',border:'1px solid var(--b2)',borderRadius:14,padding:'14px 16px'}}>
                  <div style={{fontSize:10,color:'var(--t3)',marginBottom:4,textTransform:'uppercase',letterSpacing:'.07em'}}>{s.l}</div>
                  <div style={{fontSize:20,fontFamily:'var(--font-d)',fontWeight:800,color:s.c}}>{s.v}</div>
                </div>
              ))}
            </div>

            {/* Atrasados alert */}
            {atrasado>0&&(
              <div style={{display:'flex',gap:10,padding:'12px 16px',background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:12,marginBottom:16}}>
                <span>🔴</span>
                <div>
                  <div style={{fontSize:12,fontWeight:600,color:'#EF4444',marginBottom:2}}>Pagamentos atrasados</div>
                  <div style={{fontSize:12,color:'var(--t2)'}}>Você tem {payments.filter(p=>p.status==='atrasado').length} lançamento(s) em atraso totalizando {fmt(atrasado)}</div>
                </div>
              </div>
            )}

            {/* Recent payments */}
            <div style={{fontSize:11,color:'var(--t3)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:10}}>Últimos lançamentos</div>
            {[...payments].sort((a,b)=>new Date(b.createdAt||0)-new Date(a.createdAt||0)).slice(0,8).map(p=>(
              <div key={p.id} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 14px',background:'var(--bg2)',border:'1px solid var(--b1)',borderRadius:10,marginBottom:6}}>
                <span style={{fontSize:9,fontWeight:700,padding:'2px 8px',borderRadius:20,background:STATUS_C[p.status]+'18',color:STATUS_C[p.status],minWidth:62,textAlign:'center',textTransform:'uppercase',letterSpacing:'.05em'}}>{STATUS_L[p.status]}</span>
                <span style={{flex:1,fontSize:13,color:'var(--t1)'}}>{p.description}</span>
                <span style={{fontSize:13,fontWeight:600,color:STATUS_C[p.status]}}>{fmt(p.amount)}</span>
                {p.dueDate&&<span style={{fontSize:11,color:'var(--t3)'}}>{p.dueDate}</span>}
              </div>
            ))}
          </div>
        )}

        {/* CONTRATOS */}
        {tab==='contratos'&&(
          <div>
            {contracts.length===0&&<div style={{color:'var(--t3)',fontSize:13,textAlign:'center',padding:'40px 0'}}>Nenhum contrato cadastrado.</div>}
            {contracts.map(c=>(
              <div key={c.id} style={{background:'var(--bg2)',border:'1px solid var(--b2)',borderRadius:14,padding:16,marginBottom:10,opacity:c.active===false?0.5:1,transition:'opacity .2s'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10}}>
                  <div>
                    <div style={{fontWeight:600,fontSize:14,marginBottom:4}}>{c.clientName}</div>
                    <div style={{display:'flex',gap:8,alignItems:'center'}}>
                      <span style={{fontSize:18,fontFamily:'var(--font-d)',fontWeight:800,color:'var(--orange)'}}>{fmt(c.value)}<span style={{fontSize:11,color:'var(--t3)',fontWeight:400}}>/mês</span></span>
                      <span style={{fontSize:10,padding:'2px 8px',borderRadius:20,background:c.active!==false?'rgba(34,197,94,0.12)':'rgba(85,85,85,0.12)',color:c.active!==false?'#22C55E':'#555'}}>{c.active!==false?'Ativo':'Inativo'}</span>
                      <span style={{fontSize:10,padding:'2px 8px',borderRadius:20,background:'var(--bg3)',color:'var(--t3)'}}>{c.type==='mensal'?'Mensal':'Avulso'}</span>
                    </div>
                  </div>
                  <div style={{display:'flex',gap:4}}>
                    <button onClick={()=>openEditC(c)} style={{fontSize:11,padding:'4px 10px',borderRadius:6,border:'1px solid var(--b2)',background:'var(--bg3)',color:'var(--t2)'}}>✎</button>
                    <button onClick={()=>toggleContract(c.id)} style={{fontSize:11,padding:'4px 10px',borderRadius:6,border:'1px solid var(--b2)',background:'var(--bg3)',color:'var(--t2)'}}>{c.active!==false?'Pausar':'Ativar'}</button>
                    <button onClick={()=>delContract(c.id)} style={{fontSize:11,padding:'4px 8px',borderRadius:6,border:'1px solid rgba(239,68,68,0.2)',background:'rgba(239,68,68,0.08)',color:'#EF4444'}}>✕</button>
                  </div>
                </div>
                <div style={{display:'flex',gap:16,fontSize:11,color:'var(--t3)'}}>
                  {c.startDate&&<span>Início: {c.startDate}</span>}
                  {c.endDate  &&<span>Fim: {c.endDate}</span>}
                  {c.notes    &&<span style={{color:'var(--t2)'}}>{c.notes}</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PAGAMENTOS */}
        {tab==='pagamentos'&&(
          <div>
            {payments.length===0&&<div style={{color:'var(--t3)',fontSize:13,textAlign:'center',padding:'40px 0'}}>Nenhum lançamento ainda.</div>}
            {[...payments].sort((a,b)=>new Date(b.dueDate||b.createdAt||0)-new Date(a.dueDate||a.createdAt||0)).map(p=>(
              <div key={p.id} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 14px',background:'var(--bg2)',border:`1px solid var(--b1)`,borderRadius:12,marginBottom:8,borderLeft:`3px solid ${STATUS_C[p.status]}`}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:500,marginBottom:4}}>{p.description}</div>
                  <div style={{display:'flex',gap:10,fontSize:11,color:'var(--t3)'}}>
                    {p.dueDate&&<span>📅 {p.dueDate}</span>}
                    {p.contractId&&<span>📄 {contracts.find(c=>c.id===p.contractId)?.clientName||p.contractId}</span>}
                  </div>
                </div>
                <div style={{fontSize:15,fontWeight:700,color:STATUS_C[p.status]}}>{fmt(p.amount)}</div>
                <select value={p.status} onChange={e=>setPayStatus(p.id,e.target.value)} style={{fontSize:11,padding:'3px 6px',width:100}}>
                  {Object.entries(STATUS_L).map(([k,l])=><option key={k} value={k}>{l}</option>)}
                </select>
                <button onClick={()=>openEditP(p)} style={{fontSize:11,padding:'4px 8px',borderRadius:6,border:'1px solid var(--b2)',background:'var(--bg3)',color:'var(--t2)'}}>✎</button>
                <button onClick={()=>delPayment(p.id)} style={{fontSize:14,color:'var(--t3)',padding:'0 4px'}}>×</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Contract form */}
      {showCForm&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:300}} onClick={e=>e.target===e.currentTarget&&setShowCF(false)}>
          <div style={{background:'var(--bg2)',border:'1px solid var(--b3)',borderRadius:18,padding:24,width:380,maxWidth:'95vw'}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:18}}>
              <div style={{fontFamily:'var(--font-d)',fontSize:16,fontWeight:700}}>{editC?'Editar contrato':'Novo contrato'}</div>
              <button onClick={()=>setShowCF(false)} style={{color:'var(--t3)',fontSize:20}}>×</button>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              <div style={{gridColumn:'1/-1'}}>
                <label style={{fontSize:11,color:'var(--t3)',display:'block',marginBottom:3}}>Cliente *</label>
                <input value={cForm.clientName||''} onChange={e=>setCForm(p=>({...p,clientName:e.target.value}))} style={{width:'100%'}} placeholder="Nome do cliente" autoFocus/>
              </div>
              <div>
                <label style={{fontSize:11,color:'var(--t3)',display:'block',marginBottom:3}}>Valor mensal *</label>
                <input type="number" value={cForm.value||''} onChange={e=>setCForm(p=>({...p,value:e.target.value}))} style={{width:'100%'}} placeholder="R$"/>
              </div>
              <div>
                <label style={{fontSize:11,color:'var(--t3)',display:'block',marginBottom:3}}>Tipo</label>
                <select value={cForm.type||'mensal'} onChange={e=>setCForm(p=>({...p,type:e.target.value}))} style={{width:'100%'}}>
                  <option value="mensal">Mensal</option>
                  <option value="avulso">Avulso</option>
                </select>
              </div>
              <div>
                <label style={{fontSize:11,color:'var(--t3)',display:'block',marginBottom:3}}>Início</label>
                <input type="date" value={cForm.startDate||''} onChange={e=>setCForm(p=>({...p,startDate:e.target.value}))} style={{width:'100%'}}/>
              </div>
              <div>
                <label style={{fontSize:11,color:'var(--t3)',display:'block',marginBottom:3}}>Fim</label>
                <input type="date" value={cForm.endDate||''} onChange={e=>setCForm(p=>({...p,endDate:e.target.value}))} style={{width:'100%'}}/>
              </div>
              <div style={{gridColumn:'1/-1'}}>
                <label style={{fontSize:11,color:'var(--t3)',display:'block',marginBottom:3}}>Notas</label>
                <textarea value={cForm.notes||''} onChange={e=>setCForm(p=>({...p,notes:e.target.value}))} style={{width:'100%',minHeight:60,resize:'vertical'}} placeholder="Observações..."/>
              </div>
            </div>
            <div style={{display:'flex',gap:8,justifyContent:'flex-end',marginTop:16}}>
              <button onClick={()=>setShowCF(false)} style={{padding:'8px 16px',background:'var(--bg3)',borderRadius:8,border:'1px solid var(--b2)',fontSize:13}}>Cancelar</button>
              <button onClick={saveC} style={{padding:'8px 20px',background:'var(--orange)',color:'#fff',borderRadius:8,fontSize:13,fontWeight:600}}>Salvar</button>
            </div>
          </div>
        </div>
      )}

      {/* Payment form */}
      {showPForm&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:300}} onClick={e=>e.target===e.currentTarget&&setShowPF(false)}>
          <div style={{background:'var(--bg2)',border:'1px solid var(--b3)',borderRadius:18,padding:24,width:360,maxWidth:'95vw'}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:18}}>
              <div style={{fontFamily:'var(--font-d)',fontSize:16,fontWeight:700}}>{editP?'Editar lançamento':'Novo lançamento'}</div>
              <button onClick={()=>setShowPF(false)} style={{color:'var(--t3)',fontSize:20}}>×</button>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              <div>
                <label style={{fontSize:11,color:'var(--t3)',display:'block',marginBottom:3}}>Descrição *</label>
                <input value={pForm.description||''} onChange={e=>setPForm(p=>({...p,description:e.target.value}))} style={{width:'100%'}} placeholder="Ex: Mensalidade Exemplo Ltda" autoFocus/>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                <div>
                  <label style={{fontSize:11,color:'var(--t3)',display:'block',marginBottom:3}}>Valor *</label>
                  <input type="number" value={pForm.amount||''} onChange={e=>setPForm(p=>({...p,amount:e.target.value}))} style={{width:'100%'}} placeholder="R$"/>
                </div>
                <div>
                  <label style={{fontSize:11,color:'var(--t3)',display:'block',marginBottom:3}}>Vencimento</label>
                  <input type="date" value={pForm.dueDate||''} onChange={e=>setPForm(p=>({...p,dueDate:e.target.value}))} style={{width:'100%'}}/>
                </div>
              </div>
              <div>
                <label style={{fontSize:11,color:'var(--t3)',display:'block',marginBottom:3}}>Status</label>
                <select value={pForm.status||'pendente'} onChange={e=>setPForm(p=>({...p,status:e.target.value}))} style={{width:'100%'}}>
                  {Object.entries(STATUS_L).map(([k,l])=><option key={k} value={k}>{l}</option>)}
                </select>
              </div>
              <div>
                <label style={{fontSize:11,color:'var(--t3)',display:'block',marginBottom:3}}>Contrato vinculado</label>
                <select value={pForm.contractId||''} onChange={e=>setPForm(p=>({...p,contractId:e.target.value}))} style={{width:'100%'}}>
                  <option value="">— Nenhum —</option>
                  {contracts.map(c=><option key={c.id} value={c.id}>{c.clientName}</option>)}
                </select>
              </div>
            </div>
            <div style={{display:'flex',gap:8,justifyContent:'flex-end',marginTop:16}}>
              <button onClick={()=>setShowPF(false)} style={{padding:'8px 16px',background:'var(--bg3)',borderRadius:8,border:'1px solid var(--b2)',fontSize:13}}>Cancelar</button>
              <button onClick={saveP} style={{padding:'8px 20px',background:'var(--orange)',color:'#fff',borderRadius:8,fontSize:13,fontWeight:600}}>Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

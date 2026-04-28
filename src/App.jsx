import React, { useState, useEffect, useMemo } from 'react';
import { loadData, saveData, scoreColor, scoreLabel, IDEA_LABELS, IDEA_COLORS, IDEA_TYPES, CLIENT_COLORS, uid, computeAlerts } from './store.js';
import Canvas     from './components/Canvas.jsx';
import Calculator from './components/Calculator.jsx';
import { EvolutionPanel, GoalsPanel, AlertsPanel, CampaignTimeline } from './components/Charts.jsx';
import CRM        from './components/CRM.jsx';
import Finance    from './components/Finance.jsx';
import Creatives  from './components/Creatives.jsx';
import Onboarding from './components/Onboarding.jsx';
import Report     from './components/Report.jsx';
import { DEFAULT_CHECKLIST } from './components/Onboarding.jsx';
import Results from './components/Results.jsx';

// ── Atoms ─────────────────────────────────────────────────────────
const Tag = ({ text, color }) => { const c=color||'var(--orange)'; return <span style={{fontSize:10,padding:'2px 8px',borderRadius:20,background:c+'18',color:c,border:`1px solid ${c}28`,fontWeight:500}}>{text}</span>; };
const Badge = ({ score, size='sm' }) => { const c=scoreColor(score),lg=size==='lg'; return <span style={{fontSize:lg?11:10,fontWeight:600,padding:lg?'3px 10px':'2px 8px',borderRadius:20,background:c+'18',color:c,border:`1px solid ${c}30`}}>{score} · {scoreLabel(score)}</span>; };
const BarScore = ({ score, color }) => { const c=color||scoreColor(score); return <div style={{width:'100%',height:3,background:'var(--bg5)',borderRadius:2}}><div style={{height:'100%',width:score+'%',background:c,borderRadius:2,transition:'width .6s ease'}}/></div>; };
const Sec = ({ title, action }) => <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:11}}><div style={{fontSize:10,fontWeight:600,color:'var(--t3)',textTransform:'uppercase',letterSpacing:'.09em'}}>{title}</div>{action}</div>;
const Card = ({ children, style={} }) => <div style={{background:'var(--bg2)',border:'1px solid var(--b2)',borderRadius:16,padding:20,...style}}>{children}</div>;
const MBox = ({ label, value, onChange }) => (
  <div style={{background:'var(--bg3)',borderRadius:10,padding:'9px 11px'}}>
    <div style={{fontSize:9,color:'var(--t3)',marginBottom:3,textTransform:'uppercase',letterSpacing:'.06em'}}>{label}</div>
    <input value={value||''} onChange={e=>onChange(e.target.value)} style={{background:'transparent',border:'none',fontSize:15,fontWeight:600,color:'var(--t1)',width:'100%',padding:0,boxShadow:'none'}} placeholder="—"/>
  </div>
);
function Modal({ title, onClose, children, width=440 }){
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.72)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:300}} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="si" style={{background:'var(--bg2)',border:'1px solid var(--b3)',borderRadius:20,padding:28,width,maxWidth:'95vw',maxHeight:'92vh',overflowY:'auto',boxShadow:'0 8px 60px rgba(0,0,0,.7)'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
          <div style={{fontFamily:'var(--font-d)',fontSize:17,fontWeight:700}}>{title}</div>
          <button onClick={onClose} style={{color:'var(--t3)',fontSize:22,lineHeight:1}}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}
function IdeaItem({ idea, onToggle, onDelete }){
  const c=IDEA_COLORS[idea.type];
  return (
    <div style={{display:'flex',alignItems:'flex-start',gap:10,padding:'10px 14px',background:'var(--bg3)',border:'1px solid var(--b1)',borderRadius:10,opacity:idea.done?.42:1,transition:'opacity .2s'}}>
      <input type="checkbox" checked={idea.done} onChange={onToggle} style={{accentColor:c,cursor:'pointer',marginTop:2,width:14,height:14,flexShrink:0}}/>
      <div style={{flex:1}}><div style={{fontSize:10,color:c,marginBottom:2,fontWeight:500}}>{IDEA_LABELS[idea.type]}</div><div style={{fontSize:13,textDecoration:idea.done?'line-through':'none',color:idea.done?'var(--t3)':'var(--t1)',lineHeight:1.5}}>{idea.text}</div></div>
      <button onClick={onDelete} style={{color:'var(--t3)',fontSize:16,padding:'0 2px',lineHeight:1}}>×</button>
    </div>
  );
}

// ── NAV config ─────────────────────────────────────────────────────
const NAV = [
  { id:'dashboard', icon:'⬡', label:'Dashboard' },
  { id:'crm',       icon:'◎', label:'CRM' },
  { id:'finance',   icon:'◈', label:'Financeiro' },
  { id:'creatives', icon:'◉', label:'Criativos' },
  { id:'calc',      icon:'⊡', label:'Calculadora' },
  { id:'ideas',     icon:'◇', label:'Ideias' },
  { id:'overview',  icon:'▤', label:'Visão Geral' },
];
const CLIENT_TABS = [
  ['info','Visão'],['results','Resultados'],['goals','Metas'],['evolution','Evolução'],
  ['campaigns','Campanhas'],['onboarding','Onboarding'],
  ['ideas','Ideias'],['calc','Calculadora'],['canvas','Canvas'],['report','Relatório'],
];

export default function App(){
  const [data, setData]       = useState(()=>{ const d=loadData(); if(!d.crm)d.crm=[]; if(!d.contracts)d.contracts=[]; if(!d.payments)d.payments=[]; if(!d.creatives)d.creatives=[]; return d; });
  const [page, setPage]       = useState('dashboard');
  const [cid, setCid]         = useState(null);
  const [tab, setTab]         = useState('info');
  const [sidebar, setSidebar] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [newC, setNewC]       = useState({name:'',score:50,roas:'',cpa:'',ctr:'',cpc:'',cpm:'',budget:'',revenue:'',conversions:'',platform:'',niche:'',color:'#FF5C2B',meta_roas:'',meta_cpa:'',meta_budget:'',meta_revenue:''});
  const [iText, setIT]        = useState('');
  const [iType, setITy]       = useState('estrategia');
  const [gText, setGT]        = useState('');
  const [gType, setGTy]       = useState('estrategia');
  const [search, setSrch]     = useState('');

  useEffect(()=>{ saveData(data); }, [data]);

  function mut(fn){ setData(d=>{ const n=JSON.parse(JSON.stringify(d)); fn(n); return n; }); }

  const client   = data.clients.find(c=>c.id===cid);
  const filtered = data.clients.filter(c=>c.name.toLowerCase().includes(search.toLowerCase()));
  const avgScore = data.clients.length ? Math.round(data.clients.reduce((s,c)=>s+c.score,0)/data.clients.length) : 0;
  const totalAlerts = useMemo(()=>data.clients.reduce((s,c)=>s+computeAlerts(c).length,0),[data.clients]);
  const clientAlerts = useMemo(()=>client?computeAlerts(client):[], [client]);
  const mrr = (data.contracts||[]).filter(c=>c.type==='mensal'&&c.active!==false).reduce((s,c)=>s+parseFloat(c.value||0),0);

  const openClient = (id) => { setCid(id); setPage('client'); setTab('info'); };
  const upC = (patch) => { mut(d=>{ const c=d.clients.find(x=>x.id===cid); if(c)Object.assign(c,patch); }); };
  const addIdea = () => { if(!iText.trim())return; mut(d=>{ const c=d.clients.find(x=>x.id===cid); if(c)c.ideas.push({id:'i'+uid(),text:iText.trim(),type:iType,done:false}); }); setIT(''); };
  const toggleIdea = (id) => { mut(d=>{ const c=d.clients.find(x=>x.id===cid); if(c){const i=c.ideas.find(x=>x.id===id);if(i)i.done=!i.done;} }); };
  const deleteIdea = (id) => { mut(d=>{ const c=d.clients.find(x=>x.id===cid); if(c)c.ideas=c.ideas.filter(x=>x.id!==id); }); };
  const addGlobal  = () => { if(!gText.trim())return; mut(d=>d.globalIdeas.push({id:'g'+uid(),text:gText.trim(),type:gType})); setGT(''); };
  const upCanvas   = (cv) => { mut(d=>{ const c=d.clients.find(x=>x.id===cid); if(c)c.canvas=cv; }); };
  const addCamp    = (camp) => { mut(d=>{ const c=d.clients.find(x=>x.id===cid); if(c){if(!c.campaigns)c.campaigns=[];c.campaigns.push(camp);} }); };
  const updCamp    = (id,p) => { mut(d=>{ const c=d.clients.find(x=>x.id===cid); if(c){const ca=c.campaigns?.find(x=>x.id===id);if(ca)Object.assign(ca,p);} }); };
  const delCamp    = (id)   => { mut(d=>{ const c=d.clients.find(x=>x.id===cid); if(c)c.campaigns=(c.campaigns||[]).filter(x=>x.id!==id); }); };
  const upOnboard  = (list) => { mut(d=>{ const c=d.clients.find(x=>x.id===cid); if(c)c.checklist=list; }); };
  const upResults  = (list) => { mut(d=>{ const c=d.clients.find(x=>x.id===cid); if(c)c.results=list; }); };
  const addSnap    = () => { if(!client)return; const m=new Date().toLocaleString('pt-BR',{month:'short'}).replace('.',''); mut(d=>{ const c=d.clients.find(x=>x.id===cid); if(c){if(!c.history)c.history=[];c.history.push({month:m,roas:parseFloat(c.roas)||0,cpa:parseFloat(c.cpa)||0,score:c.score,budget:parseFloat(c.budget)||0,revenue:parseFloat(c.revenue)||0});if(c.history.length>12)c.history.shift();} }); };
  const delClient  = () => { if(confirm('Deletar cliente?')){ mut(d=>{d.clients=d.clients.filter(c=>c.id!==cid);}); setPage('dashboard'); setCid(null); } };

  function saveNew(){
    if(!newC.name.trim())return;
    mut(d=>d.clients.push({...newC,id:'c'+uid(),score:parseInt(newC.score)||0,notes:'',ideas:[],history:[],campaigns:[],checklist:DEFAULT_CHECKLIST.map(i=>({...i,id:'ob'+uid()})),canvas:{nodes:[{id:'root',type:'mindmap-root',x:300,y:240,text:newC.name,color:newC.color,w:150,h:50}],edges:[]}}));
    setShowNew(false); setNewC({name:'',score:50,roas:'',cpa:'',ctr:'',cpc:'',cpm:'',budget:'',revenue:'',conversions:'',platform:'',niche:'',color:'#FF5C2B',meta_roas:'',meta_cpa:'',meta_budget:'',meta_revenue:''});
  }

  return (
    <div style={{display:'flex',height:'100vh',overflow:'hidden'}}>
      {/* ── SIDEBAR ── */}
      <aside style={{width:sidebar?232:54,flexShrink:0,background:'var(--bg2)',borderRight:'1px solid var(--b2)',display:'flex',flexDirection:'column',transition:'width .22s ease',overflow:'hidden'}}>
        <div style={{padding:'13px 12px',borderBottom:'1px solid var(--b2)',display:'flex',alignItems:'center',gap:10,flexShrink:0}}>
          <div style={{width:32,height:32,borderRadius:9,background:'var(--orange)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:15,fontWeight:700,fontFamily:'var(--font-d)',color:'#fff',flexShrink:0,boxShadow:'0 2px 14px rgba(255,92,43,.4)'}}>B</div>
          {sidebar&&<div><div style={{fontFamily:'var(--font-d)',fontSize:14,fontWeight:800,letterSpacing:'-.01em'}}>BLS Group</div><div style={{fontSize:9,color:'var(--t3)',marginTop:1,letterSpacing:'.08em',textTransform:'uppercase'}}>Client Hub</div></div>}
          <button onClick={()=>setSidebar(o=>!o)} style={{marginLeft:'auto',color:'var(--t3)',fontSize:13,padding:3}}>{sidebar?'◂':'▸'}</button>
        </div>

        {/* MRR pill */}
        {sidebar&&mrr>0&&(
          <div style={{margin:'8px 10px 0',padding:'7px 12px',background:'var(--orangebg)',border:'1px solid var(--orangeline)',borderRadius:9,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <span style={{fontSize:10,color:'var(--t3)',textTransform:'uppercase',letterSpacing:'.06em'}}>MRR</span>
            <span style={{fontSize:13,fontWeight:700,color:'var(--orange)'}}>R$ {mrr.toLocaleString('pt-BR')}</span>
          </div>
        )}

        <nav style={{padding:'8px 6px',display:'flex',flexDirection:'column',gap:2}}>
          {NAV.map(item=>{
            const active=page===item.id&&!cid;
            return (
              <button key={item.id} onClick={()=>{setPage(item.id);setCid(null);}}
                style={{display:'flex',alignItems:'center',gap:10,padding:'8px 10px',borderRadius:9,textAlign:'left',fontSize:13,color:active?'var(--orange)':'var(--t2)',background:active?'var(--orangebg)':'transparent',transition:'all .15s',whiteSpace:'nowrap',borderLeft:active?'2px solid var(--orange)':'2px solid transparent'}}>
                <span style={{fontSize:14,flexShrink:0}}>{item.icon}</span>
                {sidebar&&<span style={{flex:1}}>{item.label}</span>}
                {sidebar&&item.id==='dashboard'&&totalAlerts>0&&<span style={{fontSize:9,fontWeight:700,padding:'1px 6px',borderRadius:20,background:'#EF444422',color:'#EF4444'}}>{totalAlerts}</span>}
              </button>
            );
          })}
        </nav>

        {sidebar&&(
          <div style={{flex:1,overflowY:'auto',padding:'0 6px'}}>
            <div style={{fontSize:10,fontWeight:600,color:'var(--t3)',letterSpacing:'.1em',padding:'10px 10px 5px',textTransform:'uppercase'}}>Clientes</div>
            <input value={search} onChange={e=>setSrch(e.target.value)} placeholder="Buscar..." style={{width:'100%',fontSize:12,padding:'5px 10px',marginBottom:5}}/>
            {filtered.map(c=>{
              const al=computeAlerts(c).length;
              return (
                <button key={c.id} onClick={()=>openClient(c.id)}
                  style={{display:'flex',alignItems:'center',gap:8,padding:'7px 10px',borderRadius:9,textAlign:'left',width:'100%',fontSize:12,color:cid===c.id?'var(--t1)':'var(--t2)',background:cid===c.id?'var(--orangebg)':'transparent',transition:'all .15s',borderLeft:cid===c.id?'2px solid var(--orange)':'2px solid transparent'}}>
                  <span style={{width:7,height:7,borderRadius:'50%',background:c.color||scoreColor(c.score),flexShrink:0}}/>
                  <span style={{flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.name}</span>
                  {al>0&&<span style={{fontSize:9,fontWeight:700,padding:'1px 5px',borderRadius:20,background:'#EF444418',color:'#EF4444',flexShrink:0}}>{al}</span>}
                  <span style={{fontSize:10,color:scoreColor(c.score),fontWeight:600,flexShrink:0}}>{c.score}</span>
                </button>
              );
            })}
            <button onClick={()=>setShowNew(true)} style={{display:'flex',alignItems:'center',gap:8,padding:'7px 10px',borderRadius:9,width:'100%',fontSize:12,color:'var(--t3)',marginTop:4}}>
              <span style={{fontSize:14}}>+</span> Novo cliente
            </button>
          </div>
        )}
      </aside>

      {/* ── MAIN ── */}
      <main style={{flex:1,overflow:'hidden',display:'flex',flexDirection:'column',minWidth:0}}>

        {/* DASHBOARD */}
        {page==='dashboard'&&!cid&&(
          <div style={{flex:1,overflowY:'auto',padding:'28px 30px'}} className="fu">
            <div style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between',marginBottom:26}}>
              <div>
                <div style={{fontSize:11,color:'var(--orange)',fontWeight:600,letterSpacing:'.1em',textTransform:'uppercase',marginBottom:6}}>BLS Group</div>
                <h1 style={{fontFamily:'var(--font-d)',fontSize:30,fontWeight:800,letterSpacing:'-.02em',lineHeight:1}}>Dashboard</h1>
              </div>
              <button onClick={()=>setShowNew(true)} style={{padding:'9px 20px',background:'var(--orange)',color:'#fff',borderRadius:10,fontWeight:600,fontSize:13,boxShadow:'var(--shadow-o)'}}>+ Novo cliente</button>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(120px,1fr))',gap:10,marginBottom:24}}>
              {[
                {l:'Clientes',        v:data.clients.length,                                          c:'var(--t1)'},
                {l:'MRR',             v:'R$'+mrr.toLocaleString('pt-BR'),                             c:'var(--orange)'},
                {l:'Score médio',     v:avgScore,                                                     c:scoreColor(avgScore)},
                {l:'Saudáveis',       v:data.clients.filter(c=>c.score>=75).length,                   c:'var(--green)'},
                {l:'Críticos',        v:data.clients.filter(c=>c.score>0&&c.score<50).length,         c:'var(--red)'},
                {l:'Alertas',         v:totalAlerts,                                                  c:totalAlerts>0?'#EF4444':'#22C55E'},
                {l:'Leads no CRM',    v:(data.crm||[]).filter(l=>l.stage!=='perdido').length,         c:'#3B82F6'},
                {l:'Criativos',       v:(data.creatives||[]).length,                                  c:'var(--t2)'},
              ].map(s=>(
                <div key={s.l} style={{background:'var(--bg2)',border:'1px solid var(--b2)',borderRadius:14,padding:'12px 14px'}}>
                  <div style={{fontSize:10,color:'var(--t3)',marginBottom:4,textTransform:'uppercase',letterSpacing:'.07em'}}>{s.l}</div>
                  <div style={{fontSize:22,fontFamily:'var(--font-d)',fontWeight:800,color:s.c}}>{s.v}</div>
                </div>
              ))}
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(255px,1fr))',gap:12}}>
              {data.clients.map(c=>{
                const alerts=computeAlerts(c);
                return (
                  <div key={c.id} onClick={()=>openClient(c.id)}
                    style={{background:'var(--bg2)',border:'1px solid var(--b2)',borderRadius:18,padding:18,cursor:'pointer',transition:'all .18s',position:'relative',overflow:'hidden'}}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor=(c.color||'#FF5C2B')+'50';e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow=`0 8px 32px ${c.color||'#FF5C2B'}16`;}}
                    onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--b2)';e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='none';}}>
                    <div style={{position:'absolute',top:0,left:0,right:0,height:3,background:c.color||'var(--orange)',borderRadius:'18px 18px 0 0'}}/>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
                      <div>
                        <div style={{fontFamily:'var(--font-d)',fontSize:14,fontWeight:700,marginBottom:5}}>{c.name}</div>
                        <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>{c.platform&&<Tag text={c.platform} color={c.color}/>}{c.niche&&<Tag text={c.niche} color={c.color}/>}</div>
                      </div>
                      <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:4}}>
                        <Badge score={c.score}/>
                        {alerts.length>0&&<span style={{fontSize:9,fontWeight:700,padding:'2px 7px',borderRadius:20,background:'#EF444418',color:'#EF4444'}}>⚠ {alerts.length}</span>}
                      </div>
                    </div>
                    <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:7,marginBottom:12}}>
                      {[['ROAS',c.roas?c.roas+'x':'—'],['CPA',c.cpa?'R$'+c.cpa:'—'],['CTR',c.ctr?c.ctr+'%':'—']].map(([k,v])=>(
                        <div key={k} style={{background:'var(--bg3)',borderRadius:8,padding:'6px 8px'}}><div style={{fontSize:9,color:'var(--t3)',marginBottom:2}}>{k}</div><div style={{fontSize:12,fontWeight:500}}>{v}</div></div>
                      ))}
                    </div>
                    <BarScore score={c.score} color={c.color}/>
                    <div style={{fontSize:10,color:'var(--t3)',marginTop:5,textAlign:'right'}}>{c.ideas?.filter(i=>!i.done).length||0} pendentes</div>
                  </div>
                );
              })}
              <div onClick={()=>setShowNew(true)} style={{border:'1px dashed var(--b3)',borderRadius:18,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:8,minHeight:160,color:'var(--t3)',fontSize:13,cursor:'pointer',transition:'all .15s'}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--orange)';e.currentTarget.style.color='var(--orange)';}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--b3)';e.currentTarget.style.color='var(--t3)';}}>
                <div style={{fontSize:28}}>+</div>Novo cliente
              </div>
            </div>
          </div>
        )}

        {/* CRM */}
        {page==='crm'&&!cid&&<CRM leads={data.crm||[]} onChange={l=>mut(d=>d.crm=l)}/>}

        {/* FINANCE */}
        {page==='finance'&&!cid&&<Finance contracts={data.contracts||[]} payments={data.payments||[]} clients={data.clients} onContracts={c=>mut(d=>d.contracts=c)} onPayments={p=>mut(d=>d.payments=p)}/>}

        {/* CREATIVES */}
        {page==='creatives'&&!cid&&<Creatives creatives={data.creatives||[]} clients={data.clients} onChange={c=>mut(d=>d.creatives=c)}/>}

        {/* CALC */}
        {page==='calc'&&!cid&&(
          <div style={{flex:1,overflow:'hidden',display:'flex',flexDirection:'column'}} className="fu">
            <div style={{padding:'18px 26px 14px',borderBottom:'1px solid var(--b2)',flexShrink:0}}>
              <div style={{fontSize:11,color:'var(--orange)',fontWeight:600,letterSpacing:'.1em',textTransform:'uppercase',marginBottom:4}}>BLS Group</div>
              <h1 style={{fontFamily:'var(--font-d)',fontSize:24,fontWeight:800}}>Calculadora</h1>
            </div>
            <div style={{flex:1,overflow:'hidden'}}><Calculator/></div>
          </div>
        )}

        {/* IDEAS */}
        {page==='ideas'&&!cid&&(
          <div style={{flex:1,overflowY:'auto',padding:'26px 30px'}} className="fu">
            <h1 style={{fontFamily:'var(--font-d)',fontSize:24,fontWeight:800,marginBottom:6}}>Banco de Ideias</h1>
            <p style={{color:'var(--t3)',fontSize:12,marginBottom:20}}>Despeje qualquer insight sem pressão.</p>
            <div style={{display:'flex',gap:8,marginBottom:22}}>
              <input value={gText} onChange={e=>setGT(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addGlobal()} placeholder="Sua ideia aqui..." style={{flex:1,padding:'10px 14px'}}/>
              <select value={gType} onChange={e=>setGTy(e.target.value)} style={{width:150}}>{IDEA_TYPES.map(t=><option key={t} value={t}>{IDEA_LABELS[t]}</option>)}</select>
              <button onClick={addGlobal} style={{padding:'10px 20px',background:'var(--orange)',color:'#fff',borderRadius:9,fontWeight:600,fontSize:13,boxShadow:'var(--shadow-o)'}}>+ Adicionar</button>
            </div>
            <div style={{marginBottom:26}}>
              <div style={{fontSize:11,color:'var(--t3)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:10}}>Globais</div>
              <div style={{display:'flex',flexDirection:'column',gap:6}}>
                {data.globalIdeas.map(idea=>(
                  <div key={idea.id} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 16px',background:'var(--bg2)',border:'1px solid var(--b2)',borderRadius:11}}>
                    <span style={{width:7,height:7,borderRadius:'50%',background:IDEA_COLORS[idea.type],flexShrink:0}}/>
                    <span style={{fontSize:11,color:IDEA_COLORS[idea.type],minWidth:82,fontWeight:500}}>{IDEA_LABELS[idea.type]}</span>
                    <span style={{flex:1,fontSize:13}}>{idea.text}</span>
                    <button onClick={()=>mut(d=>d.globalIdeas=d.globalIdeas.filter(x=>x.id!==idea.id))} style={{color:'var(--t3)',fontSize:16}}>×</button>
                  </div>
                ))}
                {!data.globalIdeas.length&&<div style={{color:'var(--t3)',fontSize:13}}>Nenhuma ideia ainda.</div>}
              </div>
            </div>
            {data.clients.filter(c=>c.ideas?.length>0).map(c=>(
              <div key={c.id} style={{marginBottom:20}}>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8,cursor:'pointer'}} onClick={()=>openClient(c.id)}>
                  <span style={{width:7,height:7,borderRadius:'50%',background:c.color||scoreColor(c.score)}}/>
                  <span style={{fontSize:12,fontWeight:600,color:'var(--t2)'}}>{c.name}</span>
                  <span style={{fontSize:11,color:'var(--t3)'}}>↗</span>
                </div>
                {c.ideas.map(idea=>(
                  <div key={idea.id} style={{display:'flex',alignItems:'center',gap:12,padding:'8px 16px',background:'var(--bg2)',border:'1px solid var(--b1)',borderRadius:9,marginBottom:4,opacity:idea.done?.4:1}}>
                    <span style={{width:6,height:6,borderRadius:'50%',background:IDEA_COLORS[idea.type],flexShrink:0}}/>
                    <span style={{fontSize:11,color:IDEA_COLORS[idea.type],minWidth:82,fontWeight:500}}>{IDEA_LABELS[idea.type]}</span>
                    <span style={{flex:1,fontSize:12,textDecoration:idea.done?'line-through':'none'}}>{idea.text}</span>
                    {idea.done&&<span style={{fontSize:10,color:'var(--green)'}}>✓</span>}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* OVERVIEW */}
        {page==='overview'&&!cid&&(
          <div style={{flex:1,overflowY:'auto',padding:'26px 30px'}} className="fu">
            <h1 style={{fontFamily:'var(--font-d)',fontSize:24,fontWeight:800,marginBottom:20}}>Visão Geral</h1>
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              {[...data.clients].sort((a,b)=>b.score-a.score).map((c,i)=>(
                <div key={c.id} onClick={()=>openClient(c.id)} style={{display:'flex',alignItems:'center',gap:16,padding:'15px 20px',background:'var(--bg2)',border:'1px solid var(--b2)',borderRadius:16,cursor:'pointer',transition:'all .15s'}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=(c.color||'#FF5C2B')+'40';e.currentTarget.style.paddingLeft='24px';}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--b2)';e.currentTarget.style.paddingLeft='20px';}}>
                  <span style={{fontFamily:'var(--font-d)',fontSize:18,fontWeight:800,color:'var(--t3)',minWidth:28}}>#{i+1}</span>
                  <div style={{flex:1}}><div style={{fontWeight:600,fontSize:14,marginBottom:7}}>{c.name}</div><BarScore score={c.score} color={c.color}/></div>
                  <div style={{textAlign:'right',flexShrink:0}}><Badge score={c.score} size="lg"/><div style={{fontSize:11,color:'var(--t3)',marginTop:5}}>ROAS {c.roas||'—'}x · R${c.budget||'—'}</div></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CLIENT DETAIL */}
        {page==='client'&&client&&(
          <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}} className="fi">
            <div style={{padding:'10px 18px',borderBottom:'1px solid var(--b2)',background:'var(--bg2)',display:'flex',alignItems:'center',gap:12,flexShrink:0,flexWrap:'wrap'}}>
              <button onClick={()=>{setPage('dashboard');setCid(null);}} style={{color:'var(--t3)',fontSize:20,padding:'0 6px 0 0'}}>←</button>
              <div style={{width:9,height:9,borderRadius:'50%',background:client.color||scoreColor(client.score),flexShrink:0}}/>
              <div style={{fontFamily:'var(--font-d)',fontSize:15,fontWeight:700}}>{client.name}</div>
              <Badge score={client.score} size="lg"/>
              {clientAlerts.length>0&&<span style={{fontSize:10,fontWeight:600,padding:'2px 9px',borderRadius:20,background:'#EF444418',color:'#EF4444'}}>⚠ {clientAlerts.length}</span>}
              {client.platform&&<Tag text={client.platform} color={client.color}/>}
              {client.niche&&<Tag text={client.niche} color={client.color}/>}
              <div style={{marginLeft:'auto',display:'flex',gap:2,background:'var(--bg3)',borderRadius:10,padding:3,flexWrap:'wrap'}}>
                {CLIENT_TABS.map(([t,l])=>(
                  <button key={t} onClick={()=>setTab(t)} style={{fontSize:11,padding:'4px 11px',borderRadius:8,background:tab===t?'var(--bg)':'transparent',color:tab===t?'var(--orange)':'var(--t2)',border:tab===t?'1px solid var(--b2)':'none',transition:'all .15s',fontWeight:tab===t?500:400,whiteSpace:'nowrap'}}>{l}</button>
                ))}
              </div>
              <button onClick={delClient} style={{color:'var(--t3)',fontSize:11,padding:'4px 10px',borderRadius:6,border:'1px solid var(--b2)',background:'var(--bg3)'}}>✕</button>
            </div>

            {tab==='info'&&(
              <div style={{flex:1,overflowY:'auto',padding:'18px 22px'}}>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
                  <Card>
                    <Sec title="Score & métricas" action={<button onClick={addSnap} style={{fontSize:10,padding:'3px 10px',borderRadius:6,background:'var(--orangebg)',color:'var(--orange)',border:'1px solid var(--orangeline)'}}>+ Snapshot</button>}/>
                    <div style={{display:'flex',alignItems:'center',gap:16,marginBottom:16}}>
                      <div style={{width:58,height:58,borderRadius:'50%',background:scoreColor(client.score)+'18',border:`2px solid ${scoreColor(client.score)}`,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'var(--font-d)',fontSize:20,fontWeight:800,color:scoreColor(client.score),flexShrink:0}}>{client.score}</div>
                      <div><div style={{fontSize:15,fontWeight:600}}>{scoreLabel(client.score)}</div><div style={{fontSize:11,color:'var(--t3)',marginTop:2}}>Score atual</div></div>
                    </div>
                    <input type="range" min="0" max="100" value={client.score} onChange={e=>upC({score:parseInt(e.target.value)})} style={{width:'100%',accentColor:client.color||'var(--orange)',cursor:'pointer',marginBottom:14}}/>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                      {[['ROAS','roas'],['CPA','cpa'],['CTR %','ctr'],['CPC','cpc'],['CPM','cpm'],['Budget','budget'],['Receita','revenue'],['Conversões','conversions']].map(([l,k])=>(
                        <MBox key={k} label={l} value={client[k]} onChange={v=>upC({[k]:v})}/>
                      ))}
                    </div>
                  </Card>
                  <div style={{display:'flex',flexDirection:'column',gap:12}}>
                    {clientAlerts.length>0&&<Card><Sec title="Alertas"/><AlertsPanel alerts={clientAlerts}/></Card>}
                    <Card style={{flex:1}}>
                      <Sec title="Notas"/>
                      <textarea value={client.notes||''} onChange={e=>upC({notes:e.target.value})} placeholder="Contexto, resultados, próximos passos..." style={{width:'100%',minHeight:120,resize:'vertical',lineHeight:1.7,fontSize:13}}/>
                      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginTop:10}}>
                        <input value={client.platform||''} onChange={e=>upC({platform:e.target.value})} placeholder="Plataforma"/>
                        <input value={client.niche||''} onChange={e=>upC({niche:e.target.value})} placeholder="Nicho"/>
                      </div>
                    </Card>
                    <Card>
                      <Sec title="Cor"/>
                      <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                        {CLIENT_COLORS.map(c=><div key={c} onClick={()=>upC({color:c})} style={{width:22,height:22,borderRadius:'50%',background:c,cursor:'pointer',outline:client.color===c?'2.5px solid #fff':'none',outlineOffset:2}}/>)}
                      </div>
                    </Card>
                  </div>
                  <Card style={{gridColumn:'1/-1'}}>
                    <Sec title="Resumo de ideias"/>
                    <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10}}>
                      {IDEA_TYPES.map(type=>{
                        const pending=client.ideas?.filter(i=>i.type===type&&!i.done).length||0;
                        const total=client.ideas?.filter(i=>i.type===type).length||0;
                        const c=IDEA_COLORS[type];
                        return <div key={type} style={{background:'var(--bg3)',borderRadius:11,padding:'12px 14px',borderLeft:`3px solid ${c}`}}><div style={{fontSize:22,fontFamily:'var(--font-d)',fontWeight:800,color:c}}>{pending}</div><div style={{fontSize:11,color:'var(--t2)',marginTop:2}}>{IDEA_LABELS[type]}</div>{total>0&&<div style={{fontSize:10,color:'var(--t3)',marginTop:3}}>{total-pending}/{total} feitas</div>}</div>;
                      })}
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {tab==='goals'&&(
              <div style={{flex:1,overflowY:'auto',padding:'18px 22px'}}>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
                  <Card><Sec title="Progresso das metas"/><GoalsPanel client={client}/></Card>
                  <Card>
                    <Sec title="Editar metas"/>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                      {[['ROAS meta','meta_roas'],['CPA meta','meta_cpa'],['Budget meta','meta_budget'],['Receita meta','meta_revenue']].map(([l,k])=>(
                        <div key={k} style={{background:'var(--bg3)',borderRadius:10,padding:'10px 12px',borderLeft:'2px solid var(--orange)'}}><div style={{fontSize:9,color:'var(--t3)',marginBottom:3,textTransform:'uppercase',letterSpacing:'.06em'}}>{l}</div><input value={client[k]||''} onChange={e=>upC({[k]:e.target.value})} style={{background:'transparent',border:'none',fontSize:15,fontWeight:600,color:'var(--orange)',width:'100%',padding:0,boxShadow:'none'}} placeholder="—"/></div>
                      ))}
                    </div>
                  </Card>
                  {clientAlerts.length>0&&<Card style={{gridColumn:'1/-1'}}><Sec title="Alertas"/><AlertsPanel alerts={clientAlerts}/></Card>}
                </div>
              </div>
            )}

            {tab==='evolution'&&(
              <div style={{flex:1,overflowY:'auto',padding:'18px 22px'}}>
                <Card>
                  <Sec title="Evolução histórica" action={<button onClick={addSnap} style={{fontSize:11,padding:'4px 12px',borderRadius:6,background:'var(--orangebg)',color:'var(--orange)',border:'1px solid var(--orangeline)'}}>+ Snapshot agora</button>}/>
                  <EvolutionPanel history={client.history} color={client.color}/>
                </Card>
                {(client.history||[]).length>0&&(
                  <Card style={{marginTop:14}}>
                    <Sec title="Tabela histórica"/>
                    <div style={{overflowX:'auto'}}>
                      <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
                        <thead><tr style={{borderBottom:'1px solid var(--b2)'}}>{['Mês','ROAS','CPA','Score','Budget','Receita'].map(h=><th key={h} style={{padding:'6px 10px',textAlign:'left',fontSize:10,color:'var(--t3)',fontWeight:600,textTransform:'uppercase',letterSpacing:'.06em'}}>{h}</th>)}</tr></thead>
                        <tbody>{[...client.history].reverse().map((h,i)=><tr key={i} style={{borderBottom:'1px solid var(--b1)'}}><td style={{padding:'7px 10px',fontWeight:500}}>{h.month}</td><td style={{padding:'7px 10px',color:'var(--orange)'}}>{h.roas}x</td><td style={{padding:'7px 10px',color:'var(--yellow)'}}>R${h.cpa}</td><td style={{padding:'7px 10px',color:scoreColor(h.score)}}>{h.score}</td><td style={{padding:'7px 10px',color:'var(--t2)'}}>R${(h.budget||0).toLocaleString('pt-BR')}</td><td style={{padding:'7px 10px',color:'var(--green)'}}>R${(h.revenue||0).toLocaleString('pt-BR')}</td></tr>)}</tbody>
                      </table>
                    </div>
                  </Card>
                )}
              </div>
            )}

            {tab==='campaigns'&&<div style={{flex:1,overflowY:'auto',padding:'18px 22px'}}><Card><CampaignTimeline campaigns={client.campaigns||[]} onAdd={addCamp} onUpdate={updCamp} onDelete={delCamp}/></Card></div>}

            {tab==='onboarding'&&<div style={{flex:1,overflowY:'auto',padding:'18px 22px'}}><Onboarding checklist={client.checklist||[]} onChange={upOnboard}/></div>}

            {tab==='results'&&<Results results={client.results||[]} onChange={upResults} clientColor={client.color} clientName={client.name}/>}

            {tab==='ideas'&&(
              <div style={{flex:1,overflowY:'auto',padding:'18px 22px'}}>
                <div style={{display:'flex',gap:8,marginBottom:18}}>
                  <input value={iText} onChange={e=>setIT(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addIdea()} placeholder="Nova ideia..." style={{flex:1,padding:'10px 14px'}}/>
                  <select value={iType} onChange={e=>setITy(e.target.value)} style={{width:140}}>{IDEA_TYPES.map(t=><option key={t} value={t}>{IDEA_LABELS[t]}</option>)}</select>
                  <button onClick={addIdea} style={{padding:'10px 20px',background:'var(--orange)',color:'#fff',borderRadius:9,fontWeight:600,fontSize:13,boxShadow:'var(--shadow-o)'}}>+ Add</button>
                </div>
                {IDEA_TYPES.map(type=>{
                  const ideas=client.ideas?.filter(i=>i.type===type)||[];
                  if(!ideas.length)return null;
                  const pending=ideas.filter(i=>!i.done).length;
                  return <div key={type} style={{marginBottom:18}}><div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}><span style={{width:8,height:8,borderRadius:'50%',background:IDEA_COLORS[type]}}/><span style={{fontSize:12,fontWeight:600,color:'var(--t2)'}}>{IDEA_LABELS[type]}</span><span style={{fontSize:11,color:'var(--t3)'}}>({pending} pendente{pending!==1?'s':''})</span></div><div style={{display:'flex',flexDirection:'column',gap:6}}>{ideas.map(idea=><IdeaItem key={idea.id} idea={idea} onToggle={()=>toggleIdea(idea.id)} onDelete={()=>deleteIdea(idea.id)}/>)}</div></div>;
                })}
                {!client.ideas?.length&&<div style={{textAlign:'center',padding:'40px 0',color:'var(--t3)',fontSize:13}}>Nenhuma ideia ainda.</div>}
              </div>
            )}

            {tab==='calc'&&<div style={{flex:1,overflow:'hidden'}}><Calculator initialValues={client} compact/></div>}
            {tab==='canvas'&&<div style={{flex:1,overflow:'hidden'}}><Canvas canvas={client.canvas} onChange={upCanvas} clientName={client.name}/></div>}
            {tab==='report'&&<div style={{flex:1,overflowY:'auto',padding:'18px 22px'}}><Card><Sec title="Gerador de relatório"/><Report client={client}/></Card></div>}
          </div>
        )}
      </main>

      {/* NEW CLIENT MODAL */}
      {showNew&&(
        <Modal title="Novo cliente" onClose={()=>setShowNew(false)} width={500}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <div style={{gridColumn:'1/-1'}}><label style={{fontSize:11,color:'var(--t3)',display:'block',marginBottom:4}}>Nome *</label><input value={newC.name} onChange={e=>setNewC(p=>({...p,name:e.target.value}))} placeholder="Ex: Empresa ABC" style={{width:'100%'}} autoFocus/></div>
            <div style={{gridColumn:'1/-1'}}><label style={{fontSize:11,color:'var(--t3)',display:'block',marginBottom:4}}>Score: <strong style={{color:'var(--orange)'}}>{newC.score}</strong></label><input type="range" min="0" max="100" value={newC.score} onChange={e=>setNewC(p=>({...p,score:e.target.value}))} style={{width:'100%',accentColor:scoreColor(parseInt(newC.score))}}/></div>
            {[['ROAS','roas','3.5'],['CPA','cpa','25'],['CTR','ctr','2.3'],['CPC','cpc','0.8'],['CPM','cpm','12'],['Budget','budget','5000'],['Receita','revenue','21000'],['Conversões','conversions','280'],['Plataforma','platform','Meta, Google...'],['Nicho','niche','E-commerce, SaaS...'],['ROAS meta','meta_roas','5'],['CPA meta','meta_cpa','15'],['Budget meta','meta_budget','8000'],['Receita meta','meta_revenue','40000']].map(([l,k,ph])=>(
              <div key={k}><label style={{fontSize:11,color:'var(--t3)',display:'block',marginBottom:4}}>{l}</label><input value={newC[k]||''} onChange={e=>setNewC(p=>({...p,[k]:e.target.value}))} placeholder={ph} style={{width:'100%'}}/></div>
            ))}
            <div style={{gridColumn:'1/-1'}}><label style={{fontSize:11,color:'var(--t3)',display:'block',marginBottom:8}}>Cor</label><div style={{display:'flex',gap:10,flexWrap:'wrap'}}>{CLIENT_COLORS.map(c=><div key={c} onClick={()=>setNewC(p=>({...p,color:c}))} style={{width:26,height:26,borderRadius:'50%',background:c,cursor:'pointer',outline:newC.color===c?'2.5px solid #fff':'none',outlineOffset:2}}/>)}</div></div>
          </div>
          <div style={{display:'flex',gap:8,justifyContent:'flex-end',marginTop:20}}>
            <button onClick={()=>setShowNew(false)} style={{padding:'9px 18px',background:'var(--bg3)',borderRadius:9,border:'1px solid var(--b2)',fontSize:13}}>Cancelar</button>
            <button onClick={saveNew} style={{padding:'9px 22px',background:'var(--orange)',color:'#fff',borderRadius:9,fontSize:13,fontWeight:600,boxShadow:'var(--shadow-o)'}}>Criar cliente</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

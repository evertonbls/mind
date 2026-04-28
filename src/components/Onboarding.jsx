import React, { useState } from 'react';
import { uid } from '../store.js';

export const DEFAULT_CHECKLIST = [
  { id:'ob1',  group:'Acesso',         text:'Acesso ao gerenciador de anúncios', done:false },
  { id:'ob2',  group:'Acesso',         text:'Pixel / Tag instalado e verificado', done:false },
  { id:'ob3',  group:'Acesso',         text:'Domínio verificado', done:false },
  { id:'ob4',  group:'Acesso',         text:'Catálogo de produtos conectado', done:false },
  { id:'ob5',  group:'Briefing',       text:'Briefing completo recebido', done:false },
  { id:'ob6',  group:'Briefing',       text:'Público-alvo definido (idade, gênero, localização)', done:false },
  { id:'ob7',  group:'Briefing',       text:'Concorrentes identificados', done:false },
  { id:'ob8',  group:'Briefing',       text:'Diferenciais do produto/serviço mapeados', done:false },
  { id:'ob9',  group:'Criativos',      text:'Criativos iniciais recebidos do cliente', done:false },
  { id:'ob10', group:'Criativos',      text:'Criativos produzidos pela agência', done:false },
  { id:'ob11', group:'Criativos',      text:'Aprovação de criativos pelo cliente', done:false },
  { id:'ob12', group:'Configuração',   text:'Campanha de tráfego criada', done:false },
  { id:'ob13', group:'Configuração',   text:'Conjunto de anúncios configurado', done:false },
  { id:'ob14', group:'Configuração',   text:'UTMs configuradas nos links', done:false },
  { id:'ob15', group:'Configuração',   text:'Eventos de conversão testados', done:false },
  { id:'ob16', group:'Lançamento',     text:'Campanha publicada e em revisão', done:false },
  { id:'ob17', group:'Lançamento',     text:'Primeiros dados verificados (24h)', done:false },
  { id:'ob18', group:'Lançamento',     text:'Relatório de lançamento enviado ao cliente', done:false },
];

export default function Onboarding({ checklist=[], onChange }) {
  const [newText, setNewText]   = useState('');
  const [newGroup, setNewGroup] = useState('Acesso');

  const groups = [...new Set(checklist.map(i=>i.group))];
  const done   = checklist.filter(i=>i.done).length;
  const pct    = checklist.length>0 ? Math.round((done/checklist.length)*100) : 0;

  function toggle(id){ onChange(checklist.map(i=>i.id===id?{...i,done:!i.done}:i)); }
  function del(id)   { onChange(checklist.filter(i=>i.id!==id)); }
  function reset()   { if(confirm('Resetar todos os itens?')) onChange(checklist.map(i=>({...i,done:false}))); }
  function resetDefault(){ if(confirm('Substituir pelo checklist padrão?')) onChange(DEFAULT_CHECKLIST.map(i=>({...i,id:'ob'+uid()}))); }

  function addItem(){
    if(!newText.trim())return;
    onChange([...checklist,{id:'ob'+uid(),group:newGroup,text:newText.trim(),done:false}]);
    setNewText('');
  }

  const barColor = pct>=80?'#22C55E':pct>=50?'#EAB308':'#EF4444';

  return (
    <div style={{padding:'0 0 20px'}}>
      {/* Progress */}
      <div style={{background:'var(--bg2)',border:'1px solid var(--b2)',borderRadius:14,padding:18,marginBottom:16}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
          <div>
            <div style={{fontFamily:'var(--font-d)',fontSize:15,fontWeight:700,marginBottom:2}}>Progresso do onboarding</div>
            <div style={{fontSize:12,color:'var(--t3)'}}>{done} de {checklist.length} itens concluídos</div>
          </div>
          <div style={{fontSize:28,fontFamily:'var(--font-d)',fontWeight:800,color:barColor}}>{pct}%</div>
        </div>
        <div style={{height:6,background:'var(--bg4)',borderRadius:3}}>
          <div style={{height:'100%',width:pct+'%',background:barColor,borderRadius:3,transition:'width .5s ease'}}/>
        </div>
        <div style={{display:'flex',gap:8,marginTop:10}}>
          <button onClick={reset} style={{fontSize:11,padding:'4px 12px',borderRadius:6,border:'1px solid var(--b2)',background:'var(--bg3)',color:'var(--t3)'}}>Resetar progresso</button>
          <button onClick={resetDefault} style={{fontSize:11,padding:'4px 12px',borderRadius:6,border:'1px solid var(--orangeline)',background:'var(--orangebg)',color:'var(--orange)'}}>Restaurar padrão</button>
        </div>
      </div>

      {/* Add item */}
      <div style={{display:'flex',gap:8,marginBottom:16}}>
        <input value={newText} onChange={e=>setNewText(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addItem()} placeholder="Novo item do checklist..." style={{flex:1}}/>
        <input value={newGroup} onChange={e=>setNewGroup(e.target.value)} placeholder="Grupo" style={{width:120}} list="groups-list"/>
        <datalist id="groups-list">{groups.map(g=><option key={g} value={g}/>)}</datalist>
        <button onClick={addItem} style={{padding:'8px 16px',background:'var(--orange)',color:'#fff',borderRadius:8,fontSize:12,fontWeight:600}}>+ Add</button>
      </div>

      {/* Groups */}
      {groups.map(group=>{
        const items = checklist.filter(i=>i.group===group);
        const gDone = items.filter(i=>i.done).length;
        const gAll  = items.length;
        return (
          <div key={group} style={{marginBottom:14}}>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
              <div style={{fontSize:11,fontWeight:600,color:'var(--t2)',textTransform:'uppercase',letterSpacing:'.07em'}}>{group}</div>
              <span style={{fontSize:10,color:gDone===gAll?'#22C55E':'var(--t3)'}}>{gDone}/{gAll}</span>
              <div style={{flex:1,height:2,background:'var(--bg4)',borderRadius:1}}>
                <div style={{height:'100%',width:(gDone/gAll*100)+'%',background:gDone===gAll?'#22C55E':'var(--orange)',borderRadius:1,transition:'width .4s'}}/>
              </div>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:5}}>
              {items.map(item=>(
                <div key={item.id} style={{display:'flex',alignItems:'center',gap:10,padding:'9px 13px',background:'var(--bg2)',border:'1px solid var(--b1)',borderRadius:10,opacity:item.done?.55:1,transition:'opacity .2s'}}>
                  <input type="checkbox" checked={item.done} onChange={()=>toggle(item.id)} style={{accentColor:'var(--orange)',cursor:'pointer',width:15,height:15,flexShrink:0}}/>
                  <span style={{flex:1,fontSize:13,textDecoration:item.done?'line-through':'none',color:item.done?'var(--t3)':'var(--t1)'}}>{item.text}</span>
                  <button onClick={()=>del(item.id)} style={{color:'var(--t3)',fontSize:15,padding:'0 3px',lineHeight:1}}>×</button>
                </div>
              ))}
            </div>
          </div>
        );
      })}
      {checklist.length===0&&(
        <div style={{textAlign:'center',padding:'30px 0',color:'var(--t3)',fontSize:13}}>
          <div style={{marginBottom:12}}>Nenhum item ainda.</div>
          <button onClick={resetDefault} style={{padding:'9px 20px',background:'var(--orange)',color:'#fff',borderRadius:9,fontSize:13,fontWeight:600}}>Carregar checklist padrão</button>
        </div>
      )}
    </div>
  );
}

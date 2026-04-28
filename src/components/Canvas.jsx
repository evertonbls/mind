import React, { useRef, useState, useCallback } from 'react';
import { uid, TEMPLATES } from '../store.js';

const PALETTE = ['#FF5C2B','#22C55E','#EAB308','#3B82F6','#A855F7','#EC4899','#14B8A6','#EF4444','#F97316','#ffffff'];

function center(n){ return { x: n.x+n.w/2, y: n.y+n.h/2 }; }

function bezier(x1,y1,x2,y2){
  const mx=(x1+x2)/2;
  return `M${x1} ${y1} C${mx} ${y1},${mx} ${y2},${x2} ${y2}`;
}

function edgePath(from,to){
  if(!from||!to) return '';
  const fc=center(from), tc=center(to);
  if(tc.x > fc.x+20)  return bezier(from.x+from.w, fc.y, to.x, tc.y);
  if(tc.x < fc.x-20)  return bezier(from.x, fc.y, to.x+to.w, tc.y);
  return bezier(fc.x, from.y+from.h, tc.x, to.y);
}

function mmEdge(p,c){
  if(!p||!c) return '';
  const pc=center(p), cc=center(c);
  if(cc.x>=pc.x) return bezier(p.x+p.w, pc.y, c.x, cc.y);
  return bezier(p.x, pc.y, c.x+c.w, cc.y);
}

function NodeShape({ node, sel, onMD, onDbl, onEdgeMD }){
  const { type,x,y,w,h,text,color } = node;
  const bc = sel ? color : color+'55';
  const fc = sel ? color+'35' : color+'18';
  const lbl = text.length>22 ? text.slice(0,20)+'…' : text;
  const fs  = type==='mindmap-root'?13:type==='sticky'?11:11;
  const fw  = type==='mindmap-root'?700:400;

  let shape;
  if(type==='flow-decision'){
    const hw=w/2,hh=h/2;
    shape=<polygon points={`${hw},2 ${w-2},${hh} ${hw},${h-2} 2,${hh}`} fill={fc} stroke={bc} strokeWidth={sel?1.5:1}/>;
  } else if(type==='flow-start'){
    shape=<rect width={w} height={h} rx={h/2} fill={fc} stroke={bc} strokeWidth={sel?1.5:1}/>;
  } else if(type==='mindmap-root'){
    shape=<rect width={w} height={h} rx={12} fill={fc} stroke={color} strokeWidth={sel?2:1.5}/>;
  } else if(type==='sticky'){
    return (
      <g transform={`translate(${x} ${y})`} onMouseDown={e=>onMD(e,node.id)} onDoubleClick={e=>onDbl(e,node.id)} style={{cursor:'move'}}>
        <rect width={w} height={h} rx={4} fill={color+'22'} stroke={color+'55'} strokeWidth={1}/>
        <line x1={0} y1={20} x2={w} y2={20} stroke={color+'44'} strokeWidth={0.5}/>
        <foreignObject x={6} y={4} width={w-12} height={h-8}>
          <div xmlns="http://www.w3.org/1999/xhtml" style={{fontSize:10,color:'#f5f5f5',lineHeight:1.5,fontFamily:'Inter,sans-serif',wordBreak:'break-word',pointerEvents:'none'}}>
            {text}
          </div>
        </foreignObject>
        {sel && <rect width={w} height={h} rx={4} fill="none" stroke={color} strokeWidth={1.5} strokeDasharray="4 2"/>}
      </g>
    );
  } else {
    shape=<rect width={w} height={h} rx={8} fill={fc} stroke={bc} strokeWidth={sel?1.5:1}/>;
  }

  return (
    <g transform={`translate(${x} ${y})`} onMouseDown={e=>onMD(e,node.id)} onDoubleClick={e=>onDbl(e,node.id)} style={{cursor:'move',userSelect:'none'}}>
      {shape}
      <text x={w/2} y={h/2} textAnchor="middle" dominantBaseline="central"
        style={{fontSize:fs,fontWeight:fw,fill:'var(--t1)',fontFamily:'Inter,sans-serif',pointerEvents:'none'}}>
        {lbl}
      </text>
      {sel && type!=='sticky' && (
        <>
          <circle cx={-9} cy={h/2} r={4.5} fill={color} opacity={0.9} style={{cursor:'crosshair'}} onMouseDown={e=>{e.stopPropagation();onEdgeMD(e,node.id);}}/>
          <circle cx={w+9} cy={h/2} r={4.5} fill={color} opacity={0.9} style={{cursor:'crosshair'}} onMouseDown={e=>{e.stopPropagation();onEdgeMD(e,node.id);}}/>
        </>
      )}
    </g>
  );
}

export default function Canvas({ canvas, onChange, clientName }){
  const svgRef = useRef(null);
  const [pan,setPan] = useState({x:40,y:30});
  const [zoom,setZoom] = useState(0.82);
  const [sel,setSel] = useState(null);
  const [drag,setDrag] = useState(null);
  const [panning,setPanning] = useState(null);
  const [edgeDraw,setEdgeDraw] = useState(null);
  const [mouse,setMouse] = useState({x:0,y:0});
  const [editing,setEditing] = useState(null);
  const [editTxt,setEditTxt] = useState('');
  const [addMode,setAddMode] = useState(null);
  const [edgeLabel,setEdgeLabel] = useState(null);
  const [showTemplates,setShowTemplates] = useState(false);

  const nodes = canvas.nodes||[];
  const edges = canvas.edges||[];

  function svgXY(cx,cy){
    const r=svgRef.current.getBoundingClientRect();
    return { x:(cx-r.left-pan.x)/zoom, y:(cy-r.top-pan.y)/zoom };
  }

  function upd(n,e){ onChange({ nodes:n??nodes, edges:e??edges }); }

  function onBgMD(ev){
    if(ev.button!==0)return;
    if(addMode){
      const p=svgXY(ev.clientX,ev.clientY);
      const defs={ 'mindmap':{w:130,h:40},'flow-step':{w:130,h:44},'flow-decision':{w:130,h:44},'flow-start':{w:130,h:44},'sticky':{w:160,h:80} };
      const d=defs[addMode]||{w:130,h:40};
      const defText={ 'mindmap':'Novo nó','flow-step':'Etapa','flow-decision':'Decisão?','flow-start':'Início','sticky':'📝 Nota...' };
      const nn={ id:'n'+uid(), type:addMode, x:p.x-d.w/2, y:p.y-d.h/2, text:defText[addMode]||'Nó', color:'#FF5C2B', ...d };
      upd([...nodes,nn]);
      setSel(nn.id); setAddMode(null); return;
    }
    setSel(null);
    setPanning({sx:ev.clientX-pan.x,sy:ev.clientY-pan.y});
  }

  function onNodeMD(ev,id){
    ev.stopPropagation();
    if(ev.button!==0)return;
    setSel(id);
    const n=nodes.find(x=>x.id===id);
    const p=svgXY(ev.clientX,ev.clientY);
    setDrag({id,dx:p.x-n.x,dy:p.y-n.y});
  }

  function onEdgeMD(ev,id){
    ev.stopPropagation();
    const p=svgXY(ev.clientX,ev.clientY);
    setEdgeDraw({fromId:id,x:p.x,y:p.y});
  }

  function onMM(ev){
    const p=svgXY(ev.clientX,ev.clientY);
    setMouse(p);
    if(drag){
      upd(nodes.map(n=>n.id===drag.id?{...n,x:p.x-drag.dx,y:p.y-drag.dy}:n));
    } else if(panning){
      setPan({x:ev.clientX-panning.sx,y:ev.clientY-panning.sy});
    }
  }

  function onMU(ev){
    if(edgeDraw){
      const p=svgXY(ev.clientX,ev.clientY);
      const t=nodes.find(n=>n.id!==edgeDraw.fromId&&p.x>=n.x&&p.x<=n.x+n.w&&p.y>=n.y&&p.y<=n.y+n.h);
      if(t&&!edges.find(e=>e.from===edgeDraw.fromId&&e.to===t.id)){
        upd(null,[...edges,{id:'e'+uid(),from:edgeDraw.fromId,to:t.id,label:''}]);
      }
      setEdgeDraw(null);
    }
    setDrag(null); setPanning(null);
  }

  function onDbl(ev,id){
    ev.stopPropagation();
    const n=nodes.find(x=>x.id===id);
    setEditing(id); setEditTxt(n.text);
  }

  function commitEdit(){
    if(editing&&editTxt.trim()) upd(nodes.map(n=>n.id===editing?{...n,text:editTxt.trim()}:n));
    setEditing(null);
  }

  function delSel(){
    if(!sel)return;
    const toKill=new Set([sel]);
    let changed=true;
    while(changed){ changed=false; nodes.forEach(n=>{ if(toKill.has(n.parentId)&&!toKill.has(n.id)){toKill.add(n.id);changed=true;} }); }
    upd(nodes.filter(n=>!toKill.has(n.id)), edges.filter(e=>!toKill.has(e.from)&&!toKill.has(e.to)));
    setSel(null);
  }

  function addChild(){
    if(!sel)return;
    const p=nodes.find(n=>n.id===sel);
    const isFlow=p.type.startsWith('flow');
    const nn={ id:'n'+uid(), type:isFlow?'flow-step':'mindmap', x:p.x+200, y:p.y+(Math.random()-.5)*100, text:'Novo nó', color:p.color, w:120,h:40, ...(isFlow?{}:{parentId:sel}) };
    if(isFlow) upd([...nodes,nn],[...edges,{id:'e'+uid(),from:sel,to:nn.id,label:''}]);
    else       upd([...nodes,nn]);
    setSel(nn.id);
  }

  function changeColor(c){ if(sel) upd(nodes.map(n=>n.id===sel?{...n,color:c}:n)); }

  function loadTemplate(key){
    const tpl=TEMPLATES[key];
    if(!tpl)return;
    upd(JSON.parse(JSON.stringify(tpl.nodes)), JSON.parse(JSON.stringify(tpl.edges)));
    setShowTemplates(false); setSel(null);
  }

  function onWheel(ev){
    ev.preventDefault();
    const d=ev.deltaY>0?.9:1.1;
    setZoom(z=>Math.min(3,Math.max(0.2,z*d)));
  }

  function exportSVG(){
    const el=svgRef.current;
    const blob=new Blob([el.outerHTML],{type:'image/svg+xml'});
    const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=`${clientName||'canvas'}.svg`; a.click();
  }

  const selNode=nodes.find(n=>n.id===sel);
  const mmEdges=nodes.filter(n=>n.parentId).map(n=>({id:'mm'+n.id,from:n.parentId,to:n.id,mm:true}));
  const allEdges=[...mmEdges,...edges];

  const TOOLS=[
    {mode:'mindmap',     icon:'◉', tip:'Nó mindmap'},
    {mode:'flow-step',   icon:'▭', tip:'Etapa'},
    {mode:'flow-decision',icon:'◇',tip:'Decisão'},
    {mode:'flow-start',  icon:'●', tip:'Início/Fim'},
    {mode:'sticky',      icon:'🗒', tip:'Sticky note'},
  ];

  return (
    <div style={{display:'flex',flexDirection:'column',height:'100%',background:'var(--bg)'}}>

      {/* Top toolbar */}
      <div style={{display:'flex',alignItems:'center',gap:6,padding:'8px 14px',borderBottom:'1px solid var(--b2)',background:'var(--bg2)',flexShrink:0,flexWrap:'wrap',minHeight:46}}>

        {/* Templates */}
        <div style={{position:'relative'}}>
          <button onClick={()=>setShowTemplates(o=>!o)} style={{fontSize:11,padding:'4px 12px',borderRadius:6,background:showTemplates?'var(--orangebg2)':'var(--bg4)',color:showTemplates?'var(--orange)':'var(--t2)',border:'1px solid '+(showTemplates?'var(--orangeline)':'var(--b2)')}}>
            Templates ▾
          </button>
          {showTemplates&&(
            <div style={{position:'absolute',top:32,left:0,background:'var(--bg3)',border:'1px solid var(--b3)',borderRadius:10,padding:6,zIndex:50,minWidth:200,boxShadow:'var(--shadow)'}}>
              {Object.entries(TEMPLATES).map(([k,v])=>(
                <button key={k} onClick={()=>loadTemplate(k)} style={{display:'block',width:'100%',textAlign:'left',padding:'8px 12px',fontSize:12,color:'var(--t1)',borderRadius:6,background:'transparent'}}
                  onMouseEnter={e=>e.currentTarget.style.background='var(--bg4)'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  {v.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={{width:1,height:20,background:'var(--b2)'}}/>

        {/* Node types */}
        {TOOLS.map(t=>(
          <button key={t.mode} onClick={()=>setAddMode(addMode===t.mode?null:t.mode)} title={t.tip}
            style={{fontSize:11,padding:'4px 10px',borderRadius:6,background:addMode===t.mode?'var(--orangebg2)':'var(--bg4)',color:addMode===t.mode?'var(--orange)':'var(--t2)',border:'1px solid '+(addMode===t.mode?'var(--orangeline)':'var(--b2)')}}>
            {t.icon} {t.tip}
          </button>
        ))}

        {/* Selection actions */}
        {sel&&selNode&&(<>
          <div style={{width:1,height:20,background:'var(--b2)'}}/>
          <button onClick={addChild} style={{fontSize:11,padding:'4px 10px',borderRadius:6,background:'var(--orangebg)',color:'var(--orange)',border:'1px solid var(--orangeline)'}}>+ Filho</button>
          <button onClick={delSel}   style={{fontSize:11,padding:'4px 10px',borderRadius:6,background:'var(--redbg)',color:'var(--red)',border:'1px solid rgba(239,68,68,.3)'}}>✕ Deletar</button>
          {PALETTE.map(c=>(
            <div key={c} onClick={()=>changeColor(c)} style={{width:14,height:14,borderRadius:'50%',background:c,cursor:'pointer',flexShrink:0,outline:selNode.color===c?'2px solid #fff':'none',outlineOffset:1}}/>
          ))}
        </>)}

        <div style={{marginLeft:'auto',display:'flex',gap:5,alignItems:'center'}}>
          <button onClick={exportSVG} style={{fontSize:11,padding:'4px 12px',borderRadius:6,background:'var(--bg4)',border:'1px solid var(--b2)',color:'var(--t2)'}}>↓ SVG</button>
          <button onClick={()=>setZoom(z=>Math.min(3,z*1.2))} style={{padding:'4px 8px',background:'var(--bg4)',borderRadius:6,border:'1px solid var(--b2)',color:'var(--t1)'}}>+</button>
          <span style={{fontSize:11,color:'var(--t3)',minWidth:36,textAlign:'center'}}>{Math.round(zoom*100)}%</span>
          <button onClick={()=>setZoom(z=>Math.max(0.2,z*.8))} style={{padding:'4px 8px',background:'var(--bg4)',borderRadius:6,border:'1px solid var(--b2)',color:'var(--t1)'}}>−</button>
          <button onClick={()=>{setZoom(0.82);setPan({x:40,y:30});}} style={{fontSize:11,padding:'4px 10px',background:'var(--bg4)',borderRadius:6,border:'1px solid var(--b2)',color:'var(--t2)'}}>Reset</button>
        </div>
      </div>

      {addMode&&(
        <div style={{padding:'6px 16px',background:'rgba(255,92,43,0.08)',borderBottom:'1px solid rgba(255,92,43,0.2)',fontSize:12,color:'var(--orange)',flexShrink:0}}>
          Clique no canvas para adicionar — <button onClick={()=>setAddMode(null)} style={{color:'var(--t3)',textDecoration:'underline',fontSize:12}}>cancelar</button>
        </div>
      )}

      {/* Canvas SVG */}
      <div style={{flex:1,overflow:'hidden',position:'relative',cursor:addMode?'crosshair':panning?'grabbing':'grab'}}>
        <svg style={{position:'absolute',inset:0,width:'100%',height:'100%',pointerEvents:'none'}}>
          <defs>
            <pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse" patternTransform={`translate(${pan.x%24} ${pan.y%24})`}>
              <circle cx="1" cy="1" r="1" fill="rgba(255,255,255,0.04)"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)"/>
        </svg>

        <svg ref={svgRef} style={{position:'absolute',inset:0,width:'100%',height:'100%',userSelect:'none'}}
          onMouseDown={onBgMD} onMouseMove={onMM} onMouseUp={onMU} onMouseLeave={onMU} onWheel={onWheel}>
          <defs>
            <marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M1 1.5 L8.5 5 L1 8.5z" fill="rgba(255,255,255,0.35)"/>
            </marker>
          </defs>
          <g transform={`translate(${pan.x} ${pan.y}) scale(${zoom})`}>

            {/* Edges */}
            {allEdges.map(edge=>{
              const from=nodes.find(n=>n.id===edge.from);
              const to=nodes.find(n=>n.id===edge.to);
              if(!from||!to) return null;
              const d=edge.mm ? mmEdge(from,to) : edgePath(from,to);
              const col=from.color||'#FF5C2B';
              const fc=center(from),tc=center(to);
              const mx=(fc.x+tc.x)/2,my=(fc.y+tc.y)/2;
              return (
                <g key={edge.id}>
                  <path d={d} fill="none" stroke={col} strokeWidth={edge.mm?1.5:1.5} strokeOpacity={edge.mm?.40:.65} markerEnd={edge.mm?undefined:"url(#ah)"}/>
                  {edge.label&&(
                    <text x={mx} y={my-7} textAnchor="middle" style={{fontSize:10,fill:'var(--t2)',fontFamily:'Inter,sans-serif'}}>
                      {edge.label}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Live edge */}
            {edgeDraw&&(()=>{
              const from=nodes.find(n=>n.id===edgeDraw.fromId);
              if(!from)return null;
              const fc=center(from);
              return <path d={`M${fc.x} ${fc.y} L${mouse.x} ${mouse.y}`} stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" strokeDasharray="4 3" fill="none"/>;
            })()}

            {/* Nodes */}
            {nodes.map(node=>(
              editing===node.id?(
                <foreignObject key={node.id} x={node.x} y={node.y} width={node.w} height={node.h}>
                  <input xmlns="http://www.w3.org/1999/xhtml" autoFocus value={editTxt}
                    onChange={e=>setEditTxt(e.target.value)}
                    onBlur={commitEdit}
                    onKeyDown={e=>{if(e.key==='Enter')commitEdit();if(e.key==='Escape')setEditing(null);}}
                    style={{width:'100%',height:'100%',background:'var(--bg3)',border:`1.5px solid ${node.color}`,borderRadius:8,color:'var(--t1)',fontSize:12,textAlign:'center',outline:'none',padding:0,fontFamily:'Inter,sans-serif',boxSizing:'border-box'}}
                  />
                </foreignObject>
              ):(
                <NodeShape key={node.id} node={node} sel={sel===node.id} onMD={onNodeMD} onDbl={onDbl} onEdgeMD={onEdgeMD}/>
              )
            ))}
          </g>
        </svg>

        <div style={{position:'absolute',bottom:12,right:14,color:'var(--t3)',fontSize:10,pointerEvents:'none',textAlign:'right',lineHeight:2}}>
          Arrastar canvas para mover · Scroll para zoom<br/>Duplo clique para editar · Pontos laterais = conectar
        </div>
      </div>
    </div>
  );
}

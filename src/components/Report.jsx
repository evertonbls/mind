import React, { useState } from 'react';
import { scoreColor, scoreLabel } from '../store.js';

function fmt(n,dec=2){ if(!n||isNaN(parseFloat(n)))return'—'; return Number(parseFloat(n).toFixed(dec)).toLocaleString('pt-BR'); }
function fmtR(n){ if(!n||isNaN(parseFloat(n)))return'—'; return 'R$ '+parseFloat(n).toLocaleString('pt-BR',{minimumFractionDigits:2}); }

function generateHTML(client, opts){
  const sc = scoreColor(client.score);
  const today = new Date().toLocaleDateString('pt-BR',{day:'2-digit',month:'long',year:'numeric'});
  const history = (client.history||[]).slice(-6);

  const metricsRows = [
    opts.showRoas   && ['ROAS',         client.roas?client.roas+'x':'—',     client.meta_roas?client.meta_roas+'x':'—'],
    opts.showCpa    && ['CPA',          client.cpa?'R$ '+client.cpa:'—',     client.meta_cpa?'R$ '+client.meta_cpa:'—'],
    opts.showCtr    && ['CTR',          client.ctr?client.ctr+'%':'—',       '—'],
    opts.showBudget && ['Budget',       client.budget?'R$ '+parseFloat(client.budget).toLocaleString('pt-BR'):'—', client.meta_budget?'R$ '+parseFloat(client.meta_budget).toLocaleString('pt-BR'):'—'],
    opts.showRevenue&& ['Receita',      client.revenue?'R$ '+parseFloat(client.revenue).toLocaleString('pt-BR'):'—', client.meta_revenue?'R$ '+parseFloat(client.meta_revenue).toLocaleString('pt-BR'):'—'],
    opts.showConv   && ['Conversões',   client.conversions||'—',             '—'],
  ].filter(Boolean);

  const histRows = history.map(h=>
    `<tr><td>${h.month}</td><td>${h.roas}x</td><td>R$ ${h.cpa}</td><td style="color:${scoreColor(h.score)}">${h.score}</td><td>R$ ${(h.revenue||0).toLocaleString('pt-BR')}</td></tr>`
  ).join('');

  const ideasDone = (client.ideas||[]).filter(i=>i.done).map(i=>`<li>${i.text}</li>`).join('');
  const ideasPending = (client.ideas||[]).filter(i=>!i.done).slice(0,5).map(i=>`<li>${i.text}</li>`).join('');

  const activeCamps = (client.campaigns||[]).filter(c=>c.status==='ativa').map(c=>`<li>${c.name} — ${c.start} até ${c.end}${c.budget?` — R$ ${c.budget}`:''}</li>`).join('');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Relatório — ${client.name}</title>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Geist:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Geist',sans-serif;background:#f8f8f8;color:#111;line-height:1.6;-webkit-font-smoothing:antialiased}
  .page{max-width:800px;margin:0 auto;background:#fff;box-shadow:0 0 40px rgba(0,0,0,0.08)}
  .header{background:#0a0a0a;padding:48px 52px 40px;position:relative;overflow:hidden}
  .header::after{content:'';position:absolute;top:-60px;right:-60px;width:260px;height:260px;border-radius:50%;background:rgba(255,92,43,0.12)}
  .header-inner{position:relative;z-index:1}
  .brand{font-size:11px;font-weight:600;color:#FF5C2B;letter-spacing:.12em;text-transform:uppercase;margin-bottom:16px}
  h1{font-family:'Syne',sans-serif;font-size:36px;font-weight:800;color:#fff;line-height:1.1;margin-bottom:8px}
  .subtitle{font-size:14px;color:#666;margin-bottom:0}
  .date{font-size:12px;color:#555;margin-top:10px}
  .score-badge{display:inline-flex;align-items:center;gap:8px;padding:8px 16px;border-radius:30px;background:${sc}18;border:1px solid ${sc}30;margin-top:20px}
  .score-num{font-family:'Syne',sans-serif;font-size:22px;font-weight:800;color:${sc}}
  .score-lbl{font-size:13px;color:${sc};font-weight:500}
  .body{padding:44px 52px}
  .section{margin-bottom:40px}
  .section-title{font-family:'Syne',sans-serif;font-size:13px;font-weight:700;color:#FF5C2B;text-transform:uppercase;letter-spacing:.1em;margin-bottom:18px;display:flex;align-items:center;gap:10px}
  .section-title::after{content:'';flex:1;height:1px;background:#f0f0f0}
  .metrics-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin-bottom:8px}
  .metric-card{background:#fafafa;border:1px solid #efefef;border-radius:12px;padding:16px 18px}
  .metric-label{font-size:10px;color:#999;text-transform:uppercase;letter-spacing:.07em;margin-bottom:4px}
  .metric-value{font-family:'Syne',sans-serif;font-size:22px;font-weight:700;color:#111;margin-bottom:4px}
  .metric-meta{font-size:11px;color:#bbb}
  .metric-card.highlight{border-color:#FF5C2B30;background:#fff8f6}
  .metric-card.highlight .metric-value{color:#FF5C2B}
  table{width:100%;border-collapse:collapse;font-size:13px}
  th{font-size:10px;font-weight:600;color:#999;text-transform:uppercase;letter-spacing:.07em;padding:8px 12px;text-align:left;border-bottom:2px solid #f0f0f0}
  td{padding:10px 12px;border-bottom:1px solid #f7f7f7;color:#333}
  tr:last-child td{border-bottom:none}
  .tag{display:inline-block;font-size:10px;padding:2px 9px;border-radius:20px;background:#f0f0f0;color:#666;margin-right:5px;font-weight:500}
  .notes-box{background:#fafafa;border:1px solid #efefef;border-radius:12px;padding:18px 20px;font-size:13px;color:#444;line-height:1.8}
  ul{padding-left:20px;margin:8px 0}
  li{margin-bottom:5px;font-size:13px;color:#444}
  .footer{background:#0a0a0a;padding:24px 52px;display:flex;justify-content:space-between;align-items:center}
  .footer-brand{font-family:'Syne',sans-serif;font-size:14px;font-weight:800;color:#fff}
  .footer-text{font-size:11px;color:#555}
  .progress-bar-wrap{height:6px;background:#f0f0f0;border-radius:3px;margin-top:6px}
  .progress-bar-fill{height:100%;border-radius:3px;background:${sc}}
  @media print{body{background:#fff}.page{box-shadow:none}button{display:none}}
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div class="header-inner">
      <div class="brand">BLS Group — Relatório de Performance</div>
      <h1>${client.name}</h1>
      <div class="subtitle">${client.platform||''}${client.platform&&client.niche?' · ':''}${client.niche||''}</div>
      <div class="date">${today}</div>
      <div class="score-badge">
        <span class="score-num">${client.score}</span>
        <span class="score-lbl">${scoreLabel(client.score)}</span>
      </div>
    </div>
  </div>

  <div class="body">
    ${opts.showMetrics?`
    <div class="section">
      <div class="section-title">Métricas do período</div>
      <div class="metrics-grid">
        ${metricsRows.map(([l,v,m])=>`
          <div class="metric-card${l==='ROAS'?' highlight':''}">
            <div class="metric-label">${l}</div>
            <div class="metric-value">${v}</div>
            ${m!=='—'?`<div class="metric-meta">Meta: ${m}</div>`:''}
          </div>
        `).join('')}
      </div>
      <div class="progress-bar-wrap" style="margin-top:14px"><div class="progress-bar-fill" style="width:${client.score}%"></div></div>
      <div style="font-size:11px;color:#bbb;margin-top:5px;text-align:right">Score de saúde: ${client.score}/100</div>
    </div>`:''
    }

    ${opts.showHistory&&history.length>0?`
    <div class="section">
      <div class="section-title">Evolução histórica</div>
      <table>
        <tr><th>Mês</th><th>ROAS</th><th>CPA</th><th>Score</th><th>Receita</th></tr>
        ${histRows}
      </table>
    </div>`:''
    }

    ${opts.showNotes&&client.notes?`
    <div class="section">
      <div class="section-title">Observações</div>
      <div class="notes-box">${client.notes}</div>
    </div>`:''
    }

    ${opts.showIdeas&&ideasDone?`
    <div class="section">
      <div class="section-title">Ações executadas</div>
      <ul>${ideasDone}</ul>
    </div>`:''
    }

    ${opts.showIdeas&&ideasPending?`
    <div class="section">
      <div class="section-title">Próximos passos</div>
      <ul>${ideasPending}</ul>
    </div>`:''
    }

    ${opts.showCampaigns&&activeCamps?`
    <div class="section">
      <div class="section-title">Campanhas ativas</div>
      <ul>${activeCamps}</ul>
    </div>`:''
    }
  </div>

  <div class="footer">
    <div class="footer-brand">BLS Group</div>
    <div class="footer-text">Relatório gerado automaticamente • ${today}</div>
  </div>
</div>
</body>
</html>`;
}

export default function Report({ client }) {
  const [opts, setOpts] = useState({
    showMetrics:true, showRoas:true, showCpa:true, showCtr:true,
    showBudget:true, showRevenue:true, showConv:true,
    showHistory:true, showNotes:true, showIdeas:true, showCampaigns:true
  });
  const [preview, setPreview] = useState(false);

  function toggle(k){ setOpts(p=>({...p,[k]:!p[k]})); }

  function download(){
    const html = generateHTML(client, opts);
    const blob = new Blob([html],{type:'text/html'});
    const a = document.createElement('a'); a.href=URL.createObjectURL(blob);
    a.download=`relatorio-${client.name.toLowerCase().replace(/\s+/g,'-')}.html`; a.click();
  }

  function openPreview(){
    const html = generateHTML(client, opts);
    const w = window.open('','_blank');
    w.document.write(html); w.document.close();
  }

  const TOGGLE_OPTS = [
    ['showMetrics','Métricas principais'],
    ['showRoas','  — ROAS'],['showCpa','  — CPA'],['showCtr','  — CTR'],
    ['showBudget','  — Budget'],['showRevenue','  — Receita'],['showConv','  — Conversões'],
    ['showHistory','Histórico de evolução'],
    ['showNotes','Notas / observações'],
    ['showIdeas','Ações executadas e próximos passos'],
    ['showCampaigns','Campanhas ativas'],
  ];

  return (
    <div style={{padding:'0 0 20px'}}>
      <div style={{background:'var(--bg2)',border:'1px solid var(--b2)',borderRadius:14,padding:18,marginBottom:14}}>
        <div style={{fontSize:11,color:'var(--t3)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:12}}>Configurar relatório</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
          {TOGGLE_OPTS.map(([k,l])=>(
            <label key={k} style={{display:'flex',alignItems:'center',gap:9,cursor:'pointer',fontSize:12,color:opts[k]?'var(--t1)':'var(--t3)',paddingLeft:l.startsWith('  ')?16:0,transition:'color .15s'}}>
              <input type="checkbox" checked={opts[k]} onChange={()=>toggle(k)} style={{accentColor:'var(--orange)',width:14,height:14,cursor:'pointer'}}/>
              {l.trim()}
            </label>
          ))}
        </div>
      </div>
      <div style={{display:'flex',gap:8}}>
        <button onClick={openPreview} style={{flex:1,padding:'11px 0',background:'var(--bg3)',borderRadius:10,border:'1px solid var(--b3)',fontSize:13,fontWeight:500,color:'var(--t1)'}}>
          👁 Pré-visualizar
        </button>
        <button onClick={download} style={{flex:1,padding:'11px 0',background:'var(--orange)',color:'#fff',borderRadius:10,fontSize:13,fontWeight:600,boxShadow:'var(--shadow-o)'}}>
          ↓ Baixar HTML
        </button>
      </div>
      <div style={{fontSize:11,color:'var(--t3)',marginTop:10,textAlign:'center'}}>
        O relatório é gerado como HTML — abra no navegador e use Ctrl+P / Cmd+P para exportar como PDF.
      </div>
    </div>
  );
}

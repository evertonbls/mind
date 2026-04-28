import React, { useState } from 'react';

function Inp({ label, value, onChange, prefix='', suffix='', hint }){
  return (
    <div style={{marginBottom:12}}>
      <label style={{fontSize:11,color:'var(--t3)',display:'block',marginBottom:4,textTransform:'uppercase',letterSpacing:'.06em'}}>{label}</label>
      <div style={{position:'relative',display:'flex',alignItems:'center'}}>
        {prefix&&<span style={{position:'absolute',left:10,fontSize:13,color:'var(--t3)',pointerEvents:'none'}}>{prefix}</span>}
        <input type="number" value={value} onChange={e=>onChange(e.target.value)} min="0" step="any"
          style={{width:'100%',paddingLeft:prefix?28:12,paddingRight:suffix?32:12}}/>
        {suffix&&<span style={{position:'absolute',right:10,fontSize:13,color:'var(--t3)',pointerEvents:'none'}}>{suffix}</span>}
      </div>
      {hint&&<div style={{fontSize:10,color:'var(--t3)',marginTop:3}}>{hint}</div>}
    </div>
  );
}

function Res({ label, value, color, big, formula }){
  return (
    <div style={{background:'var(--bg3)',borderRadius:10,padding:'12px 14px',borderLeft:`3px solid ${color||'var(--orange)'}`}}>
      <div style={{fontSize:10,color:'var(--t3)',marginBottom:4,textTransform:'uppercase',letterSpacing:'.06em'}}>{label}</div>
      <div style={{fontSize:big?26:20,fontFamily:'var(--font-d)',fontWeight:700,color:color||'var(--orange)'}}>{value}</div>
      {formula&&<div style={{fontSize:10,color:'var(--t3)',marginTop:3}}>{formula}</div>}
    </div>
  );
}

function fmt(n,dec=2){ if(isNaN(n)||!isFinite(n))return '—'; return Number(n.toFixed(dec)).toLocaleString('pt-BR'); }
function fmtR(n){ if(isNaN(n)||!isFinite(n))return '—'; return 'R$ '+Number(n.toFixed(2)).toLocaleString('pt-BR'); }

const TABS = ['ROAS & ROI','CPA & CPM','Projeção','LTV'];

export default function Calculator({ initialValues, compact }){
  const iv = initialValues || {};
  const [tab,setTab] = useState(0);

  // Inputs
  const [budget,setBudget]       = useState(iv.budget||'');
  const [revenue,setRevenue]     = useState(iv.revenue||'');
  const [conversions,setConv]    = useState(iv.conversions||'');
  const [impressions,setImpr]    = useState('');
  const [clicks,setClicks]       = useState('');
  const [costPerClick,setCPC]    = useState(iv.cpc||'');
  const [cpm,setCPM]             = useState(iv.cpm||'');
  const [avgTicket,setTicket]    = useState('');
  const [purchaseFreq,setFreq]   = useState('');
  const [customerLife,setLife]   = useState('');
  const [margin,setMargin]       = useState('');
  const [targetRoas,setTRoas]    = useState('');
  const [targetCpa,setTCpa]      = useState('');

  // ── Calculations ──
  const b = parseFloat(budget)||0;
  const r = parseFloat(revenue)||0;
  const c = parseFloat(conversions)||0;
  const imp = parseFloat(impressions)||0;
  const clk = parseFloat(clicks)||0;
  const cpc = parseFloat(costPerClick)||0;
  const cpmV = parseFloat(cpm)||0;
  const tick = parseFloat(avgTicket)||0;
  const freq = parseFloat(purchaseFreq)||0;
  const life = parseFloat(customerLife)||0;
  const mar  = parseFloat(margin)||0;
  const troas= parseFloat(targetRoas)||0;
  const tcpa = parseFloat(targetCpa)||0;

  const ROAS      = b>0 ? r/b : NaN;
  const ROI       = b>0 ? ((r-b)/b)*100 : NaN;
  const CPA       = c>0 ? b/c : NaN;
  const CPM_calc  = imp>0 ? (b/imp)*1000 : cpmV||NaN;
  const CTR_calc  = imp>0 && clk>0 ? (clk/imp)*100 : NaN;
  const CPC_calc  = clk>0 ? b/clk : cpc||NaN;
  const LTV       = tick>0&&freq>0&&life>0 ? tick*freq*life : NaN;
  const LTV_mar   = !isNaN(LTV)&&mar>0 ? LTV*(mar/100) : NaN;
  const CAC_max   = !isNaN(LTV_mar) ? LTV_mar*0.3 : NaN;

  // Projections
  const budgetFor = troas>0 ? r/troas : NaN;
  const revenueFor = troas>0 ? b*troas : NaN;
  const convsFor   = tcpa>0  ? b/tcpa  : NaN;
  const budgetForCpa = tcpa>0&&c>0 ? tcpa*c : NaN;

  // Score
  const roasScore = isNaN(ROAS)?0 : ROAS>=4?100:ROAS>=3?80:ROAS>=2?60:ROAS>=1?40:20;
  const cpaScore  = isNaN(CPA)||!tcpa?50 : CPA<=tcpa?100:CPA<=tcpa*1.5?60:30;
  const healthScore = Math.round((roasScore+cpaScore)/2);

  return (
    <div style={{height:'100%',overflowY:'auto',padding:compact?'12px':'20px 24px'}}>
      {!compact&&<div style={{marginBottom:20}}>
        <h2 style={{fontFamily:'var(--font-d)',fontSize:22,fontWeight:700,marginBottom:4}}>Calculadora</h2>
        <p style={{fontSize:12,color:'var(--t3)'}}>ROAS, ROI, CPA, CPM, CTR, LTV e projeções de campanha.</p>
      </div>}

      {/* Tabs */}
      <div style={{display:'flex',gap:3,background:'var(--bg3)',borderRadius:10,padding:3,marginBottom:20,flexWrap:'wrap'}}>
        {TABS.map((t,i)=>(
          <button key={t} onClick={()=>setTab(i)} style={{flex:1,fontSize:12,padding:'6px 10px',borderRadius:8,background:tab===i?'var(--bg)':'transparent',color:tab===i?'var(--orange)':'var(--t2)',border:tab===i?'1px solid var(--b2)':'none',transition:'all .15s',fontWeight:tab===i?500:400,minWidth:80}}>
            {t}
          </button>
        ))}
      </div>

      {/* ROAS & ROI */}
      {tab===0&&(
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
          <div>
            <Inp label="Budget investido" value={budget} onChange={setBudget} prefix="R$"/>
            <Inp label="Receita gerada" value={revenue} onChange={setRevenue} prefix="R$"/>
            <Inp label="Conversões" value={conversions} onChange={setConv}/>
            <Inp label="Margem (%)" value={margin} onChange={setMargin} suffix="%"/>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            <Res label="ROAS" value={isNaN(ROAS)?'—':fmt(ROAS)+'x'} color='#FF5C2B' big formula={`R$${fmtR(r)} ÷ R$${fmtR(b)}`}/>
            <Res label="ROI" value={isNaN(ROI)?'—':fmt(ROI,1)+'%'} color={!isNaN(ROI)&&ROI>0?'#22C55E':'#EF4444'} formula={`(Receita − Budget) ÷ Budget`}/>
            <Res label="Lucro bruto" value={b>0&&r>0?fmtR(r-b):'—'} color='#22C55E' formula={`Receita − Budget`}/>
            <Res label="Lucro c/ margem" value={!isNaN(ROI)&&mar>0?fmtR((r-b)*(mar/100)):'—'} color='#A855F7'/>
            <div style={{background:'var(--bg3)',borderRadius:10,padding:'12px 14px',borderLeft:'3px solid var(--orange)'}}>
              <div style={{fontSize:10,color:'var(--t3)',marginBottom:6,textTransform:'uppercase',letterSpacing:'.06em'}}>Health score</div>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <div style={{flex:1,height:6,background:'var(--bg5)',borderRadius:3}}>
                  <div style={{height:'100%',width:healthScore+'%',background:healthScore>=70?'#22C55E':healthScore>=45?'#EAB308':'#EF4444',borderRadius:3,transition:'width .5s'}}/>
                </div>
                <span style={{fontSize:15,fontWeight:700,color:healthScore>=70?'#22C55E':healthScore>=45?'#EAB308':'#EF4444'}}>{healthScore}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CPA & CPM */}
      {tab===1&&(
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
          <div>
            <Inp label="Budget investido" value={budget} onChange={setBudget} prefix="R$"/>
            <Inp label="Conversões" value={conversions} onChange={setConv}/>
            <Inp label="Impressões" value={impressions} onChange={setImpr} hint="Para calcular CPM e CTR"/>
            <Inp label="Cliques" value={clicks} onChange={setClicks}/>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            <Res label="CPA" value={isNaN(CPA)?'—':fmtR(CPA)} color='#FF5C2B' big formula={`Budget ÷ Conversões`}/>
            <Res label="CPM" value={isNaN(CPM_calc)?'—':fmtR(CPM_calc)} color='#EAB308' formula={`(Budget ÷ Impressões) × 1000`}/>
            <Res label="CPC" value={isNaN(CPC_calc)?'—':fmtR(CPC_calc)} color='#3B82F6' formula={`Budget ÷ Cliques`}/>
            <Res label="CTR" value={isNaN(CTR_calc)?'—':fmt(CTR_calc,2)+'%'} color='#A855F7' formula={`(Cliques ÷ Impressões) × 100`}/>
            <Res label="Taxa de conversão" value={clk>0&&c>0?fmt((c/clk)*100,2)+'%':'—'} color='#22C55E' formula={`Conversões ÷ Cliques`}/>
          </div>
        </div>
      )}

      {/* Projeção */}
      {tab===2&&(
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
          <div>
            <div style={{fontSize:11,color:'var(--t3)',marginBottom:10,textTransform:'uppercase',letterSpacing:'.06em'}}>Base atual</div>
            <Inp label="Budget atual" value={budget} onChange={setBudget} prefix="R$"/>
            <Inp label="Receita atual" value={revenue} onChange={setRevenue} prefix="R$"/>
            <Inp label="Conversões atuais" value={conversions} onChange={setConv}/>
            <div style={{borderTop:'1px solid var(--b2)',paddingTop:12,marginTop:4}}>
              <div style={{fontSize:11,color:'var(--t3)',marginBottom:10,textTransform:'uppercase',letterSpacing:'.06em'}}>Metas</div>
              <Inp label="ROAS meta" value={targetRoas} onChange={setTRoas} suffix="x"/>
              <Inp label="CPA meta" value={targetCpa} onChange={setTCpa} prefix="R$"/>
            </div>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            <div style={{fontSize:11,color:'var(--t3)',marginBottom:2,textTransform:'uppercase',letterSpacing:'.06em'}}>Para atingir ROAS {troas>0?troas+'x':'meta'}</div>
            <Res label="Receita projetada (budget atual)" value={troas>0?fmtR(b*troas):'—'} color='#22C55E' big/>
            <Res label="Budget necessário (receita atual)" value={!isNaN(budgetFor)?fmtR(budgetFor):'—'} color='#FF5C2B'/>
            <div style={{borderTop:'1px solid var(--b2)',paddingTop:10,marginTop:2}}>
              <div style={{fontSize:11,color:'var(--t3)',marginBottom:8,textTransform:'uppercase',letterSpacing:'.06em'}}>Para atingir CPA {tcpa>0?'R$'+tcpa:'meta'}</div>
            </div>
            <Res label="Conversões projetadas" value={!isNaN(convsFor)?fmt(convsFor,0):'—'} color='#EAB308'/>
            <Res label="Budget para manter conversões" value={!isNaN(budgetForCpa)?fmtR(budgetForCpa):'—'} color='#3B82F6'/>
            <Res label="Diferença de budget" value={!isNaN(budgetForCpa)&&b>0?fmtR(budgetForCpa-b):'—'} color={budgetForCpa-b<0?'#22C55E':'#EF4444'}/>
          </div>
        </div>
      )}

      {/* LTV */}
      {tab===3&&(
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
          <div>
            <Inp label="Ticket médio" value={avgTicket} onChange={setTicket} prefix="R$"/>
            <Inp label="Frequência de compra / ano" value={purchaseFreq} onChange={setFreq} hint="Ex: 4 = compra 4x por ano"/>
            <Inp label="Tempo de vida do cliente (anos)" value={customerLife} onChange={setLife}/>
            <Inp label="Margem de lucro (%)" value={margin} onChange={setMargin} suffix="%"/>
            <Inp label="CPA atual" value={budget&&conversions?fmt(b/c,2):''} onChange={()=>{}} hint="Calculado automaticamente"/>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            <Res label="LTV bruto" value={isNaN(LTV)?'—':fmtR(LTV)} color='#FF5C2B' big formula={`Ticket × Frequência × Tempo de vida`}/>
            <Res label="LTV com margem" value={isNaN(LTV_mar)?'—':fmtR(LTV_mar)} color='#A855F7' formula={`LTV × Margem`}/>
            <Res label="CAC máximo recomendado" value={isNaN(CAC_max)?'—':fmtR(CAC_max)} color='#22C55E' formula={`LTV com margem × 30%`}/>
            <Res label="Relação LTV:CPA" value={!isNaN(LTV)&&c>0&&b>0?fmt(LTV/(b/c),1)+'x':'—'} color='#EAB308' formula={`LTV ÷ CPA atual`}/>
            <div style={{background:'var(--orangebg)',border:'1px solid var(--orangeline)',borderRadius:10,padding:'12px 14px',fontSize:12,color:'var(--t2)',lineHeight:1.7}}>
              💡 Relação LTV:CPA ideal é acima de <strong style={{color:'var(--orange)'}}>3x</strong>. Quanto maior, maior a margem para investir em aquisição.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

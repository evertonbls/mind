const KEY = 'bls_hub_v5';
export const IDEA_TYPES  = ['estrategia','criativo','teste','observacao'];
export const IDEA_LABELS = { estrategia:'Estratégia', criativo:'Criativo', teste:'Teste', observacao:'Observação' };
export const IDEA_COLORS = { estrategia:'#FF5C2B', criativo:'#22C55E', teste:'#EAB308', observacao:'#3B82F6' };
export const CLIENT_COLORS = ['#FF5C2B','#22C55E','#EAB308','#3B82F6','#A855F7','#EC4899','#14B8A6','#F97316'];

export function scoreColor(s){ if(s>=75)return'#22C55E'; if(s>=50)return'#EAB308'; if(s>0)return'#EF4444'; return'#555'; }
export function scoreLabel(s){ if(s>=75)return'Saudável'; if(s>=50)return'Atenção'; if(s>0)return'Crítico'; return'N/A'; }
export const uid = () => Math.random().toString(36).slice(2,9);

export const CAMPAIGN_STATUSES = { ativa:'Ativa', planejada:'Planejada', pausada:'Pausada', concluida:'Concluída' };
export const CAMPAIGN_COLORS   = { ativa:'#22C55E', planejada:'#3B82F6', pausada:'#EAB308', concluida:'#555' };

export const TEMPLATES = {
  funil: {
    label:'🎯 Funil de Vendas',
    nodes:[
      {id:'t1',type:'flow-start',    x:60, y:220,text:'Tráfego Frio',    color:'#FF5C2B',w:140,h:44},
      {id:'t2',type:'flow-step',     x:260,y:220,text:'Anúncio',         color:'#FF5C2B',w:130,h:44},
      {id:'t3',type:'flow-step',     x:450,y:220,text:'Landing Page',    color:'#FF7A50',w:130,h:44},
      {id:'t4',type:'flow-decision', x:640,y:220,text:'Converte?',       color:'#EAB308',w:130,h:44},
      {id:'t5',type:'flow-step',     x:840,y:155,text:'Obrigado + Upsell',color:'#22C55E',w:155,h:44},
      {id:'t6',type:'flow-step',     x:840,y:290,text:'Remarketing',     color:'#EF4444',w:130,h:44},
      {id:'t7',type:'flow-step',     x:1060,y:155,text:'LTV / Recorrência',color:'#22C55E',w:155,h:44},
    ],
    edges:[
      {id:'e1',from:'t1',to:'t2',label:''},
      {id:'e2',from:'t2',to:'t3',label:''},
      {id:'e3',from:'t3',to:'t4',label:''},
      {id:'e4',from:'t4',to:'t5',label:'Sim'},
      {id:'e5',from:'t4',to:'t6',label:'Não'},
      {id:'e6',from:'t5',to:'t7',label:''},
    ]
  },
  estrategia:{
    label:'🧠 Estratégia de Cliente',
    nodes:[
      {id:'r',  type:'mindmap-root',x:420,y:260,text:'Cliente',   color:'#FF5C2B',w:150,h:50},
      {id:'n1', type:'mindmap',     x:660,y:140,text:'Criativos', color:'#FF5C2B',w:120,h:40,parentId:'r'},
      {id:'n2', type:'mindmap',     x:660,y:260,text:'Estratégia',color:'#22C55E',w:120,h:40,parentId:'r'},
      {id:'n3', type:'mindmap',     x:660,y:380,text:'Resultados',color:'#3B82F6',w:120,h:40,parentId:'r'},
      {id:'n4', type:'mindmap',     x:860,y:100,text:'UGC',       color:'#FF5C2B',w:100,h:36,parentId:'n1'},
      {id:'n5', type:'mindmap',     x:860,y:180,text:'Carrossel', color:'#FF5C2B',w:100,h:36,parentId:'n1'},
      {id:'n6', type:'mindmap',     x:860,y:240,text:'Públicos',  color:'#22C55E',w:100,h:36,parentId:'n2'},
      {id:'n7', type:'mindmap',     x:860,y:320,text:'Budget',    color:'#22C55E',w:100,h:36,parentId:'n2'},
      {id:'n8', type:'mindmap',     x:860,y:380,text:'ROAS',      color:'#3B82F6',w:100,h:36,parentId:'n3'},
      {id:'n9', type:'mindmap',     x:860,y:440,text:'CPA',       color:'#3B82F6',w:100,h:36,parentId:'n3'},
      {id:'n10',type:'mindmap',     x:180,y:260,text:'Problemas', color:'#EF4444',w:120,h:40,parentId:'r'},
      {id:'n11',type:'mindmap',     x:10, y:220,text:'CPA alto',  color:'#EF4444',w:100,h:36,parentId:'n10'},
      {id:'n12',type:'mindmap',     x:10, y:300,text:'CTR baixo', color:'#EF4444',w:100,h:36,parentId:'n10'},
    ],
    edges:[]
  },
  analise:{
    label:'📊 Análise de Campanha',
    nodes:[
      {id:'r', type:'mindmap-root',x:400,y:280,text:'Campanha',    color:'#FF5C2B',w:140,h:48},
      {id:'n1',type:'mindmap',     x:640,y:160,text:'Métricas',    color:'#EAB308',w:120,h:40,parentId:'r'},
      {id:'n2',type:'mindmap',     x:640,y:280,text:'Criativos',   color:'#FF5C2B',w:120,h:40,parentId:'r'},
      {id:'n3',type:'mindmap',     x:640,y:400,text:'Audiência',   color:'#3B82F6',w:120,h:40,parentId:'r'},
      {id:'n4',type:'mindmap',     x:860,y:120,text:'ROAS',        color:'#EAB308',w:100,h:36,parentId:'n1'},
      {id:'n5',type:'mindmap',     x:860,y:200,text:'CPA/CPM',     color:'#EAB308',w:100,h:36,parentId:'n1'},
      {id:'n6',type:'mindmap',     x:860,y:260,text:'Top performer',color:'#22C55E',w:130,h:36,parentId:'n2'},
      {id:'n7',type:'mindmap',     x:860,y:330,text:'A pausar',    color:'#EF4444',w:120,h:36,parentId:'n2'},
      {id:'n8',type:'mindmap',     x:860,y:390,text:'Retargeting', color:'#3B82F6',w:120,h:36,parentId:'n3'},
      {id:'n9',type:'mindmap',     x:860,y:460,text:'Lookalike',   color:'#3B82F6',w:120,h:36,parentId:'n3'},
      {id:'s1',type:'sticky',      x:160,y:160,text:'📝 Observações aqui...',color:'#EAB308',w:160,h:80},
    ],
    edges:[]
  },
  blank:{ label:'⬜ Canvas em branco', nodes:[], edges:[] }
};

function mLabel(offset=0){
  const d=new Date(); d.setMonth(d.getMonth()+offset);
  return d.toLocaleString('pt-BR',{month:'short'}).replace('.','');
}
const M = [-5,-4,-3,-2,-1,0].map(mLabel);

const DEMO = {
  clients:[
    {
      id:'c1', name:'Exemplo Ltda', score:82, color:'#FF5C2B',
      roas:'4.2', cpa:'18', ctr:'3.1', cpc:'0.58', cpm:'12', budget:'5000', revenue:'21000', conversions:'280',
      platform:'Meta', niche:'E-commerce',
      meta_roas:'5.0', meta_cpa:'15', meta_budget:'6000', meta_revenue:'30000',
      notes:'ROAS estável nos últimos 30d. Testar criativos UGC no próximo ciclo.',
      history:[
        {month:M[0],roas:2.8,cpa:32,score:58,budget:3500,revenue:9800},
        {month:M[1],roas:3.1,cpa:28,score:63,budget:4000,revenue:12400},
        {month:M[2],roas:3.4,cpa:24,score:68,budget:4200,revenue:14280},
        {month:M[3],roas:3.8,cpa:21,score:74,budget:4500,revenue:17100},
        {month:M[4],roas:4.0,cpa:19,score:79,budget:4800,revenue:19200},
        {month:M[5],roas:4.2,cpa:18,score:82,budget:5000,revenue:21000},
      ],
      campaigns:[
        {id:'c1a',name:'Black Friday 2024', status:'concluida',start:'2024-11-01',end:'2024-11-30',budget:'8000',result:'ROAS 5.8x',color:'#22C55E'},
        {id:'c1b',name:'Remarketing Q1',    status:'ativa',    start:'2025-01-10',end:'2025-03-31',budget:'2000',result:'',         color:'#FF5C2B'},
        {id:'c1c',name:'Lançamento Verão',  status:'planejada',start:'2025-04-01',end:'2025-05-15',budget:'4500',result:'',         color:'#3B82F6'},
      ],
      ideas:[
        {id:'i1',text:'Testar vídeo UGC para remarketing',type:'criativo',done:false},
        {id:'i2',text:'Aumentar budget nos top adsets de sexta',type:'estrategia',done:false},
        {id:'i3',text:'Hook nos 3 primeiros segundos',type:'criativo',done:true},
      ],
      canvas:{...JSON.parse(JSON.stringify(TEMPLATES.funil))}
    },
    {
      id:'c2', name:'Startup XYZ', score:54, color:'#EAB308',
      roas:'1.8', cpa:'62', ctr:'1.2', cpc:'2.1', cpm:'28', budget:'2000', revenue:'3600', conversions:'42',
      platform:'Google', niche:'SaaS',
      meta_roas:'3.0', meta_cpa:'40', meta_budget:'3000', meta_revenue:'9000',
      notes:'CPA muito alto. Funil quebrando no meio.',
      history:[
        {month:M[0],roas:1.2,cpa:90,score:35,budget:1500,revenue:1800},
        {month:M[1],roas:1.3,cpa:82,score:38,budget:1600,revenue:2080},
        {month:M[2],roas:1.4,cpa:75,score:42,budget:1700,revenue:2380},
        {month:M[3],roas:1.5,cpa:70,score:46,budget:1800,revenue:2700},
        {month:M[4],roas:1.6,cpa:66,score:50,budget:1900,revenue:3040},
        {month:M[5],roas:1.8,cpa:62,score:54,budget:2000,revenue:3600},
      ],
      campaigns:[
        {id:'c2a',name:'Google Search Q4', status:'concluida',start:'2024-10-01',end:'2024-12-31',budget:'4000',result:'ROAS 1.4x',color:'#EAB308'},
        {id:'c2b',name:'Teste Landing Page',status:'ativa',    start:'2025-02-01',end:'2025-03-15',budget:'800', result:'',         color:'#FF5C2B'},
      ],
      ideas:[
        {id:'i1',text:'Criar campanha A/B na headline',type:'teste',done:false},
        {id:'i2',text:'Revisar funil de conversão',type:'estrategia',done:false},
      ],
      canvas:{...JSON.parse(JSON.stringify(TEMPLATES.estrategia))}
    }
  ],
  globalIdeas:[
    {id:'g1',text:'Hook de curiosidade nos 3 primeiros segundos',type:'criativo'},
    {id:'g2',text:'Testar bidding manual no Google em contas novas',type:'estrategia'},
  ]
};

export function loadData(){ try{ const r=localStorage.getItem(KEY); if(r)return JSON.parse(r); }catch{} return JSON.parse(JSON.stringify({...DEMO,crm:[],contracts:[],payments:[],creatives:[]})); }
export function saveData(d){ try{ localStorage.setItem(KEY,JSON.stringify(d)); }catch{} }

// ── Alert engine ──────────────────────────────────────────────────
export function computeAlerts(client){
  const alerts=[];
  const r=parseFloat(client.roas)||0, mr=parseFloat(client.meta_roas)||0;
  const p=parseFloat(client.cpa)||0,  mp=parseFloat(client.meta_cpa)||0;
  const b=parseFloat(client.budget)||0, mb=parseFloat(client.meta_budget)||0;
  const rv=parseFloat(client.revenue)||0, mrv=parseFloat(client.meta_revenue)||0;
  if(mr&&r<mr*0.7)  alerts.push({level:'danger', msg:`ROAS ${r}x está muito abaixo da meta (${mr}x)`, metric:'ROAS'});
  else if(mr&&r<mr) alerts.push({level:'warn',   msg:`ROAS ${r}x abaixo da meta de ${mr}x`, metric:'ROAS'});
  if(mp&&p>mp*1.5)  alerts.push({level:'danger', msg:`CPA R$${p} está ${Math.round((p/mp-1)*100)}% acima da meta`, metric:'CPA'});
  else if(mp&&p>mp) alerts.push({level:'warn',   msg:`CPA R$${p} acima da meta de R$${mp}`, metric:'CPA'});
  if(client.score<50) alerts.push({level:'danger', msg:`Score crítico: ${client.score}/100`, metric:'Score'});
  else if(client.score<65) alerts.push({level:'warn', msg:`Score abaixo de 65: atenção necessária`, metric:'Score'});
  if(mrv&&rv<mrv*0.6) alerts.push({level:'danger', msg:`Receita R$${rv} muito abaixo da meta (R$${mrv})`, metric:'Receita'});
  const h=client.history||[];
  if(h.length>=2){
    const prev=h[h.length-2], curr=h[h.length-1];
    if(curr.roas<prev.roas*0.9) alerts.push({level:'warn', msg:`ROAS caiu ${Math.round((1-curr.roas/prev.roas)*100)}% em relação ao mês anterior`, metric:'Tendência'});
    if(curr.cpa>prev.cpa*1.15)  alerts.push({level:'warn', msg:`CPA subiu ${Math.round((curr.cpa/prev.cpa-1)*100)}% vs mês anterior`, metric:'Tendência'});
  }
  return alerts;
}

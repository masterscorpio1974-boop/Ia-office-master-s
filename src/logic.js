let sheets=[
 {name:'Q1 Finanzas',data:[
  ['Concepto','Q4 Real','Q1 Meta','Variacion','Notas'],
  ['Ingresos','125400','140000','=C2-B2','Subio'],
  ['Costos','78200','75000','=C3-B3','Bajo'],
  ['Utilidad','=B2-B3','=C2-C3','=C4-B4','=D2-D3'],
  ['Margen %','=B4/B2*100','=C4/C2*100','=C5-B5','%']
 ]},
 {name:'Q2 Proyeccion',data:[
  ['Mes','Ventas','Gastos','Utilidad'],
  ['Enero','50000','30000','=B2-C2'],
  ['Febrero','65000','35000','=B3-C3'],
  ['Marzo','140000','75000','=B4-C4']
 ]}
];
let cur=0; let chartObj=null;
function render(){
 let cont=document.getElementById('tables'); cont.innerHTML='';
 sheets.forEach((sh,i)=>{
  let d=document.createElement('div'); d.id='s'+i; d.style.display=i==cur?'block':'none';
  let t=document.createElement('table'); t.id='tb'+i;
  sh.data.forEach((row,ri)=>{
   let tr=document.createElement('tr');
   row.forEach((cell,ci)=>{
    let el = (ri==0||ci==0)?document.createElement('th'):document.createElement('td');
    el.innerText=cell;
    if(ri>0&&ci>0){el.contentEditable=true; el.dataset.r=ri; el.dataset.c=ci; el.dataset.s=i;}
    if(ci==0) el.style.fontWeight='700';
    tr.appendChild(el);
   });
   t.appendChild(tr);
  });
  d.appendChild(t); cont.appendChild(d);
 });
 let tabs=document.getElementById('sheetTabs'); tabs.innerHTML='';
 sheets.forEach((sh,i)=>{
  let b=document.createElement('div'); b.className='sheet-tab'+(i==cur?' active':''); b.innerText=sh.name;
  b.onclick=()=>{cur=i; render(); calc();};
  tabs.appendChild(b);
 });
}
function evalCell(v, si){
 if(typeof v!=='string' ||!v.startsWith('=')) return v;
 let expr=v.slice(1).toUpperCase();
 try{
  expr=expr.replace(/SUM\(([A-Z]+\d+):([A-Z]+\d+)\)/g,(m,a,b)=>{let s=rangeVals(a,b,si); return '('+s.join('+')+')';});
  expr=expr.replace(/AVG\(([A-Z]+\d+):([A-Z]+\d+)\)/g,(m,a,b)=>{let s=rangeVals(a,b,si); return '('+s.join('+')+')/'+s.length;});
  expr=expr.replace(/[A-Z]+\d+/g,m=>{
   let col=m.charCodeAt(0)-65; let row=parseInt(m.slice(1))-1;
   let val=sheets[si].data[row]?.[col+1];
   if(val && (val+'').startsWith('=')) val=evalCell(val,si);
   let n=parseFloat(val); return isNaN(n)?0:n;
  });
  return Math.round(eval(expr)*100)/100;
 }catch(e){return '#ERR';}
}
function rangeVals(a,b,si){
 let c1=a.charCodeAt(0)-65, r1=parseInt(a.slice(1))-1;
 let c2=b.charCodeAt(0)-65, r2=parseInt(b.slice(1))-1;
 let vals=[];
 for(let r=r1;r<=r2;r++) for(let c=c1;c<=c2;c++){
  let v=sheets[si].data[r]?.[c+1]; let n=parseFloat(v); if(!isNaN(n)) vals.push(n);
 }
 return vals.length?vals:[0];
}
function calc(){
 sheets.forEach((sh,si)=>{
  let tb=document.getElementById('tb'+si); if(!tb) return;
  for(let r=1;r<tb.rows.length;r++){
   for(let c=1;c<tb.rows[r].cells.length;c++){
    let raw=sh.data[r]?.[c];
    if((raw+'').startsWith('=')){
     let res=evalCell(raw,si);
     tb.rows[r].cells[c].innerText=res;
    }
   }
  }
 });
}
function showTab(id){
 document.getElementById('d').style.display=id=='d'?'block':'none';
 document.getElementById('s').style.display=id=='s'?'block':'none';
 document.getElementById('ribbonDoc').style.display=id=='d'?'flex':'none';
 document.getElementById('ribbonSheet').style.display=id=='s'?'flex':'none';
 document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
 document.getElementById(id=='d'?'tD':'tS').classList.add('active');
 if(id=='s') calc();
}
function addRow(){sheets[cur].data.push(['Nuevo','0','0','=B'+sheets[cur].data.length+'-C'+sheets[cur].data.length,'']); render(); calc(); saveAll();}
function addCol(){sheets[cur].data[0].push('Col '+(sheets[cur].data[0].length)); sheets[cur].data.forEach((r,i)=>{if(i>0) r.push('0');}); render(); calc(); saveAll();}
function addSheet(){let n=prompt('Nombre de la hoja:','Hoja '+(sheets.length+1)); if(!n) return; sheets.push({name:n,data:[['Concepto','Valor'],['Dato','0']]}); cur=sheets.length-1; render(); calc(); saveAll();}
function showChart(){
 document.getElementById('chartWrap').style.display='block';
 let sh=sheets[cur]; let labels=[], data=[];
 for(let i=1;i<sh.data.length;i++){ labels.push(sh.data[i][0]); data.push(parseFloat(sh.data[i][1])||0); }
 let ctx=document.getElementById('myChart'); if(chartObj) chartObj.destroy();
 chartObj=new Chart(ctx,{type:'bar',data:{labels:labels,datasets:[{label:sh.name,data:data,backgroundColor:'#0a84ff'}]},options:{responsive:true}});
}
function saveAll(){
 localStorage.setItem('IA_DOC',document.getElementById('doc').innerHTML);
 localStorage.setItem('IA_SHEETS',JSON.stringify(sheets));
 document.getElementById('saveStatus').innerText='✅ Guardado';
 setTimeout(()=>{document.getElementById('saveStatus').innerText='';},2000);
}
function loadAll(){
 let d=localStorage.getItem('IA_DOC'); if(d) document.getElementById('doc').innerHTML=d;
 let s=localStorage.getItem('IA_SHEETS'); if(s){try{sheets=JSON.parse(s)}catch{}}
}
function exportDoc(){
 let content=document.getElementById('doc').innerHTML;
 let blob=new Blob(['<html><body>'+content+'</body></html>'],{type:'application/msword'});
 let a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='Documento_MASTER_S.doc'; a.click();
}
function exportExcel(){
 let csv=sheets[cur].data.map(r=>r.join(',')).join('\n');
 let blob=new Blob([csv],{type:'text/csv'}); let a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=sheets[cur].name+'.csv'; a.click();
}
function aiWrite(){
 let p=prompt('¿Qué quieres que escriba la IA? Ej: carta, reporte, resumen trimestral');
 if(!p) return;
 document.getElementById('doc').innerHTML+='<p><b>[IA MASTER S. - '+p+']</b></p><p>Estimado equipo, por medio de la presente se presenta el documento solicitado sobre '+p+'. Este informe incluye análisis detallado y conclusiones relevantes. Quedo atento a sus comentarios.</p><p>Atentamente,<br>MASTER S.</p>';
 saveAll();
}
document.addEventListener('input',e=>{
 if(e.target.dataset && e.target.dataset.r!==undefined){
  let s=parseInt(e.target.dataset.s), r=parseInt(e.target.dataset.r), c=parseInt(e.target.dataset.c);
  sheets[s].data[r][c]=e.target.innerText;
  setTimeout(()=>{calc(); saveAll();},200);
 }
 if(e.target.id=='doc'){ setTimeout(saveAll,400); }
});
loadAll(); render(); calc();

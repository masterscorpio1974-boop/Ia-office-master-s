let rangoGuardado = null;
function guardarSeleccion(){const s=window.getSelection();if(s.rangeCount>0){rangoGuardado=s.getRangeAt(0).cloneRange();}}
function restaurarSeleccion(){if(rangoGuardado){const s=window.getSelection();s.removeAllRanges();s.addRange(rangoGuardado);}}
function cambiarVista(v){const d=document.getElementById('docView'),s=document.getElementById('sheetView'),rd=document.getElementById('ribbonDoc'),rs=document.getElementById('ribbonSheet'),td=document.getElementById('tabDoc'),ts=document.getElementById('tabSheet');if(v==='doc'){d.style.display='block';rd.style.display='block';s.style.display='none';rs.style.display='none';td.classList.add('active');ts.classList.remove('active');}else{d.style.display='none';rd.style.display='none';s.style.display='block';rs.style.display='block';td.classList.remove('active');ts.classList.add('active');}}
function aplicarEstilo(c){restaurarSeleccion();document.execCommand(c,false,null);guardarSeleccion();}
function aplicarColor(c){restaurarSeleccion();document.execCommand('foreColor',false,c);guardarSeleccion();}
function aplicarTamano(t){restaurarSeleccion();document.execCommand('fontSize',false,t);guardarSeleccion();}

function crearNuevo(){
    if(confirm("¿Borrar todo y empezar un documento nuevo?")){
        document.getElementById('docView').innerHTML="<p>Escribe aquí tu documento...</p>";
        rangoGuardado=null;
        localStorage.removeItem('o_doc');
        localStorage.setItem('o_doc_was_new','1');
        notificarStatus("Nuevo documento creado");
    }
}
function crearNuevoSheet(){
    if(confirm("¿Borrar la hoja y empezar una nueva vacía?")){
        localStorage.removeItem('o_sheet');
        localStorage.setItem('o_sheet_was_new','1');
        document.getElementById('graficaWrap').style.display='none';
        document.getElementById('contenedorTabla').innerHTML=`
            <div style="font-weight:bold;margin-bottom:10px;font-size:14px;">Hoja Nueva - Vacía</div>
            <table id="tablaDatos">
                <thead><tr>
                    <th style="text-align:left;border:1px solid #ccc;padding:6px;background:#f2f2f2;">Alumno</th>
                    <th style="border:1px solid #ccc;padding:6px;background:#f2f2f2;">Parcial 1</th>
                    <th style="border:1px solid #ccc;padding:6px;background:#f2f2f2;">Parcial 2</th>
                    <th style="border:1px solid #ccc;padding:6px;background:#f2f2f2;">Promedio Final</th>
                </tr></thead>
                <tbody>
                    <tr><td contenteditable="true" style="border:1px solid #ccc;padding:6px;"></td><td contenteditable="true" class="p1" oninput="calcularFila(this)" style="border:1px solid #ccc;"></td><td contenteditable="true" class="p2" oninput="calcularFila(this)" style="border:1px solid #ccc;"></td><td class="res" style="font-weight:bold;border:1px solid #ccc;">0</td></tr>
                    <tr><td contenteditable="true" style="border:1px solid #ccc;padding:6px;"></td><td contenteditable="true" class="p1" oninput="calcularFila(this)" style="border:1px solid #ccc;"></td><td contenteditable="true" class="p2" oninput="calcularFila(this)" style="border:1px solid #ccc;"></td><td class="res" style="font-weight:bold;border:1px solid #ccc;">0</td></tr>
                    <tr><td contenteditable="true" style="border:1px solid #ccc;padding:6px;"></td><td contenteditable="true" class="p1" oninput="calcularFila(this)" style="border:1px solid #ccc;"></td><td contenteditable="true" class="p2" oninput="calcularFila(this)" style="border:1px solid #ccc;"></td><td class="res" style="font-weight:bold;border:1px solid #ccc;">0</td></tr>
                </tbody>
            </table>`;
        notificarStatus("Hoja nueva vacía creada");
    }
}
function cargarDatosGuardados(){
    const docView=document.getElementById('docView');
    if(docView.style.display!=='none'){
        const b=localStorage.getItem('o_doc_backup');
        if(!b){alert("No hay documento guardado. Dale a Guardar todo primero.");return;}
        if(confirm("¿Restaurar documento guardado?")){docView.innerHTML=b;localStorage.setItem('o_doc',b);localStorage.removeItem('o_doc_was_new');notificarStatus("Documento restaurado");}
        return;
    }else{
        const b=localStorage.getItem('o_sheet_backup');
        if(!b){alert("No hay hoja guardada. Dale a Guardar todo primero.");return;}
        cambiarVista('sheet');
        document.getElementById('contenedorTabla').innerHTML=`<div style="font-weight:bold;margin-bottom:10px;font-size:14px;">Registro (Restaurado)</div><table id="tablaDatos">${b}</table>`;
        document.querySelectorAll('.p1,.p2').forEach(c=>c.setAttribute('oninput','calcularFila(this)'));
        generarGraficaLocal();
        localStorage.setItem('o_sheet',b);
        localStorage.removeItem('o_sheet_was_new');
        notificarStatus("Hoja restaurada");
    }
}
function insertarNuevaHoja(){
    document.getElementById('graficaWrap').style.display='none';
    document.getElementById('contenedorTabla').innerHTML=`
        <div style="font-weight:bold;margin-bottom:10px;font-size:14px;">Registro de Evaluaciones Académicas</div>
        <table id="tablaDatos">
            <thead><tr><th style="text-align:left;border:1px solid #ccc;padding:6px;background:#f2f2f2;">Alumno</th><th style="border:1px solid #ccc;padding:6px;background:#f2f2f2;">Parcial 1</th><th style="border:1px solid #ccc;padding:6px;background:#f2f2f2;">Parcial 2</th><th style="border:1px solid #ccc;padding:6px;background:#f2f2f2;">Promedio Final</th></tr></thead>
            <tbody>
                <tr><td contenteditable="true" style="text-align:left;border:1px solid #ccc;padding:6px;">Juan Pérez</td><td contenteditable="true" class="p1" oninput="calcularFila(this)" style="border:1px solid #ccc;">8</td><td contenteditable="true" class="p2" oninput="calcularFila(this)" style="border:1px solid #ccc;">7</td><td class="res" style="font-weight:bold;border:1px solid #ccc;">7.5</td></tr>
                <tr><td contenteditable="true" style="text-align:left;border:1px solid #ccc;padding:6px;">María Gómez</td><td contenteditable="true" class="p1" oninput="calcularFila(this)" style="border:1px solid #ccc;">10</td><td contenteditable="true" class="p2" oninput="calcularFila(this)" style="border:1px solid #ccc;">9</td><td class="res" style="font-weight:bold;border:1px solid #ccc;">9.5</td></tr>
                <tr><td contenteditable="true" style="text-align:left;border:1px solid #ccc;padding:6px;">Carlos López</td><td contenteditable="true" class="p1" oninput="calcularFila(this)" style="border:1px solid #ccc;">6</td><td contenteditable="true" class="p2" oninput="calcularFila(this)" style="border:1px solid #ccc;">5</td><td class="res" style="font-weight:bold;color:red;border:1px solid #ccc;">5.5</td></tr>
            </tbody>
        </table>`;
}
function calcularFila(c){const f=c.parentElement;const p1=parseFloat(f.querySelector('.p1').innerText.trim()||0);const p2=parseFloat(f.querySelector('.p2').innerText.trim()||0);const r=f.querySelector('.res'),p=((p1+p2)/2).toFixed(1);r.innerText=p;r.style.color=p>=6?'green':'red';}
function generarGraficaLocal(){const t=document.getElementById('tablaDatos');if(!t)return;let n=[],p=[];t.querySelectorAll('tbody tr').forEach(f=>{const nom=f.cells[0].innerText.trim(),prom=parseFloat(f.querySelector('.res').innerText.trim());if(nom&&!isNaN(prom)){n.push(nom);p.push(prom);}});if(p.length===0)return;document.getElementById('graficaWrap').style.display='block';const can=document.getElementById('miGrafica'),ctx=can.getContext('2d');ctx.clearRect(0,0,can.width,can.height);const pad=25,esp=15,am=can.width-(pad*2),al=can.height-(pad*2)-10,ab=(am-(esp*(p.length-1)))/p.length;p.forEach((val,i)=>{const h=(val/10)*al,x=pad+i*(ab+esp),y=can.height-pad-h;ctx.fillStyle='#2b579a';ctx.fillRect(x,y,ab,h);ctx.fillStyle='#000';ctx.font='bold 9px sans-serif';ctx.textAlign='center';ctx.fillText(val,x+(ab/2),y-4);ctx.font='8px sans-serif';ctx.fillText(n[i].split(' ')[0],x+(ab/2),can.height-pad+12);});}
function copiarDocumento(){const t=document.getElementById('docView').innerText;navigator.clipboard.writeText(t).then(()=>notificarStatus("¡Documento copiado!"));}
function exportarExcel(){const t=document.getElementById('tablaDatos');if(!t){alert("No hay tabla para copiar.");return;}let txt="";t.querySelectorAll('tr').forEach(f=>{let d=[];f.querySelectorAll('th,td').forEach(c=>{d.push(c.innerText);});txt+=d.join("\t")+"\n";});navigator.clipboard.writeText(txt).then(()=>notificarStatus("¡Tabla copiada!"));}
function exportarPDF(){notificarStatus("Generando PDF limpio...");const rD=document.getElementById('ribbonDoc'),rS=document.getElementById('ribbonSheet'),tabs=document.querySelector('.tabs'),st=document.querySelector('.status-bar'),hd=document.querySelector('.head');rD.style.display='none';rS.style.display='none';tabs.style.display='none';st.style.display='none';hd.style.display='none';setTimeout(()=>{window.print();setTimeout(()=>{hd.style.display='';tabs.style.display='';st.style.display='';const dV=document.getElementById('docView');if(dV.style.display!=='none'){rD.style.display='block';}else{rS.style.display='block';}notificarStatus("PDF listo");},500);},300);}
function saveAll(){
    const docHTML=document.getElementById('docView').innerHTML;
    localStorage.setItem('o_doc',docHTML);
    localStorage.setItem('o_doc_backup',docHTML);
    localStorage.removeItem('o_doc_was_new');
    const t=document.getElementById('tablaDatos');
    if(t){localStorage.setItem('o_sheet',t.innerHTML);localStorage.setItem('o_sheet_backup',t.innerHTML);localStorage.removeItem('o_sheet_was_new');}
    notificarStatus("¡TODO GUARDADO SECO EN LOCAL!");
}
function notificarStatus(m){const el=document.getElementById('saveStatus');if(el)el.innerText=m;setTimeout(()=>{if(el)el.innerText="LISTO - OFFLINE SIN CONEXIONES EXTERNAS";},2500);}
window.onload=function(){
    const wasDocNew=localStorage.getItem('o_doc_was_new');
    const wasSheetNew=localStorage.getItem('o_sheet_was_new');
    const rd=localStorage.getItem('o_doc');
    if(rd&&!wasDocNew){document.getElementById('docView').innerHTML=rd;}
    cambiarVista('doc');

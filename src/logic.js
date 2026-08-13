function cambiarPestaña(q){
    document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'))
    event.target.classList.add('active')
    document.getElementById('doc').style.display = q==='doc'?'block':'none'
    document.getElementById('sheet').style.display = q==='sheet'?'block':'none'
    document.getElementById('ribbonDoc').style.display = q==='doc'?'flex':'none'
    document.getElementById('ribbonSheet').style.display = q==='sheet'?'flex':'none'
}
function formato(t){document.execCommand(t)}
function fuente(t){document.execCommand('fontSize',false,t)}
function colorTexto(t){document.execCommand('foreColor',false,t)}
function alinear(t){document.execCommand('justify'+t[0].toUpperCase()+t.slice(1))}
function lista(){document.execCommand('insertUnorderedList')}
function guardar(){
    localStorage.setItem('doc',document.getElementById('doc').innerHTML)
    document.getElementById('saveStatus').textContent='✅ Guardado'
    setTimeout(()=>document.getElementById('saveStatus').textContent='',2000)
}
function saveAll(){guardar()}
function escribirIA(){
    let txt = prompt('Escribe qué quieres generar:')
    if(txt) alert('Modo sin conexión activo:\nEscribe el contenido manualmente o usa Ollama en segundo plano.\nTu solicitud: '+txt)
}
function nuevaHoja(){document.getElementById('hojas').innerHTML+='<br><textarea style="width:100%;height:150px;border:1px solid #ddd;padding:8px">Nueva hoja</textarea>'}
function exportarExcel(){alert('Exportar Excel: copia y pega en tu hoja de cálculo')}
function exportarPDF(){alert('Exportar PDF: usa la opción Imprimir → Guardar como PDF')}
function grafica(){document.getElementById('graficaWrap').style.display='block'}
window.onload=()=>{
    if(localStorage.getItem('doc')) document.getElementById('doc').innerHTML = localStorage.getItem('doc')
}

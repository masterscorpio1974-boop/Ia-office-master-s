// OFFICE_ASSISTANT - By MASTER S. - VERSION OFICIAL FIX V4
let datosDoc = localStorage.getItem('doc') || '';
let datosHoja = JSON.parse(localStorage.getItem('hoja') || '{}');

document.addEventListener('DOMContentLoaded', () => {
    if(document.getElementById('editorDocumento')) {
        document.getElementById('editorDocumento').innerHTML = datosDoc;
        document.getElementById('editorDocumento').addEventListener('input', guardarTodo);
    }
    cargarHoja();
});

function guardarTodo() {
    const editor = document.getElementById('editorDocumento');
    if(editor) {
        localStorage.setItem('doc', editor.innerHTML);
        document.querySelector('.status').innerText = '¡GUARDADO! ' + new Date().toLocaleTimeString();
    }
    guardarHoja();
}

// --- DOCUMENTO FIX ---
function formatoDoc(tipo, val=null) {
    const ed = document.getElementById('editorDocumento');
    ed.focus();
    if(tipo === 'color') {
        document.execCommand('foreColor', false, val);
    } else if(tipo === 'B') {
        document.execCommand('bold', false, null);
    } else if(tipo === 'I') {
        document.execCommand('italic', false, null);
    } else if(tipo === 'U') {
        document.execCommand('underline', false, null);
    } else if(tipo === 'G') {
        document.execCommand('fontSize', false, '5'); // Grande
    } else if(tipo === 'XG') {
        document.execCommand('fontSize', false, '7'); // Extra grande
    } else if(tipo === 'Normal') {
        document.execCommand('removeFormat', false, null);
        document.execCommand('fontSize', false, '3');
    }
    guardarTodo();
}

function setColorDoc(hex) { formatoDoc('color', hex); }

function nuevoDoc() {
    if(confirm('¿Borrar doc? Se respalda')) {
        document.getElementById('editorDocumento').innerHTML = '';
        guardarTodo();
    }
}

function copiarDoc() {
    const ed = document.getElementById('editorDocumento');
    navigator.clipboard.writeText(ed.innerText);
    alert('Copiado');
}

// OJO - VER DATOS FIX
function verDatos() {
    const doc = document.getElementById('editorDocumento').innerHTML;
    let hojaTxt = '';
    for(let r=1; r<=13; r++) {
        for(let c=0; c<8; c++) {
            let letra = String.fromCharCode(65+c);
            let id = letra+r;
            let el = document.getElementById(id);
            if(el && el.value) hojaTxt += `${id}:${el.value} `;
        }
    }
    let win = window.open('', '_blank');
    win.document.write(`<h2>DOCUMENTO:</h2>${doc}<hr><h2>HOJA:</h2><pre>${hojaTxt}</pre>`);
}

// PDF FIX
function exportarPDF() {
    const contenido = document.getElementById('editorDocumento').innerText;
    let w = window.open('', '_blank');
    w.document.write(`<pre>${contenido}</pre>`);
    w.print();
}

// --- HOJA CALCULO FIX ---
function cargarHoja() {
    Object.keys(datosHoja).forEach(id => {
        let el = document.getElementById(id);
        if(el) el.value = datosHoja[id];
    });
}

function guardarHoja() {
    let obj = {};
    for(let r=1; r<=24; r++) {
        for(let c=0; c<8; c++) {
            let id = String.fromCharCode(65+c)+r;
            let el = document.getElementById(id);
            if(el && el.value) obj[id] = el.value;
        }
    }
    localStorage.setItem('hoja', JSON.stringify(obj));
    actualizarGrafica();
}

function actualizarGrafica() {
    // tu funcion de grafica que ya jala
    let vals = [];
    ['A24','B24','C24','D24','E24'].forEach(id => {
        let el = document.getElementById(id);
        vals.push(el? parseInt(el.value)||0 : 0);
    });
    // aqui dibuja barras
    let g = document.getElementById('grafica');
    if(g) {
        g.innerHTML = vals.map(v=>`<div style="height:${v*5}px;background:#1a4a8a;display:inline-block;width:30px;margin:2px"><small>${v}</small></div>`).join('');
    }
}

function exportarExcel() {
    let csv = '';
    for(let r=1; r<=24; r++) {
        let fila = [];
        for(let c=0; c<8; c++) {
            let id = String.fromCharCode(65+c)+r;
            let el = document.getElementById(id);
            fila.push(el? el.value : '');
        }
        csv += fila.join(',') + '\n';
    }
    let blob = new Blob([csv], {type:'text/csv'});
    let a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'hoja.csv';
    a.click();
}

function nuevaHoja() {
    if(confirm('¿Borrar hoja? Se respalda')) {
        localStorage.removeItem('hoja');
        document.querySelectorAll('#tablaCalculo input').forEach(i=>i.value='');
    }
}

// Conectar inputs de la hoja
document.addEventListener('input', (e)=>{
    if(e.target.tagName === 'INPUT' && e.target.id.match(/^[A-H]\d+/)) {
        guardarHoja();
    }
});

// OFFICE ASSISTANT - By MASTER S. - VERSION OFICIAL FIX V4
let datosDoc = localStorage.getItem('doc') || '';
let datosHoja = JSON.parse(localStorage.getItem('hoja')) || {};

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('editorDocumento')) {
        document.getElementById('editorDocumento').innerHTML = datosDoc;
        document.getElementById('editorDocumento').addEventListener('input', guardarTodo);
    }
    cargarHoja();
});

function guardarTodo() {
    const editor = document.getElementById('editorDocumento');
    if (editor) {
        localStorage.setItem('doc', editor.innerHTML);
        document.querySelector('.status').innerText = '¡GUARDADO! ' + new Date().toLocaleTimeString();
    }
    guardarHoja();
}

// --- DOCUMENTO FIX ---
function formatoDoc(tipo, val = null) {
    const ed = document.getElementById('editorDocumento');
    ed.focus();
    if (tipo === 'color') {
        document.execCommand('foreColor', false, val);
    } else if (tipo === 'B') {
        document.execCommand('bold', false, null);
    } else if (tipo === 'I') {
        document.execCommand('italic', false, null);
    } else if (tipo === 'U') {
        document.execCommand('underline', false, null);
    } else if (tipo === 'G') {
        document.execCommand('fontSize', false, '5'); // Grande
    } else if (tipo === 'XG') {
        document.execCommand('fontSize', false, '7'); // Extra grande
    } else if (tipo === 'Normal') {
        document.execCommand('removeFormat', false, null);
        document.execCommand('fontSize', false, '3');
    } else {
        document.execCommand(tipo, false, null);
    }
    guardarTodo();
}

function setColorDoc(hex) { 
    formatoDoc('color', hex); 
}

function nuevoDoc() {
    if (confirm('¿Borrar doc? Se respaldará')) {
        document.getElementById('editorDocumento').innerHTML = '';
        guardarTodo();
    }
}

function copiarDocu() {
    const ed = document.getElementById('editorDocumento');
    navigator.clipboard.writeText(ed.innerText);
    alert('Copiado');
}

// --- VER DATOS FIX ---
function verDatos() {
    const doc = document.getElementById('editorDocumento').innerHTML;
    let hojaTxt = '';
    for (let r = 1; r <= 24; r++) {
        for (let c = 0; c < 8; c++) {
            let letra = String.fromCharCode(65 + c);
            let id = letra + r;
            let el = document.getElementById(id);
            if (el && el.value) hojaTxt += `${id}:${el.value} `;
        }
    }
    let win = window.open('', '_blank');
    win.document.write(`<h2>DOCUMENTO:</h2>${doc}<hr><h2>HOJA:</h2><pre>${hojaTxt}</pre>`);
}

// --- PDF FIX
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
        if (el) el.value = datosHoja[id];
    });
}

function guardarHoja() {
    let obj = {};
    for (let r = 1; r <= 24; r++) {
        for (let c = 0; c < 8; c++) {
            let letra = String.fromCharCode(65 + c);
            let id = letra + r;
            let el = document.getElementById(id);
            if (el && el.value) obj[id] = el.value;
        }
    }
    localStorage.setItem('hoja', JSON.stringify(obj));
    actualizarGrafica();
}

function actualizarGrafica() {
    let vals = [];
    ['A24', 'B24', 'C24', 'D24', 'E24'].forEach(id => {
        let el = document.getElementById(id);
        vals.push(el ? parseInt(el.value) || 0 : 0);
    });
    
    // Aquí dibuja barras
    let g = document.getElementById('graficaWrap');
    if (g) {
        g.innerHTML = vals.map(v => `<div style="height:${v * 5}px; background:#1a4a8a; display:inline-block; width:30px; margin:2px;"></div>`).join('');
    }
}

function exportarExcel() {
    let csv = '';
    for (let r = 1; r <= 24; r++) {
        let fila = [];
        for (let c = 0; c < 8; c++) {
            let id = String.fromCharCode(65 + c) + r;
            let el = document.getElementById(id);
            fila.push(el ? el.value : '');
        }
        csv += fila.join(',') + '\n';
    }
    let blob = new Blob([csv], { type: 'text/csv' });
    let a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'hoja.csv';
    a.click();
}

function nuevaHoja() {
    if (confirm('¿Borrar hoja? Se respalda')) {
        localStorage.removeItem('hoja');
        document.querySelectorAll('#contenedorTabla input').forEach(i => i.value = '');
    }
}

// Conectar inputs de la hoja
document.addEventListener('input', (e) => {
    if (e.target.tagName === 'INPUT' && e.target.id.match(/^[A-H]\d+$/)) {
        guardarHoja();
    }
});

// --- CONTROLADOR DE VISTAS (Pestañas) ---
function cambiarVista(vista) {
    const docView = document.getElementById('docView');
    const sheetView = document.getElementById('sheetView');
    const ribbonDoc = document.getElementById('ribbonDoc');
    const ribbonSheet = document.getElementById('ribbonSheet');
    const tabDoc = document.getElementById('tabDoc');
    const tabSheet = document.getElementById('tabSheet');

    if (vista === 'doc') {
        if (docView) docView.style.display = 'block';
        if (sheetView) sheetView.style.display = 'none';
        if (ribbonDoc) ribbonDoc.style.display = 'block';
        if (ribbonSheet) ribbonSheet.style.display = 'none';
        if (tabDoc) tabDoc.classList.add('active');
        if (tabSheet) tabSheet.classList.remove('active');
    } else if (vista === 'sheet') {
        if (docView) docView.style.display = 'none';
        if (sheetView) sheetView.style.display = 'block';
        if (ribbonDoc) ribbonDoc.style.display = 'none';
        if (ribbonSheet) ribbonSheet.style.display = 'block';
        if (tabDoc) tabDoc.classList.remove('active');
        if (tabSheet) tabSheet.classList.add('active');
        
        cargarHoja();
    }
}

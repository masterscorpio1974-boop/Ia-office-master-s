// ==========================================
// CEREBRO DE OPERACIONES - BY MASTER S.
// ==========================================

// Base de Datos Unificada en un solo Objeto JSON Estructurado
let APP_DATABASE = JSON.parse(localStorage.getItem('OFFICE_STORE')) || {
    word_content: "Escribe aquí tu documento...",
    excel_matrix: {}
};

// Configuración de dimensiones de la Hoja
const TOTAL_FILAS = 24;
const TOTAL_COLUMNAS = 8; // De la A a la H

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar Componente de Word
    const editorWord = document.getElementById('panel-word');
    if (editorWord) {
        editorWord.innerHTML = APP_DATABASE.word_content;
        editorWord.addEventListener('input', () => {
            APP_DATABASE.word_content = editorWord.innerHTML;
            guardarEnAlmacenamiento();
        });
    }

    // Inicializar e Inyectar la Matriz de Excel de forma dinámica
    construirMatrizExcel(TOTAL_FILAS, TOTAL_COLUMNAS);
    cargarDatosMatriz();
});

// --- ENRUTADOR DE PESTAÑAS (CAMBIO DE MODO) ---
function cambiarModo(nuevoModo) {
    document.getElementById('app-container').setAttribute('data-modo', nuevoModo);
    
    // Alternar clases activas de botones de navegación
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`tab-${nuevoModo}`).classList.add('active');
    
    // Si entra a Excel, refrescar datos e interfaz de celdas
    if (nuevoModo === 'excel') {
        cargarDatosMatriz();
    }
}

// --- PERSISTENCIA DE DATOS SEGURA ---
function guardarEnAlmacenamiento() {
    localStorage.setItem('OFFICE_STORE', JSON.stringify(APP_DATABASE));
    const status = document.getElementById('saveStatus');
    status.innerText = 'GUARDADO ' + new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'});
}

// ==========================================
// LÓGICA DEL COMPONENTE WORD
// ==========================================
function formatoDoc(tipo, val = null) {
    document.getElementById('panel-word').focus();
    if (tipo === 'G') {
        document.execCommand('fontSize', false, '4'); // Controlado profesional
    } else if (tipo === 'XG') {
        document.execCommand('fontSize', false, '5'); // Controlado profesional
    } else if (tipo === 'Normal') {
        document.execCommand('removeFormat', false, null);
        document.execCommand('fontSize', false, '3');
    } else {
        document.execCommand(tipo, false, val);
    }
    APP_DATABASE.word_content = document.getElementById('panel-word').innerHTML;
    guardarEnAlmacenamiento();
}

function setColorDoc(hex) { formatoDoc('foreColor', hex); }

function nuevoDoc() {
    if (confirm('¿Deseas vaciar el documento de texto?')) {
        document.getElementById('panel-word').innerHTML = '';
        APP_DATABASE.word_content = '';
        guardarEnAlmacenamiento();
    }
}

function copiarDocu() {
    const txt = document.getElementById('panel-word').innerText;
    navigator.clipboard.writeText(txt);
    alert('¡Copiado al portapapeles con éxito!');
}

// ==========================================
// LÓGICA DEL COMPONENTE EXCEL (MATRIZ DINÁMICA)
// ==========================================
function construirMatrizExcel(filas, columnas) {
    const panel = document.getElementById('panel-excel');
    panel.innerHTML = `
        <div class="excel-scroll-wrapper">
            <table class="excel-grid">
                <thead>
                    <tr id="excel-header-row"><th>#</th></tr>
                </thead>
                <tbody id="excel-body-rows"></tbody>
            </table>
        </div>
        <div id="graficaContainer"></div>
    `;

    // 1. Pintar cabecera alfabética
    const headerRow = document.getElementById('excel-header-row');
    for (let c = 0; c < columnas; c++) {
        headerRow.innerHTML += `<th>${String.fromCharCode(65 + c)}</th>`;
    }

    // 2. Pintar las filas e inyectar inputs estructurados con escuchas
    const bodyRows = document.getElementById('excel-body-rows');
    for (let f = 1; f <= filas; f++) {
        let tr = document.createElement('tr');
        tr.innerHTML = `<td class="row-number">${f}</td>`;
        
        for (let c = 0; c < columnas; c++) {
            let idCelda = `${String.fromCharCode(65 + c)}${f}`;
            let td = document.createElement('td');
            let input = document.createElement('input');
            input.id = idCelda;
            input.type = 'text';
            
            // Escucha de escritura en tiempo real para guardar celdas individuales
            input.addEventListener('input', (e) => {
                if (e.target.value.trim() !== "") {
                    APP_DATABASE.excel_matrix[idCelda] = e.target.value;
                } else {
                    delete APP_DATABASE.excel_matrix[idCelda];
                }
                guardarEnAlmacenamiento();
                actualizarGraficaMuestra();
            });

            td.appendChild(input);
            tr.appendChild(td);
        }
        bodyRows.appendChild(tr);
    }
}

function cargarDatosMatriz() {
    // Limpiar todos los inputs primero
    document.querySelectorAll('.excel-grid input').forEach(inp => inp.value = '');
    // Inyectar solo los guardados en la BD
    Object.keys(APP_DATABASE.excel_matrix).forEach(id => {
        let input = document.getElementById(id);
        if (input) input.value = APP_DATABASE.excel_matrix[id];
    });
    actualizarGraficaMuestra();
}

function limpiarHoja() {
    if (confirm('¿Seguro que deseas borrar todas las celdas de la Hoja de Cálculo?')) {
        APP_DATABASE.excel_matrix = {};
        guardarEnAlmacenamiento();
        cargarDatosMatriz();
    }
}

function actualizarGraficaMuestra() {
    const contenedorG = document.getElementById('graficaContainer');
    if (!contenedorG) return;
    
    // Mapea los valores de las últimas celdas de control (A24 a E24) para la gráfica de barras
    const celdasControl = ['A24', 'B24', 'C24', 'D24', 'E24'];
    let htmlBarras = '';
    
    celdasControl.forEach(id => {
        let val = parseInt(APP_DATABASE.excel_matrix[id]) || 0;
        let altoPixel = Math.min(val * 3, 140); // Escalador visual seguro
        htmlBarras += `<div class="bar-chart" style="height:${altoPixel}px;">${val}<br><small style="font-size:8px;">${id}</small></div>`;
    });
    contenedorG.innerHTML = htmlBarras;
}

function alternarGrafica() {
    const g = document.getElementById('graficaContainer');
    g.style.display = (g.style.display === 'flex') ? 'none' : 'flex';
}

function verMetadatosMatriz() {
    let raw = JSON.stringify(APP_DATABASE.excel_matrix, null, 2);
    let win = window.open('', '_blank');
    win.document.write(`<h3>Estructura JSON de la Hoja (Raw Data):</h3><pre>${raw}</pre>`);
}

function exportarCSV() {
    let csvContent = '';
    for (let f = 1; f <= TOTAL_FILAS; f++) {
        let lineaFila = [];
        for (let c = 0; c < TOTAL_COLUMNAS; c++) {
            let idCelda = `${String.fromCharCode(65 + c)}${f}`;
            let valor = APP_DATABASE.excel_matrix[idCelda] || '';
            lineaFila.push(`"${valor.replace(/"/g, '""')}"`);
        }
        csvContent += lineaFila.join(',') + '\n';
    }
    
    let blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    let link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Reporte_Oficina_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
}

function cambiarVista(vista) {
    const docView = document.getElementById('docView');
    const sheetView = document.getElementById('sheetView');
    const ribbonDoc = document.getElementById('ribbonDoc');
    const ribbonSheet = document.getElementById('ribbonSheet');
    const tabDoc = document.getElementById('tabDoc');
    const tabSheet = document.getElementById('tabSheet');

    if (vista === 'doc') {
        docView.style.display = 'block';
        ribbonDoc.style.display = 'block';
        sheetView.style.display = 'none';
        ribbonSheet.style.display = 'none';
        tabDoc.classList.add('active');
        tabSheet.classList.remove('active');
    } else {
        docView.style.display = 'none';
        ribbonDoc.style.display = 'none';
        sheetView.style.display = 'block';
        ribbonSheet.style.display = 'block';
        tabDoc.classList.remove('active');
        tabSheet.classList.add('active');
    }
}

function formato(comando) { document.execCommand(comando, false, null); }
function alinear(direccion) { document.execCommand(direccion, false, null); }
function ejecutarComando(comando, valor) { document.execCommand(comando, false, valor); }
function cambiarTamanoFuente(size) { document.execCommand('fontSize', false, size); }
function cambiarColorTexto(color) { if(color !== "false") document.execCommand('foreColor', false, color); }

function insertarNuevaHoja() {
    document.getElementById('graficaWrap').style.display = 'none';
    const contenedor = document.getElementById('contenedorTabla');
    contenedor.innerHTML = `
        <div style="font-weight:bold; margin-bottom:10px; font-size:14px; color:#000;">Registro de Evaluaciones Académicas</div>
        <table id="tablaDatos">
            <thead>
                <tr>
                    <th class="text-left">Alumno</th>
                    <th>Parcial 1</th>
                    <th>Parcial 2</th>
                    <th>Promedio Final</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td contenteditable="true" class="text-left">Juan Pérez</td>
                    <td contenteditable="true" class="p1" oninput="calcularFila(this)">8</td>
                    <td contenteditable="true" class="p2" oninput="calcularFila(this)">7</td>
                    <td class="res" style="font-weight:bold;">7.5</td>
                </tr>
                <tr>
                    <td contenteditable="true" class="text-left">María Gómez</td>
                    <td contenteditable="true" class="p1" oninput="calcularFila(this)">10</td>
                    <td contenteditable="true" class="p2" oninput="calcularFila(this)">9</td>
                    <td class="res" style="font-weight:bold;">9.5</td>
                </tr>
                <tr>
                    <td contenteditable="true" class="text-left">Carlos López</td>
                    <td contenteditable="true" class="p1" oninput="calcularFila(this)">6</td>
                    <td contenteditable="true" class="p2" oninput="calcularFila(this)">5</td>
                    <td class="res" style="font-weight:bold; color:red;">5.5</td>
                </tr>
            </tbody>
        </table>
    `;
}

function calcularFila(celda) {
    const fila = celda.parentElement;
    const p1 = parseFloat(fila.querySelector('.p1').innerText.trim() || 0);
    const p2 = parseFloat(fila.querySelector('.p2').innerText.trim() || 0);
    const celdaRes = fila.querySelector('.res');
    const promedio = ((p1 + p2) / 2).toFixed(1);
    celdaRes.innerText = promedio;
    celdaRes.style.color = promedio >= 6 ? 'green' : 'red';
}

function generarGraficaLocal() {
    const tabla = document.getElementById('tablaDatos');
    if (!tabla) { alert("Presiona '+ Hoja' primero."); return; }
    const filas = tabla.querySelectorAll('tbody tr');
    let nombres = [], promedios = [];
    filas.forEach(fila => {
        const nombre = fila.cells[0].innerText.trim();
        const promedio = parseFloat(fila.querySelector('.res').innerText.trim());
        if (nombre && !isNaN(promedio)) { nombres.push(nombre); promedios.push(promedio); }
    });
    if (promedios.length === 0) return;
    document.getElementById('graficaWrap').style.display = 'block';
    const canvas = document.getElementById('miGrafica');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const padding = 25, espacio = 15;
    const anchoMax = canvas.width - (padding * 2);
    const altoMax = canvas.height - (padding * 2) - 10;
    const anchoBarra = (anchoMax - (espacio * (promedios.length - 1))) / promedios.length;
    promedios.forEach((val, i) => {
        const alturaBarra = (val / 10) * altoMax;
        const x = padding + i * (anchoBarra + espacio);
        const y = canvas.height - padding - alturaBarra;
        ctx.fillStyle = '#2b579a';
        ctx.fillRect(x, y, anchoBarra, alturaBarra);
        ctx.fillStyle = '#000';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(val, x + (anchoBarra / 2), y - 4);
    });
}

function exportarExcel() {
    const tabla = document.getElementById('tablaDatos');
    if (!tabla) return;
    let textoCopiar = "";
    tabla.querySelectorAll('tr').forEach(fila => {
        let datosFila = [];
        fila.querySelectorAll('th, td').forEach(celda => { datosFila.push(celda.innerText); });
        textoCopiar += datosFila.join("\t") + "\n";
    });
    navigator.clipboard.writeText(textoCopiar).then(() => { alert("¡Copiado! Pégalo en tu hoja de cálculo externa."); });
}

function exportarPDF() { window.print(); }

function saveAll() {
    localStorage.setItem('master_office_doc_data', document.getElementById('docView').innerHTML);
    const tabla = document.getElementById('tablaDatos');
    if (tabla) localStorage.setItem('master_office_sheet_data', tabla.innerHTML);
    document.getElementById('saveStatus').innerText = "¡GUARDADO SEGURO LOCALMENTE!";
    setTimeout(() => { document.getElementById('saveStatus').innerText = "LISTO - OFFLINE SIN CONEXIONES EXTERNAS"; }, 2500);
}

window.onload = function() {
    const rDoc = localStorage.getItem('master_office_doc_data');
    if (rDoc) document.getElementById('docView').innerHTML = rDoc;
    const rSheet = localStorage.getItem('master_office_sheet_data');
    if (rSheet) document.getElementById('contenedorTabla').innerHTML = `<div style="font-weight:bold;margin-bottom:10px;font-size:14px;color:#000;">Registro de Evaluaciones Académicas (Restaurado)</div><table id="tablaDatos">${rSheet}</table>`;
    }}


function cambiarColorRapido(c){document.execCommand('foreColor',false,c);}
function cambiarTamanoRapido(s){document.execCommand('fontSize',false,s);}


let rangoGuardado = null;

function guardarSeleccion() {
    const sel = window.getSelection();
    if (sel.rangeCount > 0) {
        rangoGuardado = sel.getRangeAt(0).cloneRange();
    }
}

function restaurarSeleccion() {
    if (rangoGuardado) {
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(rangoGuardado);
    }
}

function cambiarVista(vista) {
    const d = document.getElementById('docView'), s = document.getElementById('sheetView');
    const rd = document.getElementById('ribbonDoc'), rs = document.getElementById('ribbonSheet');
    const td = document.getElementById('tabDoc'), ts = document.getElementById('tabSheet');

    if (vista === 'doc') {
        d.style.display = 'block'; rd.style.display = 'block'; s.style.display = 'none'; rs.style.display = 'none';
        td.classList.add('active'); ts.classList.remove('active');
    } else {
        d.style.display = 'none'; rd.style.display = 'none'; s.style.display = 'block'; rs.style.display = 'block';
        td.classList.remove('active'); ts.classList.add('active');
    }
}

function aplicarEstilo(cmd) {
    restaurarSeleccion();
    document.execCommand(cmd, false, null);
    guardarSeleccion();
}

function aplicarColor(color) {
    restaurarSeleccion();
    document.execCommand('foreColor', false, color);
    guardarSeleccion();
}

function aplicarTamano(tam) {
    restaurarSeleccion();
    document.execCommand('fontSize', false, tam);
    guardarSeleccion();
}

// --- PARCHE 1: ESTE ES EL ARREGLO DEL FANTASMA ---
function crearNuevo() {
    if (confirm("¿Borrar todo y empezar un documento nuevo?")) {
        const nuevoHTML = "<p>Escribe aquí tu documento...</p>";
        document.getElementById('docView').innerHTML = nuevoHTML;
        rangoGuardado = null;
        // Borra el guardado real para que no regrese al cerrar y abrir
        localStorage.setItem('o_doc', nuevoHTML);
        notificarStatus("Nuevo documento creado");
    }
}

function crearNuevoSheet() {
    if (confirm("¿Borrar la hoja y empezar una nueva?")) {
        localStorage.removeItem('o_sheet');
        document.getElementById('contenedorTabla').innerHTML = `<p style="color:#666; font-size:13px; margin:0;">Presiona el botón <b>"+ Hoja"</b> arriba para desplegar una nueva tabla</p>`;
        document.getElementById('graficaWrap').style.display = 'none';
        notificarStatus("Hoja nueva creada");
    }
}

function cargarDatosGuardados() {
    const rSheet = localStorage.getItem('o_sheet');
    if (!rSheet) {
        alert("No hay datos de tablas guardados localmente. Crea una '+ Hoja' primero.");
        return;
    }
    cambiarVista('sheet');
    document.getElementById('contenedorTabla').innerHTML = `
        <div style="font-weight:bold;margin-bottom:10px;font-size:14px;color:#000;">Registro de Evaluaciones Académicas (Restaurado)</div>
        <table id="tablaDatos">${rSheet}</table>`;

    document.querySelectorAll('.p1,.p2').forEach(c => {
        c.setAttribute('oninput', 'calcularFila(this)');
    });
    generarGraficaLocal();
    notificarStatus("Datos recuperados con éxito");
}

function insertarNuevaHoja() {
    document.getElementById('graficaWrap').style.display = 'none';
    document.getElementById('contenedorTabla').innerHTML = `
        <div style="font-weight:bold; margin-bottom:10px; font-size:14px; color:#000;">Registro de Evaluaciones Académicas</div>
        <table id="tablaDatos">
            <thead>
                <tr>
                    <th style="text-align:left; border:1px solid #ccc; padding:6px; background:#f2f2f2;">Alumno</th>
                    <th style="border:1px solid #ccc; padding:6px; background:#f2f2f2;">Parcial 1</th>
                    <th style="border:1px solid #ccc; padding:6px; background:#f2f2f2;">Parcial 2</th>
                    <th style="border:1px solid #ccc; padding:6px; background:#f2f2f2;">Promedio Final</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td contenteditable="true" style="text-align:left; border:1px solid #ccc; padding:6px;">Juan Pérez</td>
                    <td contenteditable="true" class="p1" oninput="calcularFila(this)" style="border:1px solid #ccc;">8</td>
                    <td contenteditable="true" class="p2" oninput="calcularFila(this)" style="border:1px solid #ccc;">7</td>
                    <td class="res" style="font-weight:bold; border:1px solid #ccc;">7.5</td>
                </tr>
                <tr>
                    <td contenteditable="true" style="text-align:left; border:1px solid #ccc; padding:6px;">María Gómez</td>
                    <td contenteditable="true" class="p1" oninput="calcularFila(this)" style="border:1px solid #ccc;">10</td>
                    <td contenteditable="true" class="p2" oninput="calcularFila(this)" style="border:1px solid #ccc;">9</td>
                    <td class="res" style="font-weight:bold; border:1px solid #ccc;">9.5</td>
                </tr>
                <tr>
                    <td contenteditable="true" style="text-align:left; border:1px solid #ccc; padding:6px;">Carlos López</td>
                    <td contenteditable="true" class="p1" oninput="calcularFila(this)" style="border:1px solid #ccc;">6</td>
                    <td contenteditable="true" class="p2" oninput="calcularFila(this)" style="border:1px solid #ccc;">5</td>
                    <td class="res" style="font-weight:bold; color:red; border:1px solid #ccc;">5.5</td>
                </tr>
            </tbody>
        </table>`;
}

function calcularFila(celda) {
    const f = celda.parentElement;
    const p1 = parseFloat(f.querySelector('.p1').innerText.trim() || 0);
    const p2 = parseFloat(f.querySelector('.p2').innerText.trim() || 0);
    const r = f.querySelector('.res'), p = ((p1 + p2) / 2).toFixed(1);
    r.innerText = p; r.style.color = p >= 6? 'green' : 'red';
}

function generarGraficaLocal() {
    const t = document.getElementById('tablaDatos'); if (!t) return;
    let n = [], p = []; t.querySelectorAll('tbody tr').forEach(f => {
        const nom = f.cells[0].innerText.trim(), prom = parseFloat(f.querySelector('.res').innerText.trim());
        if (nom &&!isNaN(prom)) { n.push(nom); p.push(prom); }
    });
    if (p.length === 0) return; document.getElementById('graficaWrap').style.display = 'block';
    const can = document.getElementById('miGrafica'), ctx = can.getContext('2d'); ctx.clearRect(0, 0, can.width, can.height);
    const pad = 25, espacio = 15, am = can.width - (pad * 2), al = can.height - (pad * 2) - 10, ab = (am - (espacio * (p.length - 1))) / p.length;
    p.forEach((val, i) => {
        const h = (val / 10) * al, x = pad + i * (ab + espacio), y = can.height - pad - h;
        ctx.fillStyle = '#2b579a'; ctx.fillRect(x, y, ab, h);
        ctx.fillStyle = '#000'; ctx.font = 'bold 9px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(val, x + (ab / 2), y - 4);
        ctx.font = '8px sans-serif'; ctx.fillText(n[i].split(' ')[0], x + (ab / 2), can.height - pad + 12);
    });
}

// --- PARCHE 2: SEPARAR COPIAR DE DOCUMENTO Y DE HOJA ---
function copiarDocumento() {
    const texto = document.getElementById('docView').innerText;
    navigator.clipboard.writeText(texto).then(() => {
        notificarStatus("¡Documento copiado!");
    });
}

function exportarExcel() {
    const t = document.getElementById('tablaDatos'); if (!t) {
        alert("No hay tabla para copiar. Crea una '+ Hoja' primero.");
        return;
    }
    let txt = "";
    t.querySelectorAll('tr').forEach(f => { let d = []; f.querySelectorAll('th,td').forEach(c => { d.push(c.innerText); }); txt += d.join("\t") + "\n"; });
    navigator.clipboard.writeText(txt).then(() => { notificarStatus("¡Tabla copiada! Pégala en Excel."); });
}

function exportarPDF() {
    notificarStatus("Generando PDF...");
    window.print();
}

function saveAll() {
    localStorage.setItem('o_doc', document.getElementById('docView').innerHTML);
    const t = document.getElementById('tablaDatos'); if (t) localStorage.setItem('o_sheet', t.innerHTML);
    notificarStatus("¡TODO GUARDADO SECO EN LOCAL!");
}

function notificarStatus(msg) {
    const el = document.getElementById('saveStatus');
    if(el) el.innerText = msg;
    setTimeout(() => { if(el) el.innerText = "LISTO - OFFLINE SIN CONEXIONES EXTERNAS"; }, 2500);
}

// --- PARCHE 3: CARGA INICIAL CORRECTA ---
window.onload = function() {
    const rd = localStorage.getItem('o_doc');
    if (rd) document.getElementById('docView').innerHTML = rd;
    // Asegura que al abrir siempre inicie en Documento y con los botones correctos
    cambiarVista('doc');
}

let rangoGuardado = null;

function guardarSeleccion() {
    const sel = window.getSelection();
    if (sel.rangeCount > 0) {
        rangoGuardado = sel.getRangeAt(0).cloneRange();
    }
}

function restaurarSeleccion() {
    const sel = window.getSelection();
    if (rangoGuardado) {
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
}

function aplicarColor(color) {
    restaurarSeleccion();
    document.execCommand('foreColor', false, color);
}

function aplicarTamano(tam) {
    restaurarSeleccion();
    document.execCommand('fontSize', false, tam);
}

function insertarNuevaHoja() {
    document.getElementById('graficaWrap').style.display = 'none';
    document.getElementById('contenedorTabla').innerHTML = `
        <div style="font-weight:bold; margin-bottom:10px; font-size:14px; color:#000;">Registro de Evaluaciones Académicas</div>
        <table id="tablaDatos">
            <thead>
                <tr>
                    <th style="text-align:left;">Alumno</th>
                    <th>Parcial 1</th>
                    <th>Parcial 2</th>
                    <th>Promedio Final</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td contenteditable="true" style="text-align:left;">Juan Pérez</td>
                    <td contenteditable="true" class="p1" oninput="calcularFila(this)">8</td>
                    <td contenteditable="true" class="p2" oninput="calcularFila(this)">7</td>
                    <td class="res" style="font-weight:bold;">7.5</td>
                </tr>
                <tr>
                    <td contenteditable="true" style="text-align:left;">María Gómez</td>
                    <td contenteditable="true" class="p1" oninput="calcularFila(this)">10</td>
                    <td contenteditable="true" class="p2" oninput="calcularFila(this)">9</td>
                    <td class="res" style="font-weight:bold;">9.5</td>
                </tr>
                <tr>
                    <td contenteditable="true" style="text-align:left;">Carlos López</td>
                    <td contenteditable="true" class="p1" oninput="calcularFila(this)">6</td>
                    <td contenteditable="true" class="p2" oninput="calcularFila(this)">5</td>
                    <td class="res" style="font-weight:bold; color:red;">5.5</td>
                </tr>
            </tbody>
        </table>`;
}

function calcularFila(celda) {
    const f = celda.parentElement;
    const p1 = parseFloat(f.querySelector('.p1').innerText.trim() || 0);
    const p2 = parseFloat(f.querySelector('.p2').innerText.trim() || 0);
    const r = f.querySelector('.res'), p = ((p1 + p2) / 2).toFixed(1);
    r.innerText = p; r.style.color = p >= 6 ? 'green' : 'red';
}

function generarGraficaLocal() {
    const t = document.getElementById('tablaDatos'); if (!t) return;
    let n = [], p = []; t.querySelectorAll('tbody tr').forEach(f => {
        const nom = f.cells[0].innerText.trim(), prom = parseFloat(f.querySelector('.res').innerText.trim());
        if (nom && !isNaN(prom)) { n.push(nom); p.push(prom); }
    });
    if (p.length === 0) return; document.getElementById('graficaWrap').style.display = 'block';
    const can = document.getElementById('miGrafica'), ctx = can.getContext('2d'); ctx.clearRect(0, 0, can.width, can.height);
    const pad = 25, esp = 15, am = can.width - (pad * 2), al = can.height - (pad * 2) - 10, ab = (am - (esp * (p.length - 1))) / p.length;
    p.forEach((val, i) => {
        const h = (val / 10) * al, x = pad + i * (ab + esp), y = can.height - pad - h;
        ctx.fillStyle = '#2b579a'; ctx.fillRect(x, y, ab, h);
        ctx.fillStyle = '#000'; ctx.font = 'bold 9px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(val, x + (ab / 2), y - 4);
        ctx.font = '8px sans-serif'; ctx.fillText(n[i], x + (ab / 2), can.height - pad + 12);
    });
}

function exportarExcel() {
    const t = document.getElementById('tablaDatos'); if (!t) return; let txt = "";
    t.querySelectorAll('tr').forEach(f => { let d = []; f.querySelectorAll('th,td').forEach(c => { d.push(c.innerText); }); txt += d.join("\t") + "\n"; });
    navigator.clipboard.writeText(txt).then(() => { alert("¡Tabla copiada! Pégala en Excel."); });
}

function exportarPDF() { window.print(); }

function saveAll() {
    localStorage.setItem('o_doc', document.getElementById('docView').innerHTML);
    const t = document.getElementById('tablaDatos'); if (t) localStorage.setItem('o_sheet', t.innerHTML);
    document.getElementById('saveStatus').innerText = "¡TODO GUARDADO SECO EN LOCAL!";
    setTimeout(() => { document.getElementById('saveStatus').innerText = "LISTO - OFFLINE SIN CONEXIONES EXTERNAS"; }, 2500);
}

window.onload = function() {
    const rd = localStorage.getItem('o_doc'); if (rd) document.getElementById('docView').innerHTML = rd;
    const rs = localStorage.getItem('o_sheet');
    if (rs) {
        document.getElementById('contenedorTabla').innerHTML = `<div style="font-weight:bold;margin-bottom:10px;font-size:14px;color:#000;">Registro de Evaluaciones Académicas (Restaurado)</div><table id="tablaDatos">${rs}</table>`;
    }
}

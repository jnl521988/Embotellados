/**********************
 * NAVEGACIÓN
 **********************/
function mostrar(id){
  document.querySelectorAll('.pagina').forEach(p=>p.style.display='none');
  document.getElementById(id).style.display='block';
}
mostrar('inicio');


/**********************
 * AÑADIR FILAS
 **********************/
function addFila(tablaId){
  const tbody = document.getElementById(tablaId).querySelector('tbody');
  const tr = document.createElement('tr');

  /* EMBOTELLADO */
  if(tablaId === 'tablaEmbotellado'){
    tr.innerHTML = `
<td><input type="date"></td>
<td>
  <select>
    <option>24 Mozas</option><option>Madremia</option><option>Abracadabra</option>
    <option>Platón</option><option>Loquillo Tinto</option>
    <option>Encomienda de la Vega</option>
    <option>MG 24 Mozas</option><option>MG Madremia</option>
    <option>MG Abracadabra</option><option>Vocablos</option>
    <option>Loquillo Rosado</option><option>El Principito</option>
    <option>Varios</option>
  </select>
</td>
<td><input type="number"></td>
<td><input></td>
<td><input class="emb" type="number"></td>
<td><input class="sin" type="number"></td>
<td><input class="etiq" disabled></td>
<td><input></td>
<td><input></td>
<td><input class="ini" type="number"></td>
<td><input class="fin" type="number"></td>
<td><input class="totaldo" disabled></td>
<td><input class="roturas" disabled></td>
<td><input class="palets" type="number"></td>
<td><input class="cajas" disabled></td>
<td><input></td>
<td><input type="number"></td>
<td><button onclick="eliminarFila(this)">🗑️</button></td>`;
    tr.addEventListener('change',()=>calcEmbotellado(tr));
  }

  /* INVENTARIO */
  else if(tablaId === 'tablaInventario'){
    tr.innerHTML = `
<td><input></td>
<td><input type="number"></td>
<td><input class="etiq" type="number"></td>
<td><input class="sin" type="number"></td>
<td><input class="total" disabled></td>
<td><input></td>
<td><button onclick="eliminarFila(this)">🗑️</button></td>`;
    tr.addEventListener('change',()=>calcInventario(tr));
  }

  /* TIRILLAS DO */
  else if(tablaId === 'tablaTirillasDO'){
    tr.innerHTML = `
<td><input type="date"></td>
<td><input></td>
<td><input type="number"></td>
<td><input></td>
<td><input></td>
<td><input class="desde" type="number"></td>
<td><input class="hasta" type="number"></td>
<td><input class="totaldo" disabled></td>
<td><input class="gasto" type="number"></td>
<td><input class="roturas" type="number"></td>
<td><input class="existencias" disabled></td>
<td><button onclick="eliminarFila(this)">🗑️</button></td>`;
    tr.addEventListener('change',()=>calcTirillasDO(tr));
  }

  /* STOCK (botellas, corchos, etiquetas, cápsulas, cajas) */
  else{
    const cols = document.getElementById(tablaId).rows[0].cells.length - 1;
    for(let i=0;i<cols;i++) tr.innerHTML += `<td><input></td>`;
    tr.innerHTML += `<td><button onclick="eliminarFila(this)">🗑️</button></td>`;
    tr.querySelectorAll('input').forEach(i=>{
      i.addEventListener('change',()=>acumularStock(i));
    });
  }

  tbody.appendChild(tr);
}


/**********************
 * ELIMINAR FILA
 **********************/
function eliminarFila(btn){
  btn.closest('tr').remove();
}


/**********************
 * GUARDAR / CARGAR
 **********************/
function guardar(){
  const datos = {};
  document.querySelectorAll('table').forEach(tabla=>{
    datos[tabla.id] = [];
    tabla.querySelectorAll('tbody tr').forEach(tr=>{
      const fila = [];
      tr.querySelectorAll('td').forEach(td=>{
        const campo = td.querySelector('input, select');
        fila.push(campo ? campo.value : td.textContent);
      });
      datos[tabla.id].push(fila);
    });
  });
  localStorage.setItem('bodega', JSON.stringify(datos));
  alert('Datos guardados');
}

window.onload = ()=>{
  const datos = JSON.parse(localStorage.getItem('bodega'));
  if(!datos) return;

  document.querySelectorAll('table').forEach(tabla=>{
    const guardado = datos[tabla.id];
    if(!guardado) return;

    const filas = tabla.querySelectorAll('tbody tr');
    guardado.forEach((fila,i)=>{
      if(!filas[i]) return;
      fila.forEach((valor,j)=>{
        const campo = filas[i].cells[j]?.querySelector('input, select');
        if(campo) campo.value = valor;
      });
    });
  });
};


/**********************
 * EXPORTAR TABLA VISIBLE
 **********************/
function exportarExcel(){
  const tablaVisible = document.querySelector('.pagina[style*="display: block"] table');
  if(!tablaVisible){
    alert('No hay tabla visible para exportar');
    return;
  }

  // Construir datos reales de la tabla
  const datos = [];
  tablaVisible.querySelectorAll('tr').forEach(tr => {
    const fila = [];
    tr.querySelectorAll('td, th').forEach((td, i, arr) => {
      if(i === arr.length - 1) return; // Ignorar última columna (Eliminar)
      const input = td.querySelector('input');
      const select = td.querySelector('select');
      if(input) fila.push(input.value);
      else if(select) fila.push(select.value);
      else fila.push(td.textContent.trim());
    });
    datos.push(fila);
  });

  const ws = XLSX.utils.aoa_to_sheet(datos);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, tablaVisible.id);
  XLSX.writeFile(wb, tablaVisible.id + '.xlsx');
}

function exportarPDF(){
  const tablaVisible = document.querySelector('.pagina[style*="display: block"] table');
  if(!tablaVisible){
    alert('No hay tabla visible para exportar');
    return;
  }

  // Construir datos reales de la tabla
  const body = [];
  tablaVisible.querySelectorAll('tbody tr').forEach(tr => {
    const fila = [];
    tr.querySelectorAll('td').forEach((td, i, arr) => {
      if(i === arr.length - 1) return; // Ignorar última columna (Eliminar)
      const input = td.querySelector('input');
      const select = td.querySelector('select');
      if(input) fila.push(input.value);
      else if(select) fila.push(select.value);
      else fila.push(td.textContent.trim());
    });
    body.push(fila);
  });

  const headers = [];
  tablaVisible.querySelectorAll('thead th').forEach((th, i, arr) => {
    if(i === arr.length - 1) return; // Ignorar columna Eliminar
    headers.push(th.textContent.trim());
  });

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF('l','pt');
  pdf.text(tablaVisible.id, 40, 30);
  pdf.autoTable({ head: [headers], body: body, startY: 50 });
  pdf.save(tablaVisible.id + '.pdf');
}


/**********************
 * CÁLCULOS
 **********************/
function calcEmbotellado(f){
  const emb = +f.querySelector('.emb').value||0;
  const sin = +f.querySelector('.sin').value||0;
  f.querySelector('.etiq').value = emb - sin;

  const ini = +f.querySelector('.ini').value||0;
  const fin = +f.querySelector('.fin').value||0;
  f.querySelector('.totaldo').value = fin - ini;
  f.querySelector('.roturas').value = (fin - ini) - (emb - sin);

  const pal = +f.querySelector('.palets').value||0;
  f.querySelector('.cajas').value = Math.max(0, ((emb-sin-pal)/6).toFixed(2));
}

function calcInventario(f){
  const e = +f.querySelector('.etiq').value||0;
  const s = +f.querySelector('.sin').value||0;
  f.querySelector('.total').value = e + s;
}

function calcTirillasDO(f){
  const d = +f.querySelector('.desde').value||0;
  const h = +f.querySelector('.hasta').value||0;
  const total = h - d;
  f.querySelector('.totaldo').value = total;

  const gasto = +f.querySelector('.gasto').value||0;
  f.querySelector('.existencias').value = total - gasto;
}

function acumularStock(input){
  const tr = input.closest('tr');
  const entrada = tr.cells[tr.cells.length-6].querySelector('input');
  const total   = tr.cells[tr.cells.length-5].querySelector('input');
  const consumo = tr.cells[tr.cells.length-4].querySelector('input');
  const gasto   = tr.cells[tr.cells.length-3].querySelector('input');
  const stock   = tr.cells[tr.cells.length-2].querySelector('input');

  total.dataset.acum = total.dataset.acum || 0;
  gasto.dataset.acum = gasto.dataset.acum || 0;

  total.dataset.acum = +total.dataset.acum + (+entrada.value||0);
  gasto.dataset.acum = +gasto.dataset.acum + (+consumo.value||0);

  total.value = total.dataset.acum;
  gasto.value = gasto.dataset.acum;
  stock.value = total.dataset.acum - gasto.dataset.acum;

  entrada.value='';
  consumo.value='';
}

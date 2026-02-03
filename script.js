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
    <option>MG Abracadabra</option><option>Divina Proporción</option>
    <option>Loquillo Rosado</option><option>El Principito</option>
    <option>Vocablos</option>Varios<option>
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


  /* TIRILLAS DO */
  else if(tablaId === 'tablaTirillasDO'){
    tr.innerHTML = `
<td><input type="date"></td>
<td><select>
    <option>24 Mozas</option>
    <option>Madremia</option>
    <option>Abracadabra</option>
    <option>Platón</option>
    <option>Loquillo Tinto</option>
    <option>Encomienda de la Vega</option>
    <option>Loquillo Rosado</option>
    <option>El Principito</option>
    <option>Divina Proporción</option>
  </select></td>
<td><input type="number"></td>
<td><input></td>
<td><input></td>
<td><input class="desde" type="number"></td>
<td><input class="hasta" type="number"></td>
<td><input class="totaldo" disabled></td>
<td><input class="consumo" type="number" data-total="0"></td>
<td><input class="consumo-rotas" type="number" data-total="0"></td>
<td><input class="gasto" disabled></td>
<td><input class="roturas" disabled></td>
<td><input class="existencias" disabled></td>
<td><button onclick="eliminarFila(this)">🗑️</button></td>`;

    tbody.appendChild(tr);
    setupFilaTirillas(tr); // Inicializar eventos
  }

  /* STOCK (botellas, corchos, etiquetas, cápsulas, cajas) */
  else{
    const cols = document.getElementById(tablaId).rows[0].cells.length - 1;
    for(let i=0;i<cols;i++) tr.innerHTML += `<td><input></td>`;
    tr.innerHTML += `<td><button onclick="eliminarFila(this)">🗑️</button></td>`;
    tr.querySelectorAll('input').forEach(i=>{
      i.addEventListener('change',()=>acumularStock(i));
    });
    tbody.appendChild(tr);
  }
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

  // Inicializar Tirillas DO al cargar
  document.querySelectorAll('#tablaTirillasDO tbody tr').forEach(fila => setupFilaTirillas(fila));
};


/**********************
 * EXPORTAR
 **********************/
function exportarExcel(){
  const tablaVisible = document.querySelector('.pagina[style*="display: block"] table');
  if(!tablaVisible){ alert('No hay tabla visible para exportar'); return; }

  const datos = [];
  tablaVisible.querySelectorAll('tr').forEach(tr=>{
    const fila = [];
    tr.querySelectorAll('td, th').forEach((td, i, arr)=>{
      if(i===arr.length-1) return;
      const input = td.querySelector('input');
      const select = td.querySelector('select');
      fila.push(input ? input.value : (select ? select.value : td.textContent.trim()));
    });
    datos.push(fila);
  });

  const ws = XLSX.utils.aoa_to_sheet(datos);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, tablaVisible.id);
  XLSX.writeFile(wb, tablaVisible.id+'.xlsx');
}

function exportarPDF(){
  const tablaVisible = document.querySelector('.pagina[style*="display: block"] table');
  if(!tablaVisible){ alert('No hay tabla visible para exportar'); return; }

  const body = [];
  tablaVisible.querySelectorAll('tbody tr').forEach(tr=>{
    const fila=[];
    tr.querySelectorAll('td').forEach((td,i,arr)=>{
      if(i===arr.length-1) return;
      const input = td.querySelector('input');
      const select = td.querySelector('select');
      fila.push(input ? input.value : (select ? select.value : td.textContent.trim()));
    });
    body.push(fila);
  });

  const headers=[];
  tablaVisible.querySelectorAll('thead th').forEach((th,i,arr)=>{
    if(i===arr.length-1) return;
    headers.push(th.textContent.trim());
  });

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF('l','pt');
  pdf.text(tablaVisible.id,40,30);
  pdf.autoTable({ head:[headers], body:body, startY:50 });
  pdf.save(tablaVisible.id+'.pdf');
};


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
  // Inicializar acumuladores si no existen
  if (!f.dataset.etiq) f.dataset.etiq = 0;
  if (!f.dataset.sin)  f.dataset.sin  = 0;

  // Entradas (según columnas)
  const entradaEtiq = f.cells[2].querySelector('input'); // Entrada Etiquetado
  const entradaSin  = f.cells[4].querySelector('input'); // Entrada Sin Etiquetar

  // Acumular Etiquetado
  if (entradaEtiq && entradaEtiq.value !== '') {
    f.dataset.etiq = Number(f.dataset.etiq) + (Number(entradaEtiq.value) || 0);
    entradaEtiq.value = '';
  }

  // Acumular Sin Etiquetar
  if (entradaSin && entradaSin.value !== '') {
    f.dataset.sin = Number(f.dataset.sin) + (Number(entradaSin.value) || 0);
    entradaSin.value = '';
  }

  // Actualizar columnas
  const acumuladoEtiq = Number(f.dataset.etiq) || 0;
  const acumuladoSin  = Number(f.dataset.sin)  || 0;

  f.querySelector('.etiq').value = acumuladoEtiq;
  f.querySelector('.sin').value  = acumuladoSin;
  f.querySelector('.total').value = acumuladoEtiq + acumuladoSin;
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


/**********************
 * TIRILLAS DO FUNCIONAL (COMPATIBLE MÓVIL)
 **********************/
function setupFilaTirillas(fila){
  fila.dataset.acumConsumo = fila.dataset.acumConsumo || 0;
  fila.dataset.acumRotas = fila.dataset.acumRotas || 0;

  // SUMA CONSISTENTE EN PC + MÓVIL
  fila.querySelector('.consumo').addEventListener('change', e=>{
      const valor = parseInt(e.target.value)||0;
      fila.dataset.acumConsumo = parseInt(fila.dataset.acumConsumo) + valor;
      e.target.value = ''; // siempre limpiar
      calcTirillasDO(fila);
  });

  fila.querySelector('.consumo-rotas').addEventListener('change', e=>{
      const valor = parseInt(e.target.value)||0;
      fila.dataset.acumRotas = parseInt(fila.dataset.acumRotas) + valor;
      e.target.value = '';
      calcTirillasDO(fila);
  });

  // Cálculo de total DO
  fila.querySelectorAll('.desde, .hasta').forEach(input=>{
    input.addEventListener('input', ()=>calcTirillasDO(fila));
  });
}


function calcTirillasDO(fila){
  const desde = parseInt(fila.querySelector('.desde').value) || 0;
  const hasta = parseInt(fila.querySelector('.hasta').value) || 0;
  const total = hasta >= desde ? (hasta - desde) : 0;

  const consumo = parseInt(fila.dataset.acumConsumo) || 0;
  const rotas = parseInt(fila.dataset.acumRotas) || 0;
  const gasto = consumo + rotas;
  const existencias = total - gasto;

  fila.querySelector('.totaldo').value = total;
  fila.querySelector('.gasto').value = gasto;
  fila.querySelector('.roturas').value = rotas;
  fila.querySelector('.existencias').value = existencias >= 0 ? existencias : 0;
}

/**********************
 * PRODUCTOS
 **********************/
let productos = [];

// Añadir producto
function añadirProducto() {
  const nombre = document.getElementById('prod-nombre').value.trim();
  const tipo = document.getElementById('prod-tipo').value.trim();
  const descripcion = document.getElementById('prod-desc').value.trim();
  const añada = document.getElementById('prod-añada').value.trim();

  if(!nombre) {
    alert('El nombre del producto es obligatorio');
    return;
  }

  const producto = {
    id: Date.now(), // ID único
    nombre,
    tipo,
    descripcion,
    añada
  };

  productos.push(producto);
  guardarProductos();
  renderizarProductos();
  limpiarFormulario();
  actualizarSelectProductos(); // actualizar selects al añadir
}

// Limpiar formulario
function limpiarFormulario() {
  document.getElementById('prod-nombre').value = '';
  document.getElementById('prod-tipo').value = '';
  document.getElementById('prod-desc').value = '';
  document.getElementById('prod-añada').value = '';
}

// Renderizar tabla de productos
function renderizarProductos() {
  const tbody = document.querySelector('#tablaProductos tbody');
  tbody.innerHTML = '';

  productos.forEach(prod => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${prod.nombre}</td>
      <td>${prod.tipo}</td>
      <td>${prod.descripcion}</td>
      <td>${prod.añada}</td>
      <td class="stock-prod">0</td>   <!-- 🆕 Celda de stock -->
      <td>
        <button onclick="editarProducto(${prod.id})">✏️ Editar</button>
        <button onclick="eliminarProducto(${prod.id})">🗑️ Eliminar</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Eliminar producto
function eliminarProducto(id) {
  if(!confirm('¿Seguro que quieres eliminar este producto?')) return;
  productos = productos.filter(p => p.id !== id);
  guardarProductos();
  renderizarProductos();
  actualizarSelectProductos(); // actualizar selects al eliminar
}

// Editar producto
function editarProducto(id) {
  const prod = productos.find(p => p.id === id);
  if(!prod) return;

  const nuevoNombre = prompt('Nombre:', prod.nombre);
  if(nuevoNombre !== null) prod.nombre = nuevoNombre.trim();

  const nuevoTipo = prompt('Tipo:', prod.tipo);
  if(nuevoTipo !== null) prod.tipo = nuevoTipo.trim();

  const nuevaDesc = prompt('Descripción:', prod.descripcion);
  if(nuevaDesc !== null) prod.descripcion = nuevaDesc.trim();

  const nuevaAñada = prompt('Añada:', prod.añada);
  if(nuevaAñada !== null) prod.añada = nuevaAñada.trim();

  guardarProductos();
  renderizarProductos();
  actualizarSelectProductos(); // actualizar selects al editar
}

// Guardar productos en localStorage
function guardarProductos() {
  localStorage.setItem('productos', JSON.stringify(productos));
}

// Cargar productos de localStorage al iniciar
document.addEventListener('DOMContentLoaded', () => {
  const guardados = JSON.parse(localStorage.getItem('productos'));
  if(guardados) productos = guardados;
  renderizarProductos();
  actualizarSelectProductos();
});
/********************************************
 * 📦 STOCK GLOBAL POR PRODUCTO
 ********************************************/
function obtenerStockProducto(nombreProd){
  let total = 0;

  const tablas = [
    { id: "tablaEtiquetas", colStock: 6 },
    { id: "tablaCapsulas",  colStock: 5 },
    { id: "tablaCajas",     colStock: 5 }
  ];

  tablas.forEach(obj => {
    const tabla = document.getElementById(obj.id);
    if(!tabla) return;

    tabla.querySelectorAll("tbody tr").forEach(fila => {
      const select = fila.querySelector("td.producto select");
      const stockInput = fila.children[obj.colStock].querySelector("input");

      if(select && stockInput && select.value === nombreProd){
        total += parseInt(stockInput.value) || 0;
      }
    });
  });

  return total;
}

/********************************************
 * 🔄 ACTUALIZA STOCK EN TABLA PRODUCTOS
 ********************************************/
function actualizarStocksEnProductos(){
  const tabla = document.getElementById("tablaProductos");
  if(!tabla) return;

  tabla.querySelectorAll("tbody tr").forEach(fila => {
    const nombre = fila.children[0].textContent.trim(); // columna NOMBRE
    const celdaStock = fila.querySelector(".stock-prod");
    if(celdaStock) celdaStock.textContent = obtenerStockProducto(nombre);
  });
}

/********************************************
 * 🧲 ESCUCHADORES QUE REFRESCAN STOCK
 ********************************************/
["tablaEtiquetas","tablaCapsulas","tablaCajas"].forEach(id=>{
  const tabla = document.getElementById(id);
  if(tabla){
    tabla.addEventListener("input", actualizarStocksEnProductos);
    tabla.addEventListener("change", actualizarStocksEnProductos);
  }
});

// 🚀 Al cargar la página
document.addEventListener("DOMContentLoaded", actualizarStocksEnProductos);

/**********************
 * PRODUCTOS EN SELECT
 **********************/
function actualizarSelectProductos() {
  const listaProductos = productos.map(p => p.nombre);

  ['tablaEtiquetas', 'tablaCapsulas', 'tablaCajas'].forEach(tablaId => {
    const tabla = document.getElementById(tablaId);
    if (!tabla) return;

    tabla.querySelectorAll('tbody tr').forEach(tr => {
      const celda = tr.querySelector('td.producto');
      if (!celda) return;

      const valorActual = celda.querySelector('select')?.value || '';

      const select = document.createElement('select');
      select.innerHTML = `<option value="">--Seleccione--</option>` +
                         listaProductos.map(p => `<option value="${p}">${p}</option>`).join('');

      if (valorActual) select.value = valorActual;

      celda.innerHTML = '';
      celda.appendChild(select);
    });
  });
}


/********************************
 * AÑADIR FILA EN TABLAS STOCK
 ********************************/
function addFila(tablaId) {
  const tabla = document.getElementById(tablaId);
  const tbody = tabla.querySelector('tbody');
  const filaBase = tbody.querySelector('tr'); // primera fila como plantilla
  const nuevaFila = filaBase.cloneNode(true);

  // Limpiar inputs
  nuevaFila.querySelectorAll('input').forEach(i => {
    if (!i.disabled) i.value = "";
    if (i.disabled) i.value = 0;
  });

  // Limpiar select
  const selectExistente = nuevaFila.querySelector('select');
  if (selectExistente) selectExistente.value = "";

  // Agregar fila
  tbody.appendChild(nuevaFila);

  // 🔥 Volver a poner los selects con productos
  actualizarSelectProductos();
}
/********************************************
 * SELECTS FIJOS PARA BOTELLAS Y CORCHOS
 ********************************************/

// Opciones predefinidas
const opcionesBotellas = {
  marca: ["SAVERGLASS", "VIDRIALA", "VERALLIA", "ESLA"],
  modelo: ["PREMIERE", "DOGMA ASIA", "VINO SANTO", "ANCIENNE 2", "BD CLARA", "BD RESERVA", "BD MG PLUS", "CÓNICA PESANTE"],
  capacidad: ["0.75", "1.5", "0.5"]
};

const opcionesCorchos = {
  marca: ["BOURRASSE", "AMORIN CORK", "EBROCORK", "INDECORK", "J. VIGAS", "PARRAMON"],
  modelo: ["24 MOZAS", "MADREMIA", "ABRACADABRA", "PLATÓN", "EL PRINCIPITO", "TORO"]
};


// 🔥 Genera selects para una fila dada
function generarSelectsBotellas(fila){
  fila.children[0].innerHTML = crearSelect(opcionesBotellas.marca);
  fila.children[1].innerHTML = crearSelect(opcionesBotellas.modelo);
  fila.children[2].innerHTML = crearSelect(opcionesBotellas.capacidad);
}

function generarSelectsCorchos(fila){
  fila.children[0].innerHTML = crearSelect(opcionesCorchos.marca);
  fila.children[1].innerHTML = crearSelect(opcionesCorchos.modelo);
}


// 🔧 Función para crear un select desde un array
function crearSelect(lista){
  return `<select><option value="">--Seleccione--</option>${lista.map(v=>`<option>${v}</option>`).join("")}</select>`;
}


// 🚀 Activar selects al cargar
document.addEventListener("DOMContentLoaded", ()=>{
  document.querySelectorAll("#tablaBotellas tbody tr").forEach(generarSelectsBotellas);
  document.querySelectorAll("#tablaCorchos tbody tr").forEach(generarSelectsCorchos);
});


// ➕ Que las nuevas filas también tengan select
const oldAddFila = addFila; 
addFila = function(tablaId){
  oldAddFila(tablaId);

  const tabla = document.getElementById(tablaId);
  const nuevaFila = tabla.querySelector("tbody").lastElementChild;

  if(tablaId === "tablaBotellas") generarSelectsBotellas(nuevaFila);
  if(tablaId === "tablaCorchos") generarSelectsCorchos(nuevaFila);
};


 /* ===========================
   INVENTARIO + HISTÓRICO COMPLETO
   =========================== */

function inicializarInventario(){
  const filas = document.querySelectorAll('#tablaInventario tbody tr');
  filas.forEach(fila => configurarFilaInventario(fila));
}

// 🔹 Añadir fila nueva
function addFilaInventario(){
  const tbody = document.querySelector('#tablaInventario tbody');
  const tr = document.createElement('tr');

  tr.innerHTML = `
<td><input placeholder="Marca"></td>
<td><input type="number" value="0"></td>
<td><input class="entrada-etiq" type="number" value="0"></td>
<td><input class="etiq" type="number" value="0" disabled></td>
<td><input class="entrada-sin" type="number" value="0"></td>
<td><input class="sin" type="number" value="0" disabled></td>
<td><input class="total" disabled value="0"></td>
<td><input></td>
<td><button class="btn-eliminar">🗑️</button></td>
`;

  tbody.appendChild(tr);
  configurarFilaInventario(tr);
}

// 🔹 Configura fila (nueva o existente)
function configurarFilaInventario(fila){
  // Acumuladores propios
  fila.dataset.etiq = Number(fila.dataset.etiq) || 0;
  fila.dataset.sin  = Number(fila.dataset.sin) || 0;

  const entradaEtiq = fila.querySelector('.entrada-etiq');
  const entradaSin  = fila.querySelector('.entrada-sin');
  const btnEliminar = fila.querySelector('.btn-eliminar');

  // Registrar entradas etiquetadas
  entradaEtiq.addEventListener('change', e => {
    const valor = Number(e.target.value) || 0;
    if(valor <= 0) return;
    fila.dataset.etiq = Number(fila.dataset.etiq) + valor;
    e.target.value = '';
    actualizarFilaInventario(fila);
    registrarHistorico(fila, 'etiq', valor);
  });

  // Registrar entradas sin etiquetar
  entradaSin.addEventListener('change', e => {
    const valor = Number(e.target.value) || 0;
    if(valor <= 0) return;
    fila.dataset.sin = Number(fila.dataset.sin) + valor;
    e.target.value = '';
    actualizarFilaInventario(fila);
    registrarHistorico(fila, 'sin', valor);
  });

  // Actualizar título histórico al cambiar marca o año
  fila.cells[0].querySelector('input').addEventListener('input', ()=>actualizarTituloHistorico(fila));
  fila.cells[1].querySelector('input').addEventListener('input', ()=>actualizarTituloHistorico(fila));

  // Eliminar fila + histórico
  if(btnEliminar){
    btnEliminar.addEventListener('click', () => {
      eliminarHistorico(fila);
      fila.remove();
    });
  }
}

// 🔹 Actualiza totales de la fila
function actualizarFilaInventario(fila){
  fila.querySelector('.etiq').value = Number(fila.dataset.etiq) || 0;
  fila.querySelector('.sin').value  = Number(fila.dataset.sin) || 0;
  fila.querySelector('.total').value = (Number(fila.dataset.etiq) + Number(fila.dataset.sin)) || 0;
}

// 🔹 Registrar entradas en histórico
function registrarHistorico(fila, tipo, cantidad){
  if(!cantidad || cantidad <= 0) return;
  const cont = document.getElementById('historicoInventario');
  if(!cont) return;

  // Usamos un ID único por fila basado en timestamp + random si no tiene aún
  if(!fila.dataset.histId) fila.dataset.histId = 'fila_' + Date.now() + '_' + Math.floor(Math.random()*1000);

  let bloque = cont.querySelector(`[data-id="${fila.dataset.histId}"]`);

  const marca = fila.cells[0].querySelector('input').value || "Sin marca";
  const anada = fila.cells[1].querySelector('input').value || "—";

  if(!bloque){
    bloque = document.createElement('div');
    bloque.className = 'hist-item';
    bloque.dataset.id = fila.dataset.histId;
    bloque.innerHTML = `
      <div class="hist-titulo">🍷 ${marca} — ${anada}</div>
      <div class="hist-linea etiq">Etiquetado:</div>
      <div class="hist-linea sin">Sin etiquetar:</div>
    `;
    cont.appendChild(bloque);
  }

  const linea = bloque.querySelector(`.${tipo}`);
  linea.innerHTML += ` +${cantidad}`;
}

// 🔹 Actualiza título del histórico al cambiar marca o añada
function actualizarTituloHistorico(fila){
  const cont = document.getElementById('historicoInventario');
  if(!cont) return;
  const bloque = cont.querySelector(`[data-id="${fila.dataset.histId}"]`);
  if(!bloque) return;

  const marca = fila.cells[0].querySelector('input').value || "Sin marca";
  const anada = fila.cells[1].querySelector('input').value || "—";

  bloque.querySelector('.hist-titulo').innerHTML = `🍷 ${marca} — ${anada}`;
}

// 🔹 Eliminar histórico asociado a una fila
function eliminarHistorico(fila){
  const cont = document.getElementById('historicoInventario');
  if(!cont) return;
  const bloque = cont.querySelector(`[data-id="${fila.dataset.histId}"]`);
  if(bloque) bloque.remove();
}

// 🔹 Inicializar inventario al cargar la página
document.addEventListener('DOMContentLoaded', inicializarInventario);

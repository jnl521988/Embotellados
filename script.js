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

  const tr = btn.closest('tr');
  const tbody = tr.parentElement;

  if(tbody.querySelectorAll('tr').length === 1){
    alert("Debe existir al menos una fila");
    return;
  }

  tr.remove();
}

/**********************
 * GUARDAR / CARGAR
 **********************/
function guardar(){

  const datos = {};

  document.querySelectorAll("table").forEach(tabla=>{

    if(!tabla.id) return;

    datos[tabla.id] = [];

    tabla.querySelectorAll("tbody tr").forEach(tr=>{

      const fila = [];

      tr.querySelectorAll("td").forEach(td=>{

        const campo = td.querySelector("input, select");

        if(campo){
          fila.push(campo.value);
        }else{
          fila.push(td.textContent.trim());
        }

      });

      datos[tabla.id].push(fila);

    });

  });

  localStorage.setItem("bodega", JSON.stringify(datos));

}
function cargar(){

  const datos = JSON.parse(localStorage.getItem("bodega"));
  if(!datos) return;

  Object.keys(datos).forEach(tablaId=>{

    const tabla = document.getElementById(tablaId);
    if(!tabla) return;

    const tbody = tabla.querySelector("tbody");
    const filasGuardadas = datos[tablaId];

    if(!filasGuardadas) return;

    const filasActuales = tbody.querySelectorAll("tr");

    // crear filas que falten
    for(let i=filasActuales.length;i<filasGuardadas.length;i++){

      if(tablaId === "tablaInventario"){
        addFilaInventario();
      }else{
        addFila(tablaId);
      }

    }

    const filas = tbody.querySelectorAll("tr");

    filasGuardadas.forEach((fila,i)=>{

      fila.forEach((valor,j)=>{

        const celda = filas[i].cells[j];
        if(!celda) return;

        const campo = celda.querySelector("input, select");

        if(campo){
          campo.value = valor;
        }

        // Restaurar acumuladores de Total y Gasto
if (campo && campo.disabled) {

    const encabezado = tabla.rows[0].cells[j].textContent.trim();

    if (encabezado === "Total" || encabezado === "Gasto") {
        campo.dataset.acum = valor || 0;
    }
}

      });

    });

    actualizarStocksEnProductos();

  });

  // reinicializar tirillas
  document.querySelectorAll('#tablaTirillasDO tbody tr').forEach(fila=>{
    setupFilaTirillas(fila);
  });

}
/**********************
 * EXPORTAR
 **********************/
function exportarExcel() {
  const paginaVisible = [...document.querySelectorAll('.pagina')]
  .find(p => getComputedStyle(p).display !== 'none');
  if (!paginaVisible) { 
    alert('No hay tabla visible para exportar'); 
    return; 
  }

  const wb = XLSX.utils.book_new();

  // 📌 Página de productos con 3 tablas
  if (paginaVisible.id === 'Productos') {
    const tablas = [
      { id: 'tablaCapsulasProd', titulo: 'Capsulas' },
      { id: 'tablaEtiquetasProd', titulo: 'Etiquetas' },
      { id: 'tablaCajasProd', titulo: 'Cajas' }
    ];

    tablas.forEach(t => {
      const tabla = document.getElementById(t.id);
      if (!tabla) return;

      const datos = [];

      // Cabecera
      const headers = [];
      tabla.querySelectorAll('thead th').forEach((th, i, arr) => {
        if (i === arr.length - 1) return; // Saltar columna acciones
        headers.push(th.textContent.trim());
      });
      datos.push(headers);

      // Filas
      tabla.querySelectorAll('tbody tr').forEach(tr => {
        const fila = [];
        tr.querySelectorAll('td').forEach((td, i, arr) => {
          if (i === arr.length - 1) return; // Saltar columna acciones
          const input = td.querySelector('input');
          const select = td.querySelector('select');
          const img = td.querySelector('img');
          if (img) fila.push(''); // opcional: dejar vacío o poner texto
          else fila.push(input ? input.value : (select ? select.value : td.textContent.trim()));
        });
        datos.push(fila);
      });

      const ws = XLSX.utils.aoa_to_sheet(datos);
      XLSX.utils.book_append_sheet(wb, ws, t.titulo);
    });

    XLSX.writeFile(wb, 'Productos.xlsx');
    return;
  }

  // 📌 Resto de páginas (comportamiento actual)
  const tablaVisible = paginaVisible.querySelector('table');
  if (!tablaVisible) { alert('No hay tabla visible para exportar'); return; }

  const datos = [];
  tablaVisible.querySelectorAll('tr').forEach(tr => {
    const fila = [];
    tr.querySelectorAll('td, th').forEach((td, i, arr) => {
      if (i === arr.length - 1) return;
      const input = td.querySelector('input');
      const select = td.querySelector('select');
      fila.push(input ? input.value : (select ? select.value : td.textContent.trim()));
    });
    datos.push(fila);
  });

  const ws = XLSX.utils.aoa_to_sheet(datos);
  XLSX.utils.book_append_sheet(wb, ws, tablaVisible.id);
  XLSX.writeFile(wb, tablaVisible.id + '.xlsx');
}

function exportarPDF() {
  // Detectar página visible
const paginaVisible = [...document.querySelectorAll('.pagina')]
  .find(p => getComputedStyle(p).display !== 'none');
  if (!paginaVisible) { alert('No hay tabla visible para exportar'); return; }

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF('l', 'pt');

  // 📌 Página de productos con 3 tablas
  if (paginaVisible.id === 'Productos') {
    const tablas = [
      { id: 'tablaCapsulasProd', titulo: 'Cápsulas' },
      { id: 'tablaEtiquetasProd', titulo: 'Etiquetas' },
      { id: 'tablaCajasProd', titulo: 'Cajas' }
    ];

    tablas.forEach((t, index) => {
      const tabla = document.getElementById(t.id);
      if (!tabla) return;

      if (index > 0) pdf.addPage(); // Nueva hoja para la 2ª y 3ª tabla

      pdf.setFontSize(14);
      pdf.text(t.titulo, 40, 30);

      // Extraer datos de la tabla
      const headers = [];
      tabla.querySelectorAll('thead th').forEach((th, i, arr) => {
        if (i === arr.length - 1) return; // saltar última columna acciones
        headers.push(th.textContent.trim());
      });

      const body = [];
      tabla.querySelectorAll('tbody tr').forEach(tr => {
        const fila = [];
        tr.querySelectorAll('td').forEach((td, i, arr) => {
          if (i === arr.length - 1) return; // saltar columna acciones
          const input = td.querySelector('input');
          const select = td.querySelector('select');
          const img = td.querySelector('img');
if (img) fila.push({imagen: img.src});
          else fila.push(input ? input.value : (select ? select.value : td.textContent.trim()));
        });
        body.push(fila);
      });

    pdf.autoTable({
  head: [headers],
  body: body,
  startY: 50,
  theme: 'grid',
  styles: { fontSize: 10 },

  didDrawCell: function(data) {

  if (data.section === 'body') {

    const celda = data.cell.raw;

    if (celda && celda.imagen) {

      const padding = data.cell.padding('left');

      const x = data.cell.x + padding;
      const y = data.cell.y + padding;

      const ancho = data.cell.width - padding*2;
      const alto  = data.cell.height - padding*2;

      pdf.addImage(
        celda.imagen,
        'JPEG',
        x,
        y,
        ancho,
        alto
      );

    }

  }

}
});
    });

    pdf.save('Productos.pdf');
    return;
  }

  // 📌 Resto de páginas (comportamiento actual)
  const tablaVisible = paginaVisible.querySelector('table');
  if (!tablaVisible) { alert('No hay tabla para exportar'); return; }

  const headers = [];
  tablaVisible.querySelectorAll('thead th').forEach((th, i, arr) => {
    if (i === arr.length - 1) return;
    headers.push(th.textContent.trim());
  });

  const body = [];
  tablaVisible.querySelectorAll('tbody tr').forEach(tr => {
    const fila = [];
    tr.querySelectorAll('td').forEach((td, i, arr) => {
      if (i === arr.length - 1) return;
      const input = td.querySelector('input');
      const select = td.querySelector('select');
      fila.push(input ? input.value : (select ? select.value : td.textContent.trim()));
    });
    body.push(fila);
  });

  pdf.text(tablaVisible.id, 40, 30);
  pdf.autoTable({ head: [headers], body: body, startY: 50, theme: 'grid', styles: { fontSize: 10 } });
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
 actualizarStocksEnProductos();
 guardar();
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
 * PRODUCTOS CON FOTO
 **********************/
let productos = [];

// 🚀 Cargar productos al iniciar
document.addEventListener('DOMContentLoaded', () => {
  const guardados = JSON.parse(localStorage.getItem('productos'));
  if(guardados) productos = guardados;

  // 🔒 Forzar cierre del modal al iniciar
  document.getElementById('modalEditarProducto').style.display = 'none';
  productoEditandoId = null;

  renderizarProductos();
  actualizarSelectProductos();
});


// Limpiar formulario
function limpiarFormulario() {
  document.getElementById('prod-nombre').value = '';
  document.getElementById('prod-desc').value = '';
  document.getElementById('prod-añada').value = '';
  document.getElementById('prod-foto').value = '';
}
function renderizarProductos() {

  const capsBody = document.querySelector("#tablaCapsulasProd tbody");
  const etiqBody = document.querySelector("#tablaEtiquetasProd tbody");
  const cajasBody = document.querySelector("#tablaCajasProd tbody");

  if(!capsBody || !etiqBody || !cajasBody) return;

  capsBody.innerHTML = "";
  etiqBody.innerHTML = "";
  cajasBody.innerHTML = "";

  productos.forEach(prod => {

    const filaConAnada = `
      <tr>
        <td>${prod.nombre}</td>
        <td>${prod.foto ? `<img src="${prod.foto}" width="50">` : ""}</td>
        <td>${prod.descripcion || ""}</td>
        <td>${prod.añada || ""}</td>
        <td class="stock-prod">0</td>
        <td>
          <button onclick="abrirModalEditar(${prod.id})">Editar</button>
          <button onclick="eliminarProducto(${prod.id})">Eliminar</button>
        </td>
      </tr>
    `;

  const filaCapsulas = `
<tr>
  <td>${prod.nombre}</td>
  <td>${prod.foto ? `<img src="${prod.foto}" width="50">` : ""}</td>
  <td>${prod.descripcion || ""}</td>
  <td class="stock-prod">0</td>
  <td>
    <button onclick="abrirModalEditar(${prod.id})">Editar</button>
    <button onclick="eliminarProducto(${prod.id})">Eliminar</button>
  </td>
</tr>
`;

const filaCajas = `
<tr>
  <td>${prod.nombre}</td>
  <td>${prod.foto ? `<img src="${prod.foto}" width="50">` : ""}</td>
  <td>${prod.descripcion || ""}</td>
  <td class="stock-prod">0</td>
  <td class="botellas-prod">0</td>
  <td>
    <button onclick="abrirModalEditar(${prod.id})">Editar</button>
    <button onclick="eliminarProducto(${prod.id})">Eliminar</button>
  </td>
</tr>
`;

    if(prod.clase === "etiquetas"){
      etiqBody.innerHTML += filaConAnada;
    }

    if(prod.clase === "capsulas"){
  capsBody.innerHTML += filaCapsulas;
}

if(prod.clase === "cajas"){
  cajasBody.innerHTML += filaCajas;
}

  });

  actualizarStocksEnProductos();
}

// Renderizar tabla de productos
async function añadirProducto() {
  const nombre = document.getElementById('prod-nombre').value.trim();
  const clase = document.getElementById('prod-clase').value;
  const descripcion = document.getElementById('prod-desc').value.trim();
  const añada = document.getElementById('prod-añada').value.trim();
  const fotoFile = document.getElementById('prod-foto').files[0];

  if(!nombre || !clase){
    alert("Nombre y clase obligatorios");
    return;
  }

  const foto = fotoFile ? await leerImagen(fotoFile) : "";

  const producto = {
    id: Date.now(),
    nombre,
    clase,   // 🆕
    descripcion,
    añada,
    foto
  };

  productos.push(producto);
  guardarProductos();
  renderizarProductos();
  actualizarSelectProductos();
  limpiarFormulario();
}

// Eliminar producto
function eliminarProducto(id) {
  if(!confirm('¿Seguro que quieres eliminar este producto?')) return;
  productos = productos.filter(p => p.id !== id);
  guardarProductos();
  renderizarProductos();
  actualizarSelectProductos();
}
function leerImagen(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.readAsDataURL(file);
  });
}

// Abrir modal de edición
let productoEditandoId = null;
function abrirModalEditar(id) {
  productoEditandoId = id;
  const prod = productos.find(p => p.id === id);
  if(!prod) return;

  document.getElementById('edit-nombre').value = prod.nombre;
 document.getElementById('edit-desc').value = prod.descripcion;
  document.getElementById('edit-añada').value = prod.añada;
  document.getElementById('preview-foto').src = prod.foto || '';
  document.getElementById('edit-foto').value = '';

  document.getElementById('modalEditarProducto').style.display = 'flex';
}

// Cerrar modal
function cerrarModalProducto(){
  document.getElementById('modalEditarProducto').style.display = 'none';
  productoEditandoId = null;
  fotoEliminada = false;
}

// Guardar edición
function guardarEdicionProducto() {

  const nombre = document.getElementById('edit-nombre').value.trim();
  const desc = document.getElementById('edit-desc').value.trim();
  const añada = document.getElementById('edit-añada').value.trim();
  const fotoInput = document.getElementById('edit-foto');

  if(!nombre){
    alert('El nombre es obligatorio');
    return;
  }

  const prod = productos.find(p => p.id === productoEditandoId);
  if(!prod) return;

  const nombreAnterior = prod.nombre;

  // actualizar datos básicos
  prod.nombre = nombre;
  prod.descripcion = desc;
  prod.añada = añada;

  // 🔴 CASO 1: quitar foto
  if(fotoEliminada){
    prod.foto = "";
    finalizarEdicion();
    fotoEliminada = false;
    return;
  }

  // 🟢 CASO 2: nueva foto
  if(fotoInput.files && fotoInput.files[0]){

    const reader = new FileReader();

    reader.onload = function(e){
      prod.foto = e.target.result;
      finalizarEdicion();
    };

    reader.readAsDataURL(fotoInput.files[0]);
    return;
  }

  // 🔵 CASO 3: mantener foto actual
  finalizarEdicion();


 function finalizarEdicion(){

  actualizarNombreProductoEnTablas(nombreAnterior, nombre);

  guardarProductos();
  renderizarProductos();
  actualizarSelectProductos();
  actualizarStocksEnProductos();


  cerrarModalProducto();
}


}
let fotoEliminada = false;

function quitarFotoProducto(){
  const preview = document.getElementById("preview-foto");
  const input = document.getElementById("edit-foto");

  if(preview) preview.src = "";
  if(input) input.value = "";

  fotoEliminada = true;
}
// Guardar en localStorage
function guardarProductos() {
  localStorage.setItem('productos', JSON.stringify(productos));
}
function actualizarNombreProductoEnTablas(nombreViejo, nombreNuevo){

  const tablas = [
    "tablaEtiquetas",
    "tablaCapsulas",
    "tablaCajas"
  ];

  tablas.forEach(id => {

    const tabla = document.getElementById(id);
    if(!tabla) return;

    tabla.querySelectorAll("tbody tr").forEach(fila => {

      const select = fila.querySelector("td.producto select");
      if(!select) return;

      if(select.value === nombreViejo){
        select.value = nombreNuevo;
      }

    });

  });

}

/********************************************
 * 📦 STOCK GLOBAL POR PRODUCTO
 ********************************************/
function obtenerStockProducto(nombreProd){

  let total = 0;

  ["tablaEtiquetas","tablaCapsulas","tablaCajas"].forEach(id=>{

    const tabla = document.getElementById(id);
    if(!tabla) return;

    tabla.querySelectorAll("tbody tr").forEach(fila=>{

      const select = fila.querySelector("td.producto select");
      if(!select || select.value !== nombreProd) return;

      let stock;

      if(id==="tablaEtiquetas"){
        stock = fila.cells[7].querySelector("input");
      }else{
        stock = fila.cells[6].querySelector("input");
      }

      total += Number(stock.value)||0;

    });

  });

  return total;
}

/********************************************
 * 🔄 ACTUALIZA STOCK EN TABLA PRODUCTOS
 ********************************************/
function actualizarStocksEnProductos(){

  const tablasProductos = [
    "tablaCapsulasProd",
    "tablaEtiquetasProd",
    "tablaCajasProd"
  ];

  tablasProductos.forEach(id => {

    const tabla = document.getElementById(id);
    if(!tabla) return;

    tabla.querySelectorAll("tbody tr").forEach(fila => {

      const nombre = fila.children[0]?.textContent.trim();
      const celdaStock = fila.querySelector(".stock-prod");

      if(!nombre || !celdaStock) return;

      const stock = obtenerStockProducto(nombre);

celdaStock.textContent = stock;

// Solo para la tabla de cajas
if(id === "tablaCajasProd"){

    const celdaBotellas = fila.querySelector(".botellas-prod");

    let botellas = 0;

    if(nombre.toLowerCase().includes("estuche individual")){
        botellas = stock * 1;
    }
    else if(nombre.toLowerCase().includes("estuche")){
        botellas = stock * 3;
    }
    else{
        // cajas normales y maletín mixto
        botellas = stock * 6;
    }

    celdaBotellas.textContent = botellas;
}

    });

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

// Actualiza los selects de productos
function actualizarSelectProductos() {

  const mapas = {
    tablaCapsulas: "capsulas",
    tablaEtiquetas: "etiquetas",
    tablaCajas: "cajas"
  };

  Object.keys(mapas).forEach(tablaId => {

    const clase = mapas[tablaId];
    const tabla = document.getElementById(tablaId);
    if(!tabla) return;

    const lista = productos.filter(p => p.clase === clase);

    tabla.querySelectorAll('tbody tr').forEach(tr => {

      const celda = tr.querySelector('td.producto');
      if(!celda) return;

      let select = celda.querySelector('select');

      // 🔹 Crear select solo si no existe
      if(!select){
        select = document.createElement('select');

        select.innerHTML =
          `<option value="">--Seleccione--</option>` +
          lista.map(p => `<option value="${p.nombre}">${p.nombre}</option>`).join('');

        celda.appendChild(select);
      }

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
  fila.children[1].innerHTML = crearSelect(opcionesBotellas.marca);
  fila.children[2].innerHTML = crearSelect(opcionesBotellas.modelo);
  fila.children[3].innerHTML = crearSelect(opcionesBotellas.capacidad);
}

function generarSelectsCorchos(fila){
  fila.children[1].innerHTML = crearSelect(opcionesCorchos.marca);
  fila.children[2].innerHTML = crearSelect(opcionesCorchos.modelo);
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


 /***********************
 * INVENTARIO + HISTÓRICO PRO
 ***********************/

const marcasVino = ["24 Mozas","Madremia","Abracadabra","Platón","Loquillo Tinto","Encomienda de la Vega","Loquillo Rosado","El Principito","Vocablos","MG 24 Mozas","MG Madremia","MG Abracadabra"];

function addFilaInventario(){
  const tbody = document.querySelector('#tablaInventario tbody');
  const tr = document.createElement('tr');

  tr.dataset.histId = "hist_" + Date.now() + Math.random();
  tr.dataset.etiq = 0;
  tr.dataset.sin = 0;

  tr.innerHTML = `
<td><input type="checkbox" class="selFila"></td>
<td>${crearSelectMarcas()}</td>
<td><input type="number" placeholder="Año"></td>
<td><input class="entrada-etiq" type="number"></td>
<td><input class="etiq" disabled></td>
<td><input class="entrada-sin" type="number"></td>
<td><input class="sin" disabled></td>
<td><input class="total" disabled></td>
<td><input></td>
<td><button onclick="eliminarFilaInventario(this)">🗑️</button></td>`;

  tbody.appendChild(tr);
  activarEventosFila(tr);
}

function crearSelectMarcas(){
  return `<select class="marca-select">
    <option value="">--Marca--</option>
    ${marcasVino.map(m=>`<option>${m}</option>`).join("")}
  </select>`;
}

/******** EVENTOS FILA ********/
function activarEventosFila(tr){

  tr.querySelector('.entrada-etiq').addEventListener('change', e=>{
    const val = Number(e.target.value)||0;
    if(val<=0) return;
    tr.dataset.etiq = Number(tr.dataset.etiq)+val;
    e.target.value="";
    actualizarFilaInventario(tr);
    registrarHistorico(tr,'etiq',val,false);
  });

  tr.querySelector('.entrada-sin').addEventListener('change', e=>{
    const val = Number(e.target.value)||0;
    if(val<=0) return;
    tr.dataset.sin = Number(tr.dataset.sin)+val;
    e.target.value="";
    actualizarFilaInventario(tr);
    registrarHistorico(tr,'sin',val,false);
  });

  tr.querySelector('.marca-select').addEventListener('change',()=>actualizarTituloHistorico(tr));
  tr.cells[2].querySelector('input').addEventListener('input',()=>actualizarTituloHistorico(tr));
}

/******** ACTUALIZA TABLA ********/
function actualizarFilaInventario(f){
  const etiq = Number(f.dataset.etiq);
  const sin  = Number(f.dataset.sin);
  f.querySelector('.etiq').value = etiq;
  f.querySelector('.sin').value  = sin;
  f.querySelector('.total').value = etiq + sin;
}

/******** HISTÓRICO ********/
function registrarHistorico(fila,tipo,cantidad,esAnterior){
  const cont = document.getElementById('historicoInventario');
  let bloque = cont.querySelector(`[data-id="${fila.dataset.histId}"]`);

  if(!bloque){
    bloque = document.createElement('div');
    bloque.className="hist-item";
    bloque.dataset.id=fila.dataset.histId;
    bloque.innerHTML=`
      <div class="hist-titulo"></div>
      <div class="hist-linea etiq"></div>
      <div class="hist-linea sin"></div>`;
    cont.appendChild(bloque);
  }

  actualizarTituloHistorico(fila);

  const linea = bloque.querySelector(`.${tipo}`);
  const listaActual = linea.dataset.actual ? linea.dataset.actual.split(",") : [];
  const listaPrev   = linea.dataset.prev ? linea.dataset.prev.split(",") : [];

  if(esAnterior) listaPrev.push(cantidad);
  else listaActual.push(cantidad);

  linea.dataset.actual = listaActual.join(",");
  linea.dataset.prev   = listaPrev.join(",");

  pintarLineaHistorico(linea,tipo);
}

function pintarLineaHistorico(linea,tipo){
  const actuales = linea.dataset.actual ? linea.dataset.actual.split(",").filter(Boolean) : [];
  const previos  = linea.dataset.prev ? linea.dataset.prev.split(",").filter(Boolean) : [];

  let texto = (tipo==="etiq"?"Etiquetado: ":"Sin etiquetar: ");
  if(actuales.length) texto += actuales.join(", ");
  if(previos.length) texto += ` (${previos.join(", ")})`;

  linea.textContent = texto;
}

function actualizarTituloHistorico(fila){
  const bloque = document.querySelector(`[data-id="${fila.dataset.histId}"]`);
  if(!bloque) return;
  const marca = fila.querySelector('.marca-select').value || "Sin marca";
  const anada = fila.cells[2].querySelector('input').value || "—";
  bloque.querySelector('.hist-titulo').textContent = `🍷 ${marca} — ${anada}`;
}

/******** RESET ********/
function resetFilasInventario(){
  document.querySelectorAll('#tablaInventario tbody tr').forEach(tr=>{
    if(!tr.querySelector('.selFila').checked) return;

    const bloque = document.querySelector(`[data-id="${tr.dataset.histId}"]`);
    if(bloque){
      ["etiq","sin"].forEach(tipo=>{
        const linea = bloque.querySelector(`.${tipo}`);
        if(!linea.dataset.actual) return;
        linea.dataset.prev = (linea.dataset.prev?linea.dataset.prev+",":"")+linea.dataset.actual;
        linea.dataset.actual="";
        pintarLineaHistorico(linea,tipo);
      });
    }

    tr.dataset.etiq=0;
    tr.dataset.sin=0;
    actualizarFilaInventario(tr);
    tr.querySelector('.selFila').checked=false;
  });
}

/******** ELIMINAR ********/
function eliminarFilaInventario(btn){
  const tr = btn.closest('tr');
  const bloque = document.querySelector(`[data-id="${tr.dataset.histId}"]`);
  if(bloque) bloque.remove();
  tr.remove();
}

/******** SELECT ALL ********/
document.addEventListener("change",e=>{
  if(e.target.id==="selectAllInv"){
    document.querySelectorAll('.selFila').forEach(c=>c.checked=e.target.checked);
  }
});
function seleccionarTodo(masterCheckbox){

  const tabla = masterCheckbox.closest('table');
  const checks = tabla.querySelectorAll('.fila-check');

  checks.forEach(ch => {
    ch.checked = masterCheckbox.checked;
  });
}
function resetSeleccionadas(btn){

  const seccion = btn.closest('section');
  const tabla = seccion.querySelector('table');

  const filas = tabla.querySelectorAll('tbody tr');

  filas.forEach(tr => {

    const check = tr.querySelector('.fila-check');
    if(!check || !check.checked) return;

    // Reset inputs
    tr.querySelectorAll('input').forEach(input => {

      if(input.type === "checkbox") return;

      if(input.disabled){
        input.value = 0;
        if(input.dataset.acum) input.dataset.acum = 0;
      }else{
        input.value = "";
      }

    });

    // Reset selects
    tr.querySelectorAll('select').forEach(select => {
      select.selectedIndex = 0; // vuelve a "Seleccione"
    });

    check.checked = false;

  });

  // Desmarcar checkbox maestro si existe
  const master = tabla.querySelector('thead input[type="checkbox"]');
  if(master) master.checked = false;
}
window.addEventListener("load", cargar);
document.addEventListener("input", function(e){

  if(
    e.target.closest("#tablaEtiquetas") ||
    e.target.closest("#tablaCapsulas") ||
    e.target.closest("#tablaCajas")
  ){
    actualizarStocksEnProductos();
  }

});
// Exportar todo el localStorage relevante a JSON
document.getElementById('exportarDatos').addEventListener('click', () => {
  const backup = {
    bodega: JSON.parse(localStorage.getItem('bodega') || '{}'),
    productos: JSON.parse(localStorage.getItem('productos') || '[]')
  };

  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `backup_bodega_${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
});

// Importar datos desde archivo JSON
document.getElementById('importarDatosBtn').addEventListener('click', () => {
  document.getElementById('importarDatos').click();
});

document.getElementById('importarDatos').addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(event) {
    try {
      const data = JSON.parse(event.target.result);

      // Restaurar datos
      if (data.bodega) localStorage.setItem('bodega', JSON.stringify(data.bodega));
      if (data.productos) localStorage.setItem('productos', JSON.stringify(data.productos));

      alert('Datos importados correctamente. Recarga la página para verlos.');
    } catch (err) {
      alert('Error al importar el archivo. Asegúrate de que sea un backup válido.');
      console.error(err);
    }
  };
  reader.readAsText(file);
});
function comprimirImagen(file, callback){

  const reader = new FileReader();

  reader.onload = function(e){

    const img = new Image();
    img.src = e.target.result;

    img.onload = function(){

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      const maxWidth = 300;   // tamaño máximo
      const scale = maxWidth / img.width;

      canvas.width = maxWidth;
      canvas.height = img.height * scale;

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const imagenComprimida = canvas.toDataURL("image/jpeg", 0.7);

      callback(imagenComprimida);

    };

  };

  reader.readAsDataURL(file);

}
const file = inputFoto.files[0];

if(file){

  comprimirImagen(file, function(imgBase64){

    producto.foto = imgBase64;

    guardarProductos();

  });

}

/* ═══════════════════════════════════
   BUDGET CONTROL — script.js
═══════════════════════════════════ */
 
const USUARIOS = {
  'negocio1': 'budget2026',
  'demo':     '1234'
};
 
// Variable para guardar la venta activa (para compartir)
let ventaActiva = null;
 
 
// ════════════════════════════════
// INDEX.HTML — Login
// ════════════════════════════════
const modalLogin = document.getElementById('modalLogin');
 
function abrirModal() {
  if (!modalLogin) return;
  modalLogin.classList.add('visible');
  document.getElementById('loginUsuario').focus();
}
 
function cerrarModal() {
  if (!modalLogin) return;
  modalLogin.classList.remove('visible');
  document.getElementById('loginError').classList.remove('visible');
  document.getElementById('loginUsuario').value  = '';
  document.getElementById('loginPassword').value = '';
}
 
if (modalLogin) {
  modalLogin.addEventListener('click', function(e) {
    if (e.target === this) cerrarModal();
  });
}
 
function iniciarSesion() {
  const usuario  = document.getElementById('loginUsuario').value.trim();
  const password = document.getElementById('loginPassword').value;
  const error    = document.getElementById('loginError');
 
  if (USUARIOS[usuario] && USUARIOS[usuario] === password) {
    sessionStorage.setItem('usuarioActivo', usuario);
    window.location.href = 'panel.html';
  } else {
    error.classList.add('visible');
    document.getElementById('loginPassword').value = '';
    document.getElementById('loginPassword').focus();
  }
}
 
 
// ════════════════════════════════
// PANEL.HTML — Inicialización
// ════════════════════════════════
const nombreUsuario = document.getElementById('nombreUsuario');
 
if (nombreUsuario) {
  const usuarioActivo = sessionStorage.getItem('usuarioActivo');
  if (!usuarioActivo) {
    window.location.href = 'index.html';
  } else {
    nombreUsuario.textContent = usuarioActivo;
    iniciarPanel();
  }
}
 
function iniciarPanel() {
  monitorearConexion();
  actualizarTotal();
  renderizarHistorial();
  calcular();
}
 
function cerrarSesion() {
  sessionStorage.removeItem('usuarioActivo');
  window.location.href = 'index.html';
}
 
 
// ════════════════════════════════
// MODO SIN INTERNET
// ════════════════════════════════
function monitorearConexion() {
  const badge = document.getElementById('conexionBadge');
  const aviso = document.getElementById('avisoOffline');
 
  function actualizar() {
    if (navigator.onLine) {
      badge.textContent = '🟢 En línea';
      badge.className   = 'conexion-badge online';
      aviso.style.display = 'none';
    } else {
      badge.textContent = '🔴 Sin conexión';
      badge.className   = 'conexion-badge offline';
      aviso.style.display = 'block';
    }
  }
 
  actualizar();
  window.addEventListener('online',  actualizar);
  window.addEventListener('offline', actualizar);
}
 
 
// ════════════════════════════════
// REGISTRO DE VENTA
// ════════════════════════════════
function actualizarTotal() {
  const cantidad = parseInt(document.getElementById('vCantidad').value) || 0;
  const precio   = parseInt(document.getElementById('vPrecio').value)   || 0;
  document.getElementById('vTotal').textContent = '$' + (cantidad * precio).toLocaleString('es-CO');
}
 
function registrarVenta() {
  const negocio  = document.getElementById('vNegocio').value.trim();
  const producto = document.getElementById('vProducto').value.trim();
  const cantidad = parseInt(document.getElementById('vCantidad').value) || 0;
  const precio   = parseInt(document.getElementById('vPrecio').value)   || 0;
  const metodo   = document.getElementById('vMetodo').value;
  const cliente  = document.getElementById('vCliente').value.trim();
  const whatsapp = document.getElementById('vWhatsapp').value.trim().replace(/\D/g, '');
  const total    = cantidad * precio;
 
  if (!producto || !cantidad || !precio) {
    alert('Por favor completa producto, cantidad y precio.');
    return;
  }
 
  const venta = {
    fecha:    new Date().toLocaleDateString('es-CO'),
    hora:     new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
    negocio:  negocio  || 'Mi negocio',
    producto,
    cantidad,
    precio,
    metodo,
    cliente:  cliente  || 'Cliente general',
    whatsapp,
    total
  };
 
  // Guardar en localStorage
  const historial = JSON.parse(localStorage.getItem('ventasBC') || '[]');
  historial.unshift(venta);
  localStorage.setItem('ventasBC', JSON.stringify(historial));
 
  // Guardar como venta activa para compartir
  ventaActiva = venta;
 
  // Mostrar ticket y botones
  mostrarTicketGenerado(venta);
  renderizarHistorial();
}
 
function mostrarTicketGenerado(v) {
  const wrap    = document.getElementById('ticketWrap');
  const preview = document.getElementById('ticketPreview');
  const btnWp   = document.getElementById('btnWp');
 
  // Construir vista previa del ticket
  preview.innerHTML = `
    <div class="ticket-header">
      <span class="ticket-negocio">${v.negocio}</span>
      <span class="ticket-fecha">${v.fecha} · ${v.hora}</span>
    </div>
    <div class="ticket-linea">
      <span>${v.producto}</span>
      <span>${v.cantidad} × $${v.precio.toLocaleString('es-CO')}</span>
    </div>
    <div class="ticket-linea ticket-metodo">
      <span>Pago</span><span>${v.metodo}</span>
    </div>
    <div class="ticket-linea ticket-cliente">
      <span>Cliente</span><span>${v.cliente}</span>
    </div>
    <div class="ticket-total">
      <span>Total</span>
      <span>$${v.total.toLocaleString('es-CO')} COP</span>
    </div>
    <div class="ticket-footer">Budget Control · comprobante digital</div>
  `;
 
  // Mostrar u ocultar botón WP según si hay número
  btnWp.style.display = v.whatsapp ? 'inline-flex' : 'none';
 
  // Mostrar sección
  wrap.classList.add('visible');
  wrap.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
 
function nuevoTicket() {
  // Limpiar formulario
  document.getElementById('vNegocio').value   = '';
  document.getElementById('vProducto').value  = '';
  document.getElementById('vCantidad').value  = '1';
  document.getElementById('vPrecio').value    = '';
  document.getElementById('vCliente').value   = '';
  document.getElementById('vWhatsapp').value  = '';
  actualizarTotal();
 
  // Ocultar ticket y QR
  document.getElementById('ticketWrap').classList.remove('visible');
  cerrarQR();
  ventaActiva = null;
 
  // Scroll al formulario
  document.getElementById('vProducto').focus();
}
 
 
// ════════════════════════════════
// ENVIAR POR WHATSAPP
// ════════════════════════════════
function enviarWhatsApp() {
  if (!ventaActiva) return;
  const v = ventaActiva;
 
  const mensaje =
    `*COMPROBANTE DE VENTA*\n` +
    `*${v.negocio}*\n` +
    `─────────────────\n` +
    `Producto: ${v.producto}\n` +
    `Cantidad: ${v.cantidad}\n` +
    `Precio unitario: $${v.precio.toLocaleString('es-CO')} COP\n` +
    `─────────────────\n` +
    `*TOTAL: $${v.total.toLocaleString('es-CO')} COP*\n` +
    `Método de pago: ${v.metodo}\n` +
    `Cliente: ${v.cliente}\n` +
    `Fecha: ${v.fecha} ${v.hora}\n` +
    `─────────────────\n` +
    `Gracias por su compra 🙌\n` +
    `_Budget Control · comprobante digital_`;
 
  const numero = v.whatsapp.startsWith('57') ? v.whatsapp : '57' + v.whatsapp;
  const url    = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
  window.open(url, '_blank');
}
 
 
// ════════════════════════════════
// GENERAR QR
// ════════════════════════════════
function mostrarQR() {
  if (!ventaActiva) return;
  const v = ventaActiva;
 
  const mensaje =
    `*COMPROBANTE DE VENTA*\n` +
    `*${v.negocio}*\n` +
    `Producto: ${v.producto}\n` +
    `Cantidad: ${v.cantidad} × $${v.precio.toLocaleString('es-CO')} COP\n` +
    `*TOTAL: $${v.total.toLocaleString('es-CO')} COP*\n` +
    `Pago: ${v.metodo}\n` +
    `Cliente: ${v.cliente}\n` +
    `Fecha: ${v.fecha} ${v.hora}\n` +
    `_Budget Control · comprobante digital_`;
 
  // URL de WhatsApp sin número (el cliente lo abre con su app)
  const urlWa = `https://wa.me/?text=${encodeURIComponent(mensaje)}`;
 
  // Limpiar y generar QR
  const canvas = document.getElementById('qrCanvas');
  canvas.innerHTML = '';
 
  new QRCode(canvas, {
    text:          urlWa,
    width:         200,
    height:        200,
    colorDark:     '#1f3c64',
    colorLight:    '#ffffff',
    correctLevel:  QRCode.CorrectLevel.M
  });
 
  document.getElementById('qrModal').classList.add('visible');
}
 
function cerrarQR() {
  const modal = document.getElementById('qrModal');
  if (modal) modal.classList.remove('visible');
}
 
 
// ════════════════════════════════
// HISTORIAL Y REPORTE
// ════════════════════════════════
function renderizarHistorial() {
  const historial = JSON.parse(localStorage.getItem('ventasBC') || '[]');
  const lista     = document.getElementById('historialLista');
  const totalV    = document.getElementById('rTotalVentas');
  const totalI    = document.getElementById('rTotalIngresos');
  const promedio  = document.getElementById('rPromedioVenta');
 
  if (!lista) return;
 
  const sumTotal = historial.reduce((acc, v) => acc + v.total, 0);
  const prom     = historial.length ? Math.round(sumTotal / historial.length) : 0;
 
  totalV.textContent   = historial.length;
  totalI.textContent   = '$' + sumTotal.toLocaleString('es-CO');
  promedio.textContent = '$' + prom.toLocaleString('es-CO');
 
  if (historial.length === 0) {
    lista.innerHTML = '<p class="historial-vacio">Aún no hay ventas registradas.</p>';
    return;
  }
 
  lista.innerHTML = historial.slice(0, 5).map(v => `
    <div class="historial-item">
      <div class="hi-info">
        <span class="hi-producto">${v.producto}</span>
        <span class="hi-detalle">${v.cantidad} × $${v.precio.toLocaleString('es-CO')} · ${v.metodo}</span>
        <span class="hi-cliente">${v.cliente} · ${v.fecha} ${v.hora}</span>
      </div>
      <span class="hi-total">$${v.total.toLocaleString('es-CO')}</span>
    </div>
  `).join('');
}
 
function descargarReporte() {
  const historial = JSON.parse(localStorage.getItem('ventasBC') || '[]');
  const usuario   = sessionStorage.getItem('usuarioActivo') || 'suscriptor';
 
  if (historial.length === 0) {
    alert('No hay ventas registradas para generar el reporte.');
    return;
  }
 
  const sumTotal = historial.reduce((acc, v) => acc + v.total, 0);
  const prom     = Math.round(sumTotal / historial.length);
  const fecha    = new Date().toLocaleDateString('es-CO');
 
  let texto = '';
  texto += '════════════════════════════════\n';
  texto += '       BUDGET CONTROL\n';
  texto += '   Reporte de vida comercial\n';
  texto += '════════════════════════════════\n';
  texto += `Usuario:           ${usuario}\n`;
  texto += `Fecha del reporte: ${fecha}\n`;
  texto += '────────────────────────────────\n';
  texto += `Total de ventas:   ${historial.length}\n`;
  texto += `Ingresos totales:  $${sumTotal.toLocaleString('es-CO')} COP\n`;
  texto += `Promedio por venta: $${prom.toLocaleString('es-CO')} COP\n`;
  texto += '────────────────────────────────\n';
  texto += 'DETALLE DE VENTAS:\n\n';
 
  historial.forEach((v, i) => {
    texto += `${i + 1}. ${v.fecha} ${v.hora}\n`;
    texto += `   Negocio:  ${v.negocio}\n`;
    texto += `   Producto: ${v.producto}\n`;
    texto += `   Cliente:  ${v.cliente}\n`;
    texto += `   Cantidad: ${v.cantidad} × $${v.precio.toLocaleString('es-CO')}\n`;
    texto += `   Pago:     ${v.metodo}\n`;
    texto += `   Total:    $${v.total.toLocaleString('es-CO')} COP\n\n`;
  });
 
  texto += '════════════════════════════════\n';
  texto += 'Budget Control · Medellín, Colombia\n';
  texto += 'soporte@budgetcontrol.com\n';
 
  const blob = new Blob([texto], { type: 'text/plain;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `reporte_budget_control_${fecha.replace(/\//g, '-')}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}
 
function limpiarHistorial() {
  if (confirm('¿Seguro que quieres borrar todo el historial? Esta acción no se puede deshacer.')) {
    localStorage.removeItem('ventasBC');
    renderizarHistorial();
  }
}
 
 
// ════════════════════════════════
// ALERTA DE RENTABILIDAD
// ════════════════════════════════
function calcularRentabilidad() {
  const ingresos = parseInt(document.getElementById('rIngresos').value) || 0;
  const gastos   = parseInt(document.getElementById('rGastos').value)   || 0;
  const ganancia = ingresos - gastos;
  const icon     = document.getElementById('rentIcon');
  const msg      = document.getElementById('rentMsg');
  const box      = document.getElementById('rentabilidadResultado');
 
  if (!ingresos && !gastos) {
    icon.textContent = '—';
    msg.textContent  = 'Ingresa tus datos para ver el resultado.';
    box.className    = 'rentabilidad-resultado';
    return;
  }
 
  if (ganancia > 0) {
    icon.textContent = '✅';
    msg.textContent  = `Esta semana vendiste $${ingresos.toLocaleString('es-CO')} y gastaste $${gastos.toLocaleString('es-CO')}. Tu ganancia fue $${ganancia.toLocaleString('es-CO')} COP. ¡Vas bien!`;
    box.className    = 'rentabilidad-resultado positivo';
  } else if (ganancia === 0) {
    icon.textContent = '⚠️';
    msg.textContent  = `Vendiste exactamente lo que gastaste ($${ingresos.toLocaleString('es-CO')}). Esta semana no perdiste, pero tampoco ganaste.`;
    box.className    = 'rentabilidad-resultado neutro';
  } else {
    icon.textContent = '🔴';
    msg.textContent  = `Esta semana gastaste $${gastos.toLocaleString('es-CO')} pero solo vendiste $${ingresos.toLocaleString('es-CO')}. Perdiste $${Math.abs(ganancia).toLocaleString('es-CO')} COP. Revisa tus gastos.`;
    box.className    = 'rentabilidad-resultado negativo';
  }
}
 
 
// ════════════════════════════════
// CALCULADORA DE AHORRO
// ════════════════════════════════
function calcular() {
  const tickets  = parseInt(document.getElementById('cTickets').value)  || 0;
  const rollo    = parseInt(document.getElementById('cRollo').value)    || 0;
  const porRollo = parseInt(document.getElementById('cPorRollo').value) || 1;
  const precio   = parseInt(document.getElementById('cPrecio').value)   || 0;
 
  const rollosMes   = tickets / porRollo;
  const ahorroPapel = Math.round(rollosMes * rollo);
  const ingreso     = tickets * precio;
  const rollosAnio  = Math.round(rollosMes * 12);
  const kgAnio      = (rollosAnio * 0.1).toFixed(1);
 
  document.getElementById('rAhorroPapel').textContent = '$' + ahorroPapel.toLocaleString('es-CO');
  document.getElementById('rRollos').textContent      = rollosMes.toFixed(1) + ' rollos menos al mes';
  document.getElementById('rIngreso').textContent     = '$' + ingreso.toLocaleString('es-CO');
  document.getElementById('rVentas').textContent      = tickets + ' ventas × $' + precio.toLocaleString('es-CO');
  document.getElementById('rPapelAnio').textContent   = rollosAnio + ' rollos';
  document.getElementById('rCO2').textContent         = '≈ ' + kgAnio + ' kg menos de residuos';
}

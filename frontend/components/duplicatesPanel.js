import { escapeHtml, number } from './utils.js';

export function renderDuplicatesPanel(duplicates, showEyebrow = true) {
  const items = duplicates.length ? duplicates.map((pair) => `
    <div class="duplicate-item">
      <p class="duplicate-title">
        <span>${escapeHtml(pair.numero_orden_1)} <span aria-hidden="true">↔</span> ${escapeHtml(pair.numero_orden_2)}</span>
        <span class="exposure">${number.format(pair.dias_diferencia)} día(s)</span>
      </p>
      <p class="duplicate-detail">${escapeHtml(pair.proveedor)} · ${escapeHtml(pair.material)} · ${number.format(pair.cantidad_1)} / ${number.format(pair.cantidad_2)} unidades · ${escapeHtml(pair.fecha_1)} / ${escapeHtml(pair.fecha_2)}</p>
    </div>
  `).join('') : '<p class="empty-state">No se encontraron coincidencias bajo la regla definida.</p>';

  return `
    <article class="panel">
      <div class="panel-heading">
        <div>
          ${showEyebrow ? '<p class="eyebrow">CONTROL DE COMPRAS</p>' : ''}
          <h2>Posibles duplicados</h2>
        </div>
        <span class="icon-badge icon-badge-warn" aria-hidden="true">!</span>
      </div>
      <div id="duplicates-list" class="duplicate-list">${items}</div>
      <p class="table-note">Una coincidencia requiere validación documental; no confirma fraude.</p>
    </article>
  `;
}

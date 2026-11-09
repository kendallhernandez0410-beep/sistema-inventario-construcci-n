import { escapeHtml, number } from './utils.js';

export function renderMaterialsTable(materials, showEyebrow = true) {
  const rows = materials.map((material) => {
    const low = material.requiere_reposicion;
    return `<tr>
      <td>${escapeHtml(material.nombre)}<br><span class="table-note">${escapeHtml(material.categoria)} · ${escapeHtml(material.subcategoria)}</span></td>
      <td>${escapeHtml(material.sku)}</td>
      <td><span class="stock-value ${low ? 'stock-warning' : ''}">${number.format(material.stock_actual)} ${escapeHtml(material.unidad)}</span></td>
      <td>${number.format(material.stock_seguridad)} ${escapeHtml(material.unidad)}</td>
      <td>${number.format(material.punto_reorden)} ${escapeHtml(material.unidad)}</td>
      <td><span class="pill ${low ? 'pill-low' : 'pill-ok'}">${low ? 'Reponer' : 'En nivel'}</span></td>
    </tr>`;
  }).join('');

  return `
    <article class="panel inventory-panel">
      <div class="panel-heading">
        <div>
          ${showEyebrow ? '<p class="eyebrow">EXISTENCIAS</p>' : ''}
          <h2>Niveles de inventario</h2>
        </div>
        <span class="live-label"><span class="status-dot"></span> En vivo</span>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Material</th>
              <th>SKU</th>
              <th>Stock actual</th>
              <th>Stock seguridad</th>
              <th>Punto reorden</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody id="materials-body">
            ${rows || '<tr><td colspan="6" class="empty-state">No hay materiales activos.</td></tr>'}
          </tbody>
        </table>
      </div>
      <p class="table-note">PR = demanda promedio × plazo de entrega + stock de seguridad.</p>
    </article>
  `;
}

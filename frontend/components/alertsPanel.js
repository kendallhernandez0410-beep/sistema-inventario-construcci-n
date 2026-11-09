import { escapeHtml, number } from './utils.js';

export function renderAlertsPanel(alerts, showEyebrow = true) {
  const items = alerts.length ? alerts.map((alert) => `
    <div class="alert-item">
      <div>
        <p class="alert-title">${escapeHtml(alert.material)}</p>
        <p class="alert-detail">Stock: ${number.format(alert.stock_actual)} ${escapeHtml(alert.unidad)} · PR: ${number.format(alert.demanda_promedio * alert.plazo_entrega_dias + (alert.demanda_maxima - alert.demanda_promedio) * alert.plazo_entrega_dias)} ${escapeHtml(alert.unidad)}</p>
      </div>
      <span class="alert-gap">Revisar</span>
    </div>
  `).join('') : '<p class="empty-state">No hay materiales bajo el punto de reorden.</p>';

  return `
    <article class="panel">
      <div class="panel-heading">
        <div>
          ${showEyebrow ? '<p class="eyebrow">ABASTECIMIENTO</p>' : ''}
          <h2>Alertas de reorden</h2>
        </div>
        <span id="alert-count" class="count-badge">${number.format(alerts.length)}</span>
      </div>
      <div id="alerts-list" class="alert-list">${items}</div>
    </article>
  `;
}

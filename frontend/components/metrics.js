export function renderMetrics() {
  return `
    <section class="metrics" aria-label="Resumen">
      <article class="metric-card">
        <span class="metric-label">Materiales activos</span>
        <strong id="metric-materials" class="metric-value">—</strong>
        <span class="metric-foot">En el catálogo</span>
      </article>
      <article class="metric-card">
        <span class="metric-label">Alertas de reposición</span>
        <strong id="metric-alerts" class="metric-value">—</strong>
        <span class="metric-foot">Stock igual o menor al PR</span>
      </article>
      <article class="metric-card">
        <span class="metric-label">Órdenes por revisar</span>
        <strong id="metric-duplicates" class="metric-value">—</strong>
        <span class="metric-foot">Coincidencias sospechosas</span>
      </article>
    </section>
  `;
}

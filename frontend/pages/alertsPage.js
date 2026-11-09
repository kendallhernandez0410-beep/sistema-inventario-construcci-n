import { renderAlertsPanel } from '../components/alertsPanel.js';
import { renderPageHeading } from '../components/pageHeading.js';
import { renderPageShell } from '../components/pageShell.js';
import { fetchAlerts } from '../services/api.js';

export function renderAlertsPage(user) {
  return renderPageShell(`
    ${renderPageHeading({
      eyebrow: 'ABASTECIMIENTO <span>/</span> INVENTARIO',
      title: 'Alertas de reorden',
      subtitle: 'Materiales que alcanzaron o están por debajo de su punto de reposición.'
    })}
    <div id="alerts-page-content"><p class="empty-state">Cargando alertas…</p></div>
  `, '#/alertas', user);
}

export async function initializeAlertsPage() {
  const target = document.getElementById('alerts-page-content');
  try {
    const alerts = await fetchAlerts();
    target.innerHTML = renderAlertsPanel(alerts, false);
  } catch (error) {
    target.innerHTML = `<p class="form-message error">No fue posible cargar las alertas: ${error.message}</p>`;
  }
}

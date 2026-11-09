import { renderAlertsPanel } from '../components/alertsPanel.js';
import { renderDuplicatesPanel } from '../components/duplicatesPanel.js';
import { renderMetrics } from '../components/metrics.js';
import { renderMaterialsTable } from '../components/materialsTable.js';
import { renderMovementForm } from '../components/movementForm.js';
import { renderPageHeading } from '../components/pageHeading.js';
import { renderPageShell } from '../components/pageShell.js';
import { createMovement, fetchAlerts, fetchMaterials, fetchPossibleDuplicates } from '../services/api.js';
import { number } from '../components/utils.js';

export function renderDashboardPage(user) {
  const action = '<button id="refresh-button" class="button button-light" type="button"><span aria-hidden="true">↻</span> Actualizar datos</button>';
  return renderPageShell(`
    ${renderPageHeading({
      eyebrow: 'OPERACIONES <span>/</span> BODEGA CENTRAL',
      title: 'Inventario de materiales',
      subtitle: 'Visibilidad de existencias y reposición para las obras de Del Valle.',
      action
    })}
    ${renderMetrics()}
    <section class="content-grid">
      <div id="dashboard-materials"><p class="empty-state">Cargando inventario…</p></div>
      <div id="dashboard-movement"></div>
    </section>
    <section class="lower-grid">
      <div id="dashboard-alerts"><p class="empty-state">Cargando alertas…</p></div>
      <div id="dashboard-duplicates"><p class="empty-state">Revisando órdenes…</p></div>
    </section>
  `, '#/', user);
}

export function initializeDashboard() {
  const app = document.getElementById('app');
  const message = (text, type) => {
    const target = app.querySelector('#form-message');
    if (target) {
      target.textContent = text;
      target.className = `form-message ${type}`;
    }
  };

  async function loadDashboard() {
    const button = app.querySelector('#refresh-button');
    if (button) button.disabled = true;
    try {
      const [materials, alerts, duplicates] = await Promise.all([
        fetchMaterials(),
        fetchAlerts(),
        fetchPossibleDuplicates()
      ]);
      app.querySelector('#metric-materials').textContent = number.format(materials.length);
      app.querySelector('#metric-alerts').textContent = number.format(alerts.length);
      app.querySelector('#metric-duplicates').textContent = number.format(duplicates.length);
      app.querySelector('#dashboard-materials').innerHTML = renderMaterialsTable(materials);
      app.querySelector('#dashboard-movement').innerHTML = renderMovementForm(materials);
      app.querySelector('#dashboard-alerts').innerHTML = renderAlertsPanel(alerts);
      app.querySelector('#dashboard-duplicates').innerHTML = renderDuplicatesPanel(duplicates);
    } catch (error) {
      message(`No fue posible cargar el tablero: ${error.message}`, 'error');
    } finally {
      if (button) button.disabled = false;
    }
  }

  app.querySelector('#refresh-button').addEventListener('click', loadDashboard);
  app.addEventListener('submit', async (event) => {
    if (event.target.id !== 'movement-form') return;
    event.preventDefault();
    const movementForm = event.target;
    const button = movementForm.querySelector('button[type="submit"]');
    const formData = new FormData(movementForm);
    const payload = {
      material_id: Number(formData.get('material_id')),
      tipo: formData.get('tipo'),
      cantidad: Number(formData.get('cantidad')),
      referencia: formData.get('referencia'),
      responsable: formData.get('responsable'),
      observaciones: formData.get('observaciones')
    };

    button.disabled = true;
    message('', '');
    try {
      const result = await createMovement(payload);
      movementForm.reset();
      await loadDashboard();
      message(`Movimiento registrado. Nuevo stock: ${number.format(result.data.stock_resultante)}.`, 'success');
    } catch (error) {
      message(error.message, 'error');
    } finally {
      button.disabled = false;
    }
  });

  loadDashboard();
}

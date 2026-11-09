import { renderDuplicatesPanel } from '../components/duplicatesPanel.js';
import { renderPageHeading } from '../components/pageHeading.js';
import { renderPageShell } from '../components/pageShell.js';
import { fetchPossibleDuplicates } from '../services/api.js';

export function renderOrdersPage(user) {
  return renderPageShell(`
    ${renderPageHeading({
      eyebrow: 'COMPRAS <span>/</span> CONTROL',
      title: 'Órdenes por revisar',
      subtitle: 'Coincidencias que deben validarse contra requisiciones, recepciones y facturas.'
    })}
    <div id="orders-page-content"><p class="empty-state">Revisando órdenes…</p></div>
  `, '#/ordenes', user);
}

export async function initializeOrdersPage() {
  const target = document.getElementById('orders-page-content');
  try {
    const duplicates = await fetchPossibleDuplicates();
    target.innerHTML = renderDuplicatesPanel(duplicates, false);
  } catch (error) {
    target.innerHTML = `<p class="form-message error">No fue posible cargar las órdenes: ${error.message}</p>`;
  }
}

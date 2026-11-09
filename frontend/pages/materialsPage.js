import { renderMaterialsTable } from '../components/materialsTable.js';
import { renderPageHeading } from '../components/pageHeading.js';
import { renderPageShell } from '../components/pageShell.js';
import { fetchMaterials } from '../services/api.js';

export function renderMaterialsPage(user) {
  return renderPageShell(`
    ${renderPageHeading({
      eyebrow: 'CATÁLOGO <span>/</span> EXISTENCIAS',
      title: 'Materiales',
      subtitle: 'Consulta de existencias, niveles de seguridad y puntos de reorden.'
    })}
    <div id="materials-page-content"><p class="empty-state">Cargando materiales…</p></div>
  `, '#/materiales', user);
}

export async function initializeMaterialsPage() {
  const target = document.getElementById('materials-page-content');
  try {
    const materials = await fetchMaterials();
    target.innerHTML = renderMaterialsTable(materials, false);
  } catch (error) {
    target.innerHTML = `<p class="form-message error">No fue posible cargar los materiales: ${error.message}</p>`;
  }
}

import { renderPageShell } from '../components/pageShell.js';

export function renderNotFoundPage(user) {
  return renderPageShell(`
    <section class="hero">
      <div>
        <p class="eyebrow">ERROR <span>/</span> NAVEGACIÓN</p>
        <h1>Página no encontrada</h1>
        <p class="subtitle">La sección solicitada no existe.</p>
      </div>
      <a class="button button-light" href="#/">Volver al resumen</a>
    </section>
  `, '', user);
}

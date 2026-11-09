import { escapeHtml } from './utils.js';

const navigation = [
  { path: '#/', label: 'Resumen' },
  { path: '#/materiales', label: 'Materiales' },
  { path: '#/alertas', label: 'Alertas' },
  { path: '#/ordenes', label: 'Órdenes' }
];

export function renderHeader(activePath, user) {
  const links = user ? navigation.map(({ path, label }) => `
    <a class="nav-link ${path === activePath ? 'active' : ''}" href="${path}" ${path === activePath ? 'aria-current="page"' : ''}>
      ${label}
    </a>
  `).join('') : '';

  return `
    <header class="topbar">
      <a class="brand" href="${user ? '#/' : '#/login'}" aria-label="Inicio">
        <span class="brand-mark" aria-hidden="true">DV</span>
        <span><strong>DEL VALLE</strong><small>CONTROL DE INVENTARIO</small></span>
      </a>
      ${user ? `<nav class="main-nav" aria-label="Navegación principal">${links}</nav>` : ''}
      <div class="topbar-right">
        ${user
    ? `<span class="user-name">${escapeHtml(user.nombre)}</span><button id="logout-button" class="logout-button" type="button">Cerrar sesión</button>`
    : '<span class="environment">ACCESO SEGURO</span>'}
      </div>
    </header>
  `;
}

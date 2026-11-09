import { initializeAlertsPage, renderAlertsPage } from '../pages/alertsPage.js';
import { initializeDashboard, renderDashboardPage } from '../pages/dashboardPage.js';
import { initializeMaterialsPage, renderMaterialsPage } from '../pages/materialsPage.js';
import { initializeOrdersPage, renderOrdersPage } from '../pages/ordersPage.js';
import { initializeLoginPage, renderLoginPage } from '../pages/loginPage.js';
import { renderNotFoundPage } from '../pages/notFoundPage.js';
import { fetchCurrentUser, logout } from '../services/api.js';

const routes = {
  '/': { render: renderDashboardPage, initialize: initializeDashboard },
  '/materiales': { render: renderMaterialsPage, initialize: initializeMaterialsPage },
  '/alertas': { render: renderAlertsPage, initialize: initializeAlertsPage },
  '/ordenes': { render: renderOrdersPage, initialize: initializeOrdersPage },
  '/login': { render: renderLoginPage, initialize: initializeLoginPage, public: true }
};

function currentPath() {
  return window.location.hash.slice(1).split('?')[0] || '/';
}

export function createRouter(root) {
  let navigationId = 0;

  async function navigate() {
    const currentNavigation = ++navigationId;
    const path = currentPath();
    const route = routes[path];
    let user;

    try {
      user = await fetchCurrentUser();
    } catch (error) {
      root.innerHTML = `<main class="page"><p class="form-message error">No fue posible verificar la sesión: ${error.message}</p></main>`;
      return;
    }
    if (currentNavigation !== navigationId) return;

    if (!user && path !== '/login') {
      window.location.hash = '#/login';
      return;
    }
    if (user && path === '/login') {
      window.location.hash = '#/';
      return;
    }

    if (path === '/login') {
      root.innerHTML = route.render();
      route.initialize();
      return;
    }
    if (!route) {
      root.innerHTML = renderNotFoundPage(user);
      return;
    }
    root.innerHTML = route.render(user);
    route.initialize(user);
  }

  return {
    start() {
      window.addEventListener('hashchange', navigate);
      root.addEventListener('click', async (event) => {
        if (event.target.id !== 'logout-button') return;
        event.target.disabled = true;
        try {
          await logout();
          window.location.hash = '#/login';
        } catch (error) {
          event.target.disabled = false;
          event.target.textContent = `Error: ${error.message}`;
        }
      });
      navigate();
    }
  };
}

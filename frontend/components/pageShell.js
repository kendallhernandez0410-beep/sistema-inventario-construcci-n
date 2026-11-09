import { renderFooter } from './footer.js';
import { renderHeader } from './header.js';

export function renderPageShell(content, activePath, user = null) {
  return `${renderHeader(activePath, user)}<main class="page">${content}${renderFooter()}</main>`;
}

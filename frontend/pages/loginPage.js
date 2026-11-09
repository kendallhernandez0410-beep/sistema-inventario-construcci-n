import { renderLoginForm } from '../components/loginForm.js';
import { renderPageShell } from '../components/pageShell.js';
import { login } from '../services/api.js';

export function renderLoginPage() {
  return renderPageShell(renderLoginForm(), '#/login');
}

export function initializeLoginPage() {
  const form = document.getElementById('login-form');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const button = form.querySelector('button[type="submit"]');
    const message = document.getElementById('login-message');
    const formData = new FormData(form);

    button.disabled = true;
    message.textContent = '';
    message.className = 'form-message';
    try {
      await login({
        email: formData.get('email'),
        password: formData.get('password')
      });
      window.location.hash = '#/';
    } catch (error) {
      message.textContent = error.message;
      message.className = 'form-message error';
    } finally {
      button.disabled = false;
    }
  });
}

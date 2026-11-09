export function renderLoginForm() {
  return `
    <section class="login-layout">
      <div class="login-brand-panel">
        <p class="eyebrow">CONSTRUCTORA DEL VALLE S.A.</p>
        <h1>Control de inventario, claro y seguro.</h1>
        <p>Administra existencias, movimientos y alertas de reposición desde un solo lugar.</p>
        <div class="login-decoration" aria-hidden="true">
          <span></span><span></span><span></span><span></span><span></span>
        </div>
      </div>
      <section class="panel login-panel" aria-labelledby="login-title">
        <span class="icon-badge login-icon" aria-hidden="true">DV</span>
        <p class="eyebrow">BIENVENIDO</p>
        <h2 id="login-title">Iniciar sesión</h2>
        <p class="login-description">Ingresa tus credenciales para continuar.</p>
        <form id="login-form" class="login-form">
          <label for="login-email">Correo electrónico</label>
          <input id="login-email" name="email" type="email" autocomplete="username" maxlength="254" placeholder="nombre@empresa.com" required>
          <label for="login-password">Contraseña</label>
          <input id="login-password" name="password" type="password" autocomplete="current-password" required>
          <button class="button button-primary submit-button" type="submit">Entrar <span aria-hidden="true">→</span></button>
          <p id="login-message" class="form-message" role="status" aria-live="polite"></p>
        </form>
        <p class="login-security"><span class="status-dot"></span> Conexión protegida · Sesión con vencimiento</p>
      </section>
    </section>
  `;
}

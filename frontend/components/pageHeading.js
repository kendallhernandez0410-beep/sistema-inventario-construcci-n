export function renderPageHeading({ eyebrow, title, subtitle, action = '' }) {
  return `
    <section class="hero">
      <div>
        <p class="eyebrow">${eyebrow}</p>
        <h1>${title}</h1>
        <p class="subtitle">${subtitle}</p>
      </div>
      ${action}
    </section>
  `;
}

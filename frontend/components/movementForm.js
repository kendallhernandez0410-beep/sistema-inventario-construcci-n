import { escapeHtml } from './utils.js';

export function renderMovementForm(materials) {
  const options = materials.map((material) =>
    `<option value="${material.id}">${escapeHtml(material.nombre)} (${escapeHtml(material.unidad)})</option>`
  ).join('');

  return `
    <aside class="panel movement-panel">
      <div class="panel-heading">
        <div>
          <p class="eyebrow">REGISTRO</p>
          <h2>Nuevo movimiento</h2>
        </div>
        <span class="icon-badge" aria-hidden="true">↕</span>
      </div>
      <form id="movement-form">
        <label for="material-select">Material</label>
        <select id="material-select" name="material_id" required>${options}</select>

        <div class="form-row">
          <div>
            <label for="movement-type">Tipo</label>
            <select id="movement-type" name="tipo" required>
              <option value="ENTRADA">Entrada</option>
              <option value="SALIDA">Salida</option>
            </select>
          </div>
          <div>
            <label for="quantity">Cantidad</label>
            <input id="quantity" name="cantidad" type="number" min="0.01" step="0.01" required>
          </div>
        </div>

        <label for="reference">Referencia documental</label>
        <input id="reference" name="referencia" type="text" maxlength="120" placeholder="OC, recepción o vale" required>

        <label for="responsible">Responsable</label>
        <input id="responsible" name="responsable" type="text" maxlength="100" placeholder="Nombre de quien registra" required>

        <label for="notes">Observaciones <span class="optional">(opcional)</span></label>
        <textarea id="notes" name="observaciones" rows="2" maxlength="500" placeholder="Detalle de la recepción o salida"></textarea>

        <button class="button button-primary submit-button" type="submit">Guardar movimiento <span aria-hidden="true">→</span></button>
        <p id="form-message" class="form-message" role="status" aria-live="polite"></p>
      </form>
    </aside>
  `;
}

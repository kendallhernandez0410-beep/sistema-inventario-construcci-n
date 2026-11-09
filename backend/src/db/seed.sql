INSERT INTO proveedores (nombre) VALUES
  ('Novex'),
  ('Construplaza'),
  ('EPA');

INSERT INTO materiales
  (sku, nombre, categoria, subcategoria, unidad, stock_actual,
   demanda_promedio, demanda_maxima, plazo_entrega_dias)
VALUES
  ('CON-CEM-GRIS-50KG', 'Cemento gris 50 kg', 'Construccion', 'Cemento', 'saco', 115, 20, 28, 5),
  ('EST-VAR-03-6M', 'Varilla corrugada #3, 6 m', 'Estructura', 'Acero de refuerzo', 'unidad', 130, 12, 18, 7),
  ('MAM-BLO-15', 'Block de concreto 15 cm', 'Mamposteria', 'Block', 'unidad', 280, 80, 100, 3),
  ('AGR-ARE-M3', 'Arena para construccion', 'Agregados', 'Arena', 'm3', 50, 8, 12, 4);

INSERT INTO ordenes_compra
  (numero_orden, proveedor_id, material_id, cantidad, precio_unitario, fecha_orden, estado, contrato_aplicable, observaciones)
VALUES
  ('OC-2026-1001', 1, 1, 100, 6500, '2026-10-03', 'RECIBIDA', 0, 'Linea ERP de ejemplo; precio sobre referencia contractual.'),
  ('OC-2026-1002', 1, 1, 100, 6500, '2026-10-05', 'RECIBIDA', 0, 'Coincide con OC-2026-1001; revisar si fue compra duplicada.'),
  ('OC-2026-1003', 2, 1, 120, 6300, '2026-10-10', 'RECIBIDA', 1, 'Precio contractual de referencia.'),
  ('OC-2026-1004', 3, 1, 80, 6700, '2026-10-22', 'RECIBIDA', 0, 'Linea ERP de ejemplo; precio sobre referencia contractual.'),
  ('OC-2026-1005', 1, 2, 200, 2200, '2026-10-08', 'RECIBIDA', 0, 'Linea ERP de ejemplo; precio sobre referencia contractual.'),
  ('OC-2026-1006', 1, 2, 200, 2200, '2026-10-10', 'RECIBIDA', 0, 'Coincide con OC-2026-1005; revisar si fue compra duplicada.'),
  ('OC-2026-1007', 2, 2, 150, 2050, '2026-10-17', 'RECIBIDA', 1, 'Precio contractual de referencia.'),
  ('OC-2026-1008', 3, 2, 100, 2150, '2026-10-26', 'RECIBIDA', 0, 'Linea ERP de ejemplo; precio sobre referencia contractual.');

INSERT INTO movimientos
  (material_id, tipo, cantidad, stock_resultante, fecha_movimiento, referencia, responsable, observaciones)
VALUES
  (1, 'ENTRADA', 115, 115, '2026-10-31T08:00:00.000Z', 'INV-INICIAL-2026-10', 'Sistema', 'Saldo de inventario inicial del caso didactico.'),
  (2, 'ENTRADA', 130, 130, '2026-10-31T08:00:00.000Z', 'INV-INICIAL-2026-10', 'Sistema', 'Saldo de inventario inicial del caso didactico.'),
  (3, 'ENTRADA', 280, 280, '2026-10-31T08:00:00.000Z', 'INV-INICIAL-2026-10', 'Sistema', 'Saldo de inventario inicial del caso didactico.'),
  (4, 'ENTRADA', 50, 50, '2026-10-31T08:00:00.000Z', 'INV-INICIAL-2026-10', 'Sistema', 'Saldo de inventario inicial del caso didactico.');

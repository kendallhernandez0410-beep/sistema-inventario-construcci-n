# Quiz #2 · Gestión de Inventarios
## Constructora Del Valle S.A. — Opción 2, Camino 2

> **Alcance y uso académico:** no se proporcionó el enunciado original ni las tablas con datos de la Parte A. Para entregar un ejemplo completo y reproducible se construyó el caso didáctico documentado en este informe y en `backend/src/db/seed.sql`. Las cifras, fechas, cotizaciones, umbrales y calificaciones siguientes son supuestos de trabajo; deben sustituirse si el curso entregó valores distintos. No deben presentarse como datos reales de la empresa ni como datos del enunciado original.

## Resumen ejecutivo

El caso muestra compras de cemento y varilla durante octubre de 2026 con dos pares que cumplen la regla de duplicidad sospechosa. Frente a los precios contractuales indicados, el sobreprecio del conjunto es ₡142.000. Si se confirma que la segunda orden de cada par fue innecesaria y se compara con una compra optimizada a precio contractual, la fuga potencial modelada asciende a ₡1.182.000 en octubre y ₡14.184.000 en una proyección lineal de doce meses. La clasificación homogénea, la aprobación acumulada y el registro de movimientos permiten atacar esas causas desde compras y bodega.

---

## A1. Circuito de compra y aprobación

### A1.a Circuito completo

```text
[1. Identificar necesidad]
Solicita: residente de obra / encargado de bodega
Documento: requisición numerada (material, SKU, cantidad, obra, fecha requerida)
Control: existencia disponible, consumo previsto, presupuesto y punto de reorden
       |
       v
[2. Revisar y aprobar requisición]
Ejecuta: jefatura de obra + responsable presupuestario; niveles superiores según monto
Documento: requisición aprobada con usuario, fecha, monto agregado y centro de costo
Control: segregación de funciones, fondos disponibles y acumulación anti-fraccionamiento
       |
       v
[3. Cotizar y emitir orden de compra (OC)]
Ejecuta: compras; aprobador independiente autoriza la OC
Documento: comparativo de cotizaciones y OC numerada al proveedor
Control: contrato/lista de precios, proveedor habilitado, SKU/unidad/precio/entrega;
        ninguna OC se divide para evitar el nivel de aprobación
       |
       v
[4. Recibir materiales]
Ejecuta: bodega/inspector que no creó ni aprobó la OC
Documento: recepción/acta de entrada vinculada a OC y comprobante de entrega
Control: conteo/medición, inspección de calidad, tolerancias y registro de diferencias;
        actualizar stock solo por cantidad recibida y aceptada
       |
       v
[5. Recibir y validar factura]
Ejecuta: cuentas por pagar
Documento: factura registrada con referencia a OC y recepción
Control: THREE-WAY MATCH: OC aprobada ↔ recepción aceptada ↔ factura;
        comparar proveedor, SKU, cantidades, precios, impuestos y términos.
        Bloquear diferencias no justificadas; no pagar cantidades no recibidas.
       |
       v
[6. Autorizar y ejecutar pago]
Ejecuta: tesorería; aprobación de pago separada del registro de factura
Documento: lote/transferencia de pago y comprobante contable
Control: factura aprobada y no pagada antes, vencimiento, beneficiario validado,
        doble autorización bancaria y conciliación posterior
```

La evidencia de cada etapa debe conservar el mismo identificador de requisición/OC y permitir reconstruir quién solicitó, autorizó, recibió, registró y pagó. El three-way match no sustituye la inspección física: concilia los documentos, mientras bodega confirma que el material y su calidad existen.

### A1.b Análisis crítico y matriz recomendada

No se recibió la matriz propuesta en el cuestionario, de modo que no es posible calificar sus umbrales concretos. Como alternativa para el caso didáctico se recomienda esta matriz de **compromiso total agregado**, antes de impuestos:

| Monto agregado de la necesidad | Aprobaciones mínimas | Evidencia adicional |
|---|---|---|
| Hasta ₡250.000 | Jefatura de obra y responsable de presupuesto | Requisición aprobada y validación de stock |
| ₡250.001–₡1.000.000 | Jefatura de compras y responsable de presupuesto | Dos cotizaciones comparables o justificación documentada de proveedor único |
| ₡1.000.001–₡5.000.000 | Gerencia financiera y gerencia de operaciones | Tres cotizaciones, análisis de contrato/precio y revisión de compras |
| Más de ₡5.000.000 | Gerencia general y comité/autoridad delegada | Expediente de licitación, evaluación y acta de aprobación |

Estos montos son **umbrales ilustrativos**, sujetos al tamaño y política real de la compañía. La matriz debe indicar suplencias, límites de delegación y tratamiento de emergencias; el solicitante nunca se aprueba a sí mismo.

**Riesgo de fraccionamiento (split purchases):** quien necesita una compra de ₡1.200.000 podría solicitar, deliberada o accidentalmente, cinco órdenes de ₡240.000 para quedar debajo del primer umbral. Si el control evalúa cada OC en aislamiento, elude la aprobación de nivel superior, reduce la competencia entre proveedores, dificulta detectar colusión o sobreprecios y fragmenta el rastro presupuestario. También puede producir entregas parciales sin coordinación y pagos repetidos.

**Reglas anti-fraccionamiento que complementan la matriz:**

1. Evaluar el monto de la necesidad completa por proyecto/centro de costo, no cada requisición u OC separada.
2. Agregar solicitudes del mismo proyecto, categoría/SKU y proveedor dentro de una ventana móvil de 30 días; usar el total para determinar el aprobador y la competencia requerida.
3. El sistema debe señalar solicitudes consecutivas cercanas al umbral, órdenes repetidas o entregas sucesivas; bloquear la emisión automática hasta documentar una excepción.
4. Exigir motivo y aprobación de nivel superior para dividir entregas por logística, fases de obra o límites de almacenamiento. La separación operativa puede mantenerse, pero se aprueba por el valor total.
5. Revisar mensualmente acumulados por solicitante, proveedor, obra y categoría; auditar excepciones, anulaciones y órdenes creadas después de la recepción.

---

## A2. Taxonomía, SKU y consolidación de compras

### A2.a–b Ocho líneas normalizadas

Los SKU identifican el insumo, no cada orden ni proveedor. Por ello, las cuatro líneas de cemento comparten SKU y las cuatro de varilla comparten otro.

| Línea / OC | Categoría > Subcategoría | Insumo normalizado | SKU | Proveedor | Fecha | Cantidad | Precio unitario |
|---|---|---|---|---|---|---:|---:|
| 1 / OC-2026-1001 | Construcción > Cemento | Cemento gris 50 kg | CON-CEM-GRIS-50KG | Novex | 03-oct-2026 | 100 sacos | ₡6.500 |
| 2 / OC-2026-1002 | Construcción > Cemento | Cemento gris 50 kg | CON-CEM-GRIS-50KG | Novex | 05-oct-2026 | 100 sacos | ₡6.500 |
| 3 / OC-2026-1003 | Construcción > Cemento | Cemento gris 50 kg | CON-CEM-GRIS-50KG | Construplaza | 10-oct-2026 | 120 sacos | ₡6.300 |
| 4 / OC-2026-1004 | Construcción > Cemento | Cemento gris 50 kg | CON-CEM-GRIS-50KG | EPA | 22-oct-2026 | 80 sacos | ₡6.700 |
| 5 / OC-2026-1005 | Estructura > Acero de refuerzo | Varilla corrugada #3, 6 m | EST-VAR-03-6M | Novex | 08-oct-2026 | 200 unidades | ₡2.200 |
| 6 / OC-2026-1006 | Estructura > Acero de refuerzo | Varilla corrugada #3, 6 m | EST-VAR-03-6M | Novex | 10-oct-2026 | 200 unidades | ₡2.200 |
| 7 / OC-2026-1007 | Estructura > Acero de refuerzo | Varilla corrugada #3, 6 m | EST-VAR-03-6M | Construplaza | 17-oct-2026 | 150 unidades | ₡2.050 |
| 8 / OC-2026-1008 | Estructura > Acero de refuerzo | Varilla corrugada #3, 6 m | EST-VAR-03-6M | EPA | 26-oct-2026 | 100 unidades | ₡2.150 |

**Mismo insumo:** líneas 1–4 son el mismo cemento gris en saco de 50 kg; líneas 5–8 son la misma varilla corrugada #3 de 6 m. La unidad, especificación y SKU deben coincidir antes de comparar precios.

### A2.c Ahorro posible al precio mínimo observado

Fórmula para cada insumo:

`Ahorro = Σ cantidad_i × (precio_observado_i − menor_precio_del_SKU)`

- **Cemento:** menor precio = ₡6.300/saco; cantidad total = 100 + 100 + 120 + 80 = 400 sacos.  
  `100×(6.500−6.300) + 100×(6.500−6.300) + 120×(6.300−6.300) + 80×(6.700−6.300)`  
  `= ₡20.000 + ₡20.000 + ₡0 + ₡32.000 = ₡72.000`.
- **Varilla #3:** menor precio = ₡2.050/unidad; cantidad total = 200 + 200 + 150 + 100 = 650 unidades.  
  `200×(2.200−2.050) + 200×(2.200−2.050) + 150×(2.050−2.050) + 100×(2.150−2.050)`  
  `= ₡30.000 + ₡30.000 + ₡0 + ₡10.000 = ₡70.000`.
- **Ahorro potencial total: ₡72.000 + ₡70.000 = ₡142.000.**

Es un ahorro teórico suponiendo especificación, calidad, transporte, impuestos, disponibilidad y condiciones de crédito equivalentes. No demuestra que un proveedor pueda surtir todo el volumen al precio mínimo.

### A2.d Por qué importa la clasificación

Sin una clasificación consistente no se reconoce que descripciones como “cemento gris 50 kg”, “cemento 50kg” y abreviaturas de bodega representan el mismo insumo; por tanto, el ERP divide artificialmente cantidades entre códigos y proveedores, distorsiona el gasto por categoría y oculta el volumen realmente negociable. El SKU normalizado convierte requisiciones, órdenes, recepciones y facturas en una base comparable por especificación y unidad. Compras puede entonces consolidar demanda, solicitar cotizaciones equivalentes, negociar descuentos por volumen, medir cumplimiento contractual y detectar duplicados o precios atípicos. Agrupar productos solo por nombre sería insuficiente: cementos de diferente resistencia o varillas de diferente diámetro no son sustitutos.

---

## A3. Duplicados y fuga de valor

### A3.a Regla de detección

Se señala un par como **posible duplicado** si tiene simultáneamente el mismo proveedor, el mismo SKU, la misma cantidad y fechas de orden separadas por un máximo de 7 días calendario. La regla es una alerta para revisión: no prueba por sí sola que la compra sea improcedente; podrían existir entregas para obras diferentes. El algoritmo del proyecto excluye órdenes anuladas.

| Par sospechoso | Coincidencia | Días | Exposición de ambas órdenes |
|---|---|---:|---:|
| OC-2026-1001 / OC-2026-1002 | Novex; CON-CEM-GRIS-50KG; 100 sacos cada una | 2 | ₡1.300.000 |
| OC-2026-1005 / OC-2026-1006 | Novex; EST-VAR-03-6M; 200 unidades cada una | 2 | ₡880.000 |

Para estimar la fuga, solo se considera redundante la **segunda** orden de cada par. Las primeras órdenes quedan como necesidad base, pendiente de verificar su uso y recepción.

### A3.b Precio contractual y gasto fuera de contrato

Referencia asumida: cemento ₡6.300/saco y varilla #3 ₡2.050/unidad.

| SKU / grupo | Unidades | Precio contractual | Precio pagado | Prima |
|---|---:|---:|---:|---:|
| Cemento: línea 1 | 100 | ₡6.300 | ₡6.500 | ₡20.000 |
| Cemento: línea 2 | 100 | ₡6.300 | ₡6.500 | ₡20.000 |
| Cemento: línea 3 | 120 | ₡6.300 | ₡6.300 | ₡0 |
| Cemento: línea 4 | 80 | ₡6.300 | ₡6.700 | ₡32.000 |
| **Cemento total** | **400** |  |  | **₡72.000** |
| Varilla: línea 5 | 200 | ₡2.050 | ₡2.200 | ₡30.000 |
| Varilla: línea 6 | 200 | ₡2.050 | ₡2.200 | ₡30.000 |
| Varilla: línea 7 | 150 | ₡2.050 | ₡2.050 | ₡0 |
| Varilla: línea 8 | 100 | ₡2.050 | ₡2.150 | ₡10.000 |
| **Varilla total** | **650** |  |  | **₡70.000** |

Las líneas a precio mayor son gasto fuera de la tarifa contractual asumida: el diferencial de precio es ₡142.000 en total. Antes de llamarlo incumplimiento, finanzas debe confirmar vigencia, proveedor autorizado, transporte, impuestos y condiciones de la tarifa.

### A3.c Cuantificación y proyección

**Gasto real de octubre (8 órdenes):**

- Cemento: `100×6.500 + 100×6.500 + 120×6.300 + 80×6.700 = ₡2.592.000`.
- Varilla: `200×2.200 + 200×2.200 + 150×2.050 + 100×2.150 = ₡1.402.500`.
- Total: `₡2.592.000 + ₡1.402.500 = ₡3.994.500`.

**Base contractual para las 1.050 unidades ordenadas:** `400×₡6.300 + 650×₡2.050 = ₡3.852.500`. La variación de precio es `₡3.994.500 − ₡3.852.500 = ₡142.000`.

**Fuga potencial suponiendo innecesarias las segundas órdenes de los dos pares:**

- Unidades redundantes a tarifa contractual: `100×₡6.300 + 200×₡2.050 = ₡1.040.000`.
- Sobreprecio de las órdenes no redundantes retenidas: `(100×₡200 + 80×₡400) + (200×₡150 + 100×₡100) = ₡92.000`.
- **Fuga potencial del mes: ₡1.040.000 + ₡50.000 de prima de las órdenes duplicadas + ₡92.000 de primas no duplicadas = ₡1.182.000.**
- **Proyección anual lineal: ₡1.182.000 × 12 = ₡14.184.000.**

La proyección no es un pronóstico: supone que un mes atípico se repite doce veces, que todas las segundas órdenes eran evitables y que el volumen, precio y mezcla no cambian. La pérdida confirmada requiere cotejar requisiciones, recepción física, facturas, devoluciones, consumo de obra y notas de crédito.

### A3.d Controles preventivos

1. **Control de proceso:** requisición única por necesidad y obra, con consolidación de necesidades conocidas; doble aprobación del valor total aunque la entrega se programe en varias etapas.
2. **Control de sistema:** regla de alerta/bloqueo por mismo proveedor + SKU + cantidad dentro de 7 días, y validación de acumulado por categoría/proyecto durante 30 días. Excepciones requieren motivo y aprobador independiente.
3. **Control de pago y análisis:** three-way match obligatorio, verificación de tarifa vigente y reporte mensual de precios fuera de contrato, pares duplicados y facturas repetidas antes de liberar pagos.

---

## A4. Evaluación ponderada de proveedores

Notas ilustrativas de 1 (deficiente) a 5 (sobresaliente); no son calificaciones ni cotizaciones reales.

| Criterio | Peso | Novex | Novex ponderado | Construplaza | Construplaza ponderado | EPA | EPA ponderado |
|---|---:|---:|---:|---:|---:|---:|---:|
| Precio total puesto en obra | 25% | 3 | 75 | 5 | 125 | 4 | 100 |
| Calidad / cumplimiento de especificación | 20% | 5 | 100 | 4 | 80 | 4 | 80 |
| Entrega puntual | 20% | 4 | 80 | 4 | 80 | 5 | 100 |
| Disponibilidad / cobertura | 15% | 4 | 60 | 5 | 75 | 4 | 60 |
| Condiciones de pago | 10% | 4 | 40 | 3 | 30 | 4 | 40 |
| Servicio y gestión de reclamos | 10% | 4 | 40 | 4 | 40 | 5 | 50 |
| **Total** | **100%** |  | **395/500 = 79/100** |  | **430/500 = 86/100** |  | **430/500 = 86/100** |

**Fórmula:** `Puntaje final sobre 100 = Σ (peso porcentual × nota de 1–5) ÷ 5`. Ejemplo Construplaza: `(25×5 + 20×4 + 20×4 + 15×5 + 10×3 + 10×4) ÷ 5 = 86`.

**Recomendación estratégica: modelo dual.** Construplaza y EPA empatan en este ejercicio, pero destacan en atributos distintos; conviene homologar ambos y asignar volumen base por precio/contrato con una participación de respaldo condicionada a métricas de calidad y entrega. El dual sourcing reduce dependencia, riesgo de quiebre y exposición ante indisponibilidad, y mantiene competencia. Consolidar el 100% en un solo proveedor simplifica administración, pero eleva el riesgo de concentración y solo se justifica tras validar capacidad, tiempos, precio puesto en obra, condiciones de crédito y desempeño sostenido. Novex queda como alternativa sujeta a negociar su precio y a demostrar ventaja de servicio/calidad.

---

## A5. Reposición y trazabilidad

### A5.a Cálculo de stock de seguridad y punto de reorden

Se toma `d` como demanda promedio diaria, demanda máxima diaria y plazo de entrega en días.  
`SS = (demanda máxima − demanda promedio) × L`  
`PR = d × L + SS`

| Material | d promedio/día | Máxima/día | L (días) | SS | PR | Stock actual | Decisión |
|---|---:|---:|---:|---:|---:|---:|---|
| Cemento gris 50 kg | 20 sacos | 28 sacos | 5 | `(28−20)×5 = 40` sacos | `20×5+40 = 140` sacos | 115 | Reponer; faltan 25 para PR |
| Varilla #3, 6 m | 12 unidades | 18 unidades | 7 | `(18−12)×7 = 42` unidades | `12×7+42 = 126` unidades | 130 | No reponer aún; margen 4 |
| Block 15 cm | 80 unidades | 100 unidades | 3 | `(100−80)×3 = 60` unidades | `80×3+60 = 300` unidades | 280 | Reponer; faltan 20 para PR |
| Arena | 8 m³ | 12 m³ | 4 | `(12−8)×4 = 16` m³ | `8×4+16 = 48` m³ | 50 | No reponer aún; margen 2 |

### A5.b Reposición de hoy y prioridad

Se debe iniciar hoy la reposición de **block** y **cemento**, porque ambos están bajo su PR. Prioridad: **1) block**, **2) cemento**. Con demanda máxima, la cobertura de block es `280÷100 = 2,8 días`, menor que su plazo de entrega de 3 días; está más próximo a agotarse antes de recibir. Cemento cubre `115÷28 ≈ 4,11 días` frente a 5 días de entrega. Las cantidades mínimas indicadas arriba solo llevan al PR; la cantidad de compra real debe sumar consumo durante el ciclo de revisión, tamaño de lote, recepción pendiente y restricciones de transporte. Varilla y arena deben vigilarse: sus márgenes de 4 unidades y 2 m³ son pequeños.

### A5.c Datos mínimos de movimientos y trazabilidad

El diseño de `movimientos` registra cada cambio como evento inmutable y mantiene el saldo actual del material. Atributos mínimos:

| Atributo | Requisito / propósito |
|---|---|
| `id` | Identificador único, generado por la base |
| `material_id` / SKU | Llave foránea a un material inequívoco |
| `tipo` | Entrada o salida; catálogo controlado |
| `cantidad` y `unidad` | Cantidad positiva; unidad heredada del material |
| `fecha_movimiento` | Fecha/hora del evento, no solo fecha de captura |
| `referencia` | Requisición, OC, recepción, factura, obra o vale que origina el movimiento |
| `responsable` | Usuario que registra; en producción debe ser identidad autenticada |
| `stock_resultante` | Saldo resultante para auditoría y conciliación |
| `observaciones` | Motivo, lote, calidad, devolución o explicación de excepción |
| `creado_en` | Sello técnico de captura |

Para control completo, las referencias documentales deben enlazarse a requisición/OC/recepción/factura; agregar lote/serie y ubicación cuando sean aplicables; restringir ajustes a un flujo autorizado y conservar quién/cómo/cuándo. El proyecto didáctico exige referencia y responsable, valida cantidades y actualiza stock y movimiento en una transacción SQLite para evitar saldos parciales.

---

## Correspondencia con el proyecto

- Catálogo, stock, demanda, plazo y SKU: `backend/src/db/seed.sql`, tablas `materiales` y `proveedores`.
- Órdenes de octubre: tabla `ordenes_compra`; la regla de sospecha está implementada en `backend/src/services/duplicados.js`.
- PR/SS y alerta dinámica: `backend/src/services/reorden.js`.
- Alta de movimientos con registro y saldo en una transacción: `backend/src/routes/movimientos.js`.
- Usuarios, sesiones y catálogo relacional: `backend/src/db/schema.sql`; el inicio de sesión usa hash scrypt y sesiones SQLite desde `backend/src/controllers/authController.js`.
- Página de operación: `frontend/index.html`.

El proyecto incluye inicio de sesión demostrativo con rol de administrador, pero no es un sistema listo para producción. Antes de uso real requiere gestión de usuarios/roles, recuperación y rotación de credenciales, controles contra intentos automatizados, bitácora protegida, respaldos, pruebas de aceptación, políticas de retención, gestión de concurrencia y revisión de seguridad.

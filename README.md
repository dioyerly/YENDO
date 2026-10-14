# Soluciones para tu Hogar · Documentación Maestra del Marketplace

> **Versión**: 2.0 (Producción / Arquitectura Completa)  
> **Ámbito**: América Latina (Español Latinoamericano)  
> **Enfoque**: Servicios de Oficio y Mantenimiento Residencial (Urgencias 24hs y Proyectos Planificados)  
> **Frontend**: React 19, TypeScript, Tailwind CSS v4, Vite, Lucide Icons

---

## 1. Resumen Ejecutivo y Modelo de Negocio

**Soluciones para tu Hogar** es una plataforma web responsive diseñada para conectar a propietarios e inquilinos que necesitan resolver emergencias o mejoras en el hogar con trabajadores independientes calificados y empresas de servicios.

### Principio Fundamental de Libre Búsqueda (Sin Fricción)
A diferencia de los directorios tradicionales donde el cliente está obligado a publicar una solicitud y esperar presupuestos dispersos, en **Soluciones para tu Hogar el cliente tiene el control**:
1. Entra a la aplicación y busca lo que necesita (ej: *"me quedé afuera"*, *"pérdida de agua"*, *"pintura de departamento"*).
2. Compara perfiles verificados con fotos de trabajos, disponibilidad en tiempo real (*disponible ahora, turnos hoy, con cita*), zonas de atención, tarifas orientativas y opiniones reales.
3. Elige a quién contactar e inicia la conversación en 1 clic.

---

## 2. Arquitectura de Roles y Seguridad

La aplicación implementa una separación estricta entre la experiencia del usuario (Cliente y Profesional) y el centro de control (Administración).

### 2.1. Rol Cliente (`client`)
- **Búsqueda & Comparación**: Acceso inmediato a categorías y filtros por urgencia, horario, canal y cercanía.
- **Contacto Registrado**: Selección de canal (Chat interno, WhatsApp, Llamada, Email) con registro formal del evento.
- **Ficha de Seguimiento**: Visualización y confirmación de los 12 hitos de servicio.
- **Cierre y Calificación**: Confirmación del importe pagado y publicación de reseñas con sello de *Trabajo Verificado en la App*.

### 2.2. Rol Profesional o Empresa (`pro`)
- **Registro Seguro con Identidad (DNI)**: Obligatoriedad de cargar foto de perfil y fotografía/escaneo del Documento Nacional de Identidad (DNI) para verificación de identidad antes de atender domicilios.
- **Panel Operativo (Pipeline)**: Gestión de solicitudes entrantes, coordinación de visitas, estados "En camino", "Llegué al domicilio", "Trabajo iniciado" y "Trabajo terminado".
- **Liquidación & Comisiones**: Declaración del monto final cobrado, cálculo transparente del porcentaje de comisión de la plataforma y descarga del resumen mensual en texto/CSV.

### 2.3. Rol Administradora (`admin` - Backoffice Independiente)
- **Acceso Protegido**: Pasarela de acceso administrativa con autenticación y clave PIN de seguridad (`admin123` / `1234`).
- **Control KYC / Validación de DNI**: Cola de inspección de documentos de identidad de nuevos prestadores para otorgar la insignia de *Identidad Verificada* o rechazar con nota de subsanación.
- **Centro de Mediación y Controversias**: Detección y resolución de servicios en estado `under_review` cuando existe discrepancia entre lo informado por el profesional y el cliente.
- **Configuración de Comisiones**: Ajuste dinámico del porcentaje de comisión del marketplace (ej: 5% por defecto).
- **Exportación de Informes**: Descarga de archivos CSV con el historial de órdenes, montos y liquidaciones impositivas.

---

## 3. El Ciclo de Vida del Servicio: Los 12 Hitos con Verificación Cruzada

El corazón operativo de la aplicación es la **Ficha de Seguimiento Compartida**. Para garantizar transparencia y prevenir fraudes, ningún hito se da por cerrado si solo una de las partes lo afirma. La interfaz documenta quién marcó cada paso y la fecha/hora exacta:

| # | Hito | Descripción | Confirmación Requerida |
|---|---|---|---|
| **1** | **Contacto iniciado** | Se registra la apertura de la solicitud desde la app. | Automático por la app |
| **2** | **Profesional respondió** | El prestador atiende el mensaje o la llamada. | Profesional o Cliente |
| **3** | **Trabajo aceptado** | Ambas partes acuerdan realizar la prestación. | Verificación mutua |
| **4** | **Precio estimado acordado** | Presupuesto orientativo informado en la ficha. | Profesional / Cliente |
| **5** | **Visita coordinada** | Fecha y franja horaria agendada. | Profesional y Cliente |
| **6** | **Profesional en camino** | Notificación opcional de viaje hacia el domicilio. | Profesional |
| **7** | **Profesional llegó** | Presencia física verificada en el inmueble. | Cliente / Profesional |
| **8** | **Trabajo iniciado** | Comienzo de la obra o reparación física. | Profesional / Cliente |
| **9** | **Trabajo terminado** | Conclusión material de las tareas. | Profesional y Cliente |
| **10** | **Pago informado** | Declaración de importe final y medio de pago. | Declarado por ambas partes |
| **11** | **Cliente confirma resultado** | Conformidad con el estado final de la vivienda. | Cliente |
| **12** | **Cierre o Revisión** | Si coinciden los montos: `closed_pending_commission`. Si difieren: `under_review`. | Sistema / Admin |

---

## 4. Política de Canales Externos (WhatsApp, Llamadas y Email)

La plataforma permite a los profesionales ofrecer WhatsApp, llamadas telefónicas o correo electrónico según su preferencia de trabajo. No obstante, por diseño y respeto a la privacidad:
- **No se inventan integraciones falsas**: La aplicación aclara que no intercepta llamadas ni lee chats privados de WhatsApp externos.
- **Auditoría previa**: Antes de abrir el enlace externo (`wa.me`, `tel:`, `mailto:`), la app guarda el evento de contacto en la base de datos con fecha, hora, usuario, profesional y servicio.
- **Confirmación manual posterior**: Se le solicita a ambos usuarios informar si hubo respuesta y si se acordó la realización del trabajo.

---

## 5. Aspectos Legales, Regulatorios y de Cumplimiento (Compliance Checklist)

Para operar este marketplace en producción formal evitando contingencias civiles, comerciales, laborales o impositivas, se debe implementar el siguiente marco legal:

### 5.1. Términos y Condiciones (T&C) y Rol de Intermediación Tecnológica
1. **Naturaleza del Servicio**: Aclarar de manera indubitable que la plataforma actúa exclusivamente como **canal de intermediación y contacto tecnológico** entre partes independientes.
2. **Ausencia de Relación Laboral**: Los profesionales no son empleados, agentes ni dependientes de la plataforma; actúan con autonomía técnica, económica y organizativa.
3. **Deslinde por Daños Materiales**: Establecer que la calidad, idoneidad técnica y garantía de los trabajos prestados corresponden única y exclusivamente al profesional contratado. Se recomienda exigir seguro de responsabilidad civil o accidentes personales para trabajos de altura/gasistas.

### 5.2. Protección de Datos Personales (Habeas Data)
- **Legislación Aplicable**: Ley 25.326 (Argentina), LGPD (Brasil), Ley 1581 (Colombia), GDPR (si aplica a residentes extranjeros).
- **Enmascaramiento de Datos**: Los teléfonos, correos y domicilios exactos nunca deben ser públicos en el catálogo; solo se habilitan tras tocar "Contactar".
- **Custodia de Documentos de Identidad (DNI)**: La carga del DNI para verificación KYC debe contar con **consentimiento expreso informado**. Los archivos deben almacenarse en buckets privados (ej: Google Cloud Storage con URLs firmadas temporales) y destruirse o archivarse encriptados bajo AES-256.

### 5.3. Modelo de Comisiones y Régimen Tributario
- **Hecho Generador**: La comisión del marketplace (ej: 5%) solo se devenga cuando el servicio fue prestado y pagado efectivamente según confirmación de ambas partes.
- **No Retención de Fondos**: La plataforma aclara explícitamente que no retiene dinero de los clientes ni efectúa débitos bancarios automáticos no autorizados.
- **Emisión de Comprobantes Fiscales**: La plataforma debe emitir factura legal (Factura B/A en Argentina, CFDI en México, etc.) al profesional por el servicio de intermediación digital sobre el valor de la comisión recaudada.

### 5.4. Deslinde sobre Comprobantes de Pago
- El texto legal y las pantallas deben incluir la cláusula de descargo: *"La carga de un número de comprobante o fotografía de transferencia no constituye acreditación bancaria automática por parte de la plataforma. Cada parte es responsable de verificar en su entidad financiera o billetera virtual la acreditación efectiva de los fondos."*

---

## 6. Hoja de Ruta para Integraciones de Pago y Escala (Roadmap)

Para pasar a una fase de procesamiento transaccional automatizado:
1. **Mercado Pago Marketplace / Split Payments**:
   - Integrar OAuth de Mercado Pago para que cada profesional conecte su cuenta receptora (`collector`).
   - El cliente abona el servicio en un único checkout y la pasarela divide los fondos automáticamente: el 95% va a la cuenta del prestador y el 5% ingresa como `marketplace_fee` a la cuenta de la plataforma.
2. **Notificaciones Push y WhatsApp Business API**:
   - Notificaciones webhook para avisar al cliente cuando el profesional marcó *"Voy en camino"* o *"Trabajo finalizado"*.
3. **Geolocalización Automática (Google Maps API)**:
   - Cálculo dinámico de distancia en kilómetros entre el profesional y la dirección del cliente.

---

## 7. Instrucciones para la Ejecución Local y Desarrollo

### Requisitos
- Node.js 18+
- npm 9+

### Instalación y Ejecución
```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar el servidor de desarrollo en puerto 3000
npm run dev

# 3. Compilación y verificación de tipos TypeScript
npm run build
```

### Accesos Directos de Prueba
- **Cliente**: Lucía Fernández (`lucia.fernandez@example.com` / Clave: `123456`)
- **Profesional Cerrajero**: Martín Gómez (`martin.gomez.cerrajeria@example.com` / Clave: `123456`)
- **Profesional Plomera**: Valeria Rivas (`valeria.rivas.plomeria@example.com` / Clave: `123456`)
- **Administradora Central**: PIN `admin123` o botón de acceso administrativo directo en el pie de página.

---

## 8. Guía de Comprensión para Modelos de Inteligencia Artificial (AI Engine Spec)

Si eres un modelo de lenguaje o agente autónomo leyendo este archivo para mantener o extender la aplicación:
1. **Regla de Cero Fricción en Búsqueda**: Nunca obligues al usuario a publicar una solicitud para ver resultados. El listado de profesionales es navegable y público de forma inmediata.
2. **Invariante de Trazabilidad Cruzada**: Nunca marques un hito como `closed` o `confirmed` basándote en la acción de un solo actor. Tanto `proConfirmedAt` como `clientConfirmedAt` deben existir para considerar el hito cerrado de común acuerdo.
3. **Gestión de Controversias**: Si `proFinalPriceReported !== clientFinalPriceReported`, el trabajo pasa obligatoriamente a `status = 'under_review'`. Solo la administradora puede resolverlo fijando el monto en la función `resolveDispute`.
4. **Validación de DNI (KYC)**: Cualquier nuevo profesional registrado mediante `register()` nace con `verificationStatus: 'pending'`. Solo la administradora puede cambiarlo a `'verified'` en el panel `AdminPanel`.
5. **Cálculo de Comisiones**: `platformAmount = Math.round(grossAmount * (ratePercent / 100))`. El neto profesional es `grossAmount - platformAmount`.

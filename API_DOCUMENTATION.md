# UrSinger Backend - Estado Actual y Documentación

## 📋 Resumen Ejecutivo

Este documento describe el estado actual del backend de UrSinger, una aplicación de calibración de audio para cantantes. El backend está construido con **NestJS** y **Prisma ORM** con **PostgreSQL**, y maneja tanto endpoints REST HTTP como comunicación en tiempo real mediante **WebSockets**.

**Estado:** ✅ Backend funcional y operativo
- API REST corriendo en `http://localhost:3000`
- WebSocket Gateway en namespace `/calibration`
- Base de datos PostgreSQL configurada y migrada
- Prisma Studio disponible en `http://localhost:5555`

---

## 🏗️ Arquitectura Actual

### Stack Tecnológico
- **Framework:** NestJS v11.0.1
- **Runtime:** Node.js v22.17.0
- **ORM:** Prisma v6.18.0
- **Base de Datos:** PostgreSQL
- **WebSockets:** Socket.io (via @nestjs/platform-socket.io)
- **Validación:** class-validator + class-transformer
- **Configuración:** @nestjs/config con Joi para validación

### Módulos Implementados

1. **AppModule** (módulo raíz)
2. **CalibrationsModule** (funcionalidad principal)
3. **PrismaModule** (conexión a base de datos)
4. **HealthModule** (health checks)
5. **ConfigModule** (configuración de entorno)

---

## 🗄️ Modelo de Datos (Prisma Schema)

### Entidades Principales

#### 1. CalibrationSession
Representa una sesión de calibración completa.

```prisma
model CalibrationSession {
  id            String   @id @default(cuid())
  userId        String?
  deviceIdHash  String
  sampleRate    Int
  status        String   // started | room_ok | room_warn | completed | aborted
  startedAt     DateTime @default(now())
  finishedAt    DateTime?
  metrics       CalibrationMetric[]
  profile       CalibrationProfile?
}
```

**Estados posibles:**
- `started`: Sesión iniciada
- `room_ok`: Verificación de ruido ambiental exitosa
- `room_warn`: Ambiente con ruido elevado
- `completed`: Calibración finalizada exitosamente
- `aborted`: Calibración cancelada

#### 2. CalibrationProfile
Perfil de calibración resultante (configuración optimizada para el usuario).

```prisma
model CalibrationProfile {
  id               String   @id @default(cuid())
  sessionId        String   @unique
  session          CalibrationSession @relation(fields: [sessionId], references: [id])
  noiseFloorDbfs   Float    // Piso de ruido medido en dBFS
  rmsTargetMin     Float    // RMS mínimo objetivo (-28 dB)
  rmsTargetMax     Float    // RMS máximo objetivo (-16 dB)
  clipTolerance    Int      // Tolerancia de clipping (0)
  latencyMs        Float    // Latencia medida del sistema
  tunerOffsetCents Float?   // Offset del afinador (opcional)
  createdAt        DateTime @default(now())
}
```

#### 3. CalibrationMetric
Métricas capturadas durante las diferentes fases de calibración.

```prisma
model CalibrationMetric {
  id            String   @id @default(cuid())
  sessionId     String
  session       CalibrationSession @relation(fields: [sessionId], references: [id])
  phase         String   // room_check | gain | metrics
  windowMs      Int      // Ventana temporal de la medición
  avgRmsDb      Float?   // RMS promedio en dB
  stdRmsDb      Float?   // Desviación estándar del RMS
  clipRate      Float?   // Tasa de clipping (0-1)
  snrDb         Float?   // Signal-to-Noise Ratio en dB
  baseLatencyMs Float?   // Latencia base del sistema
  noiseFloorDbfs Float?  // Piso de ruido (específico para room_check)
  result        String?  // OK | Fail
  timestamp     DateTime @default(now())
}
```

**Fases de calibración:**
- `room_check`: Verificación de condiciones ambientales
- `gain`: Ajuste de ganancia del micrófono
- `metrics`: Medición de métricas finales

---

## 🔌 API REST Endpoints

### Base URL: `http://localhost:3000`

#### 1. POST `/calibrations/start`
Inicia una nueva sesión de calibración.

**Request Body:**
```typescript
{
  sessionId: string;      // ID único de la sesión
  deviceIdHash: string;   // Hash del dispositivo
  sampleRate: number;     // Frecuencia de muestreo (min: 8000 Hz)
  appVersion: string;     // Versión de la app
  osInfo: string;         // Información del SO
}
```

**Response:**
```typescript
{
  thresholds: {
    noise_floor_threshold_dbfs: -40,
    snr_min_db: 20,
    rms_target_range_db: [-28, -16],
    clip_tolerance: 0,
    pitch_tolerance_cents: 15,
    window_agg_ms: 5000
  }
}
```

#### 2. POST `/calibrations/finish`
Finaliza la sesión y genera el perfil de calibración.

**Request Body:**
```typescript
{
  sessionId: string;
  observedRmsDb: number;     // RMS observado durante la calibración
  clipEvents: number;        // Número de eventos de clipping
  latencyMs: number;         // Latencia medida
  tunerOffsetCents?: number; // Offset del afinador (opcional)
  room: {
    noiseFloorDbfs: number;  // Piso de ruido del ambiente
    snrDb: number;           // SNR calculado
  }
}
```

**Response:**
```typescript
{
  profile: {
    id: string;
    sessionId: string;
    noiseFloorDbfs: number;
    rmsTargetMin: number;
    rmsTargetMax: number;
    clipTolerance: number;
    latencyMs: number;
    tunerOffsetCents: number | null;
    createdAt: Date;
  }
}
```

#### 3. GET `/calibrations/latest?deviceIdHash={hash}`
Obtiene el último perfil de calibración de un dispositivo.

**Query Parameters:**
- `deviceIdHash`: Hash del dispositivo

**Response:**
```typescript
CalibrationProfile | null
```

#### 4. GET `/calibrations/:sessionId/metrics`
Obtiene todas las métricas de una sesión específica.

**Response:**
```typescript
CalibrationMetric[]  // Ordenadas por timestamp ascendente
```

#### 5. GET `/health`
Health check del servidor.

**Response:**
```typescript
{
  status: "ok",
  info: { ... },
  error: { ... },
  details: { ... }
}
```

---

## 🔄 WebSocket Events

### Namespace: `/calibration`
**URL:** `ws://localhost:3000/calibration`

### Eventos Implementados

#### 1. `device:selected`
Cliente notifica la selección del dispositivo de audio.

**Payload:**
```typescript
{
  sessionId: string;
  deviceIdHash: string;
  sampleRate: number;
}
```

**Response:**
```typescript
{ ack: true }
```

#### 2. `room_check`
Envía métricas de verificación del ambiente.

**Payload:**
```typescript
{
  sessionId: string;
  noiseFloorDbfs: number;  // Nivel de ruido de fondo
  baseLatencyMs: number;   // Latencia base del sistema
  durationSec: number;     // Duración de la medición
}
```

**Lógica:**
- Si `noiseFloorDbfs > -40`, actualiza status a `room_warn`
- Si `noiseFloorDbfs <= -40`, actualiza status a `room_ok`
- Crea una métrica con phase `room_check`

**Response:**
```typescript
{ ack: true }
```

#### 3. `gain_tick`
Envía métricas durante el ajuste de ganancia (ticks periódicos).

**Payload:**
```typescript
{
  sessionId: string;
  windowMs: number;        // Ventana temporal de medición
  avgRmsDb: number;        // RMS promedio
  stdRmsDb: number;        // Desviación estándar del RMS
  clipRate: number;        // Tasa de clipping (0-1)
  snrDb?: number;          // SNR calculado (opcional)
}
```

**Lógica:**
- Crea una métrica con phase `gain`
- Registra todas las métricas en tiempo real

**Response:**
```typescript
{ ack: true }
```

#### 4. `metrics_tick`
Envía métricas finales consolidadas.

**Payload:**
```typescript
{
  sessionId: string;
  windowMs: number;
  avgRmsDb: number;
  stdRmsDb: number;
  clipRate: number;
  snrDb?: number;
  baseLatencyMs?: number;
  noiseFloorDbfs?: number; // Consolidado del room_check
  result?: 'OK' | 'Fail';
}
```

**Lógica:**
- Crea una métrica con phase `metrics`
- Incluye todas las métricas consolidadas de la sesión

**Response:**
```typescript
{ ack: true }
```

---

## ⚙️ Configuración de Umbrales

Los umbrales de calibración están definidos como constantes en `calibrations.service.ts`:

```typescript
const THRESHOLDS = {
  noise_floor_threshold_dbfs: -40,    // Umbral de ruido de fondo
  snr_min_db: 20,                      // SNR mínimo aceptable
  rms_target_range_db: [-28, -16],    // Rango objetivo de RMS
  clip_tolerance: 0,                   // Tolerancia de clipping
  pitch_tolerance_cents: 15,           // Tolerancia de afinación
  window_agg_ms: 5000,                 // Ventana de agregación
};
```

**Nota:** Actualmente estos valores son hardcoded. En el futuro podrían ser configurables por usuario o por tipo de dispositivo.

---

## 🔄 Flujo de Calibración

### 1. Inicio de Sesión
```
Cliente → POST /calibrations/start
Backend → Crea CalibrationSession (status: 'started')
Backend → Retorna thresholds
```

### 2. Selección de Dispositivo
```
Cliente → WS: device:selected
Backend → Actualiza deviceIdHash y sampleRate
```

### 3. Verificación de Ambiente (Room Check)
```
Cliente → WS: room_check (con noiseFloorDbfs)
Backend → Evalúa ruido de fondo
Backend → Actualiza status a 'room_ok' o 'room_warn'
Backend → Crea CalibrationMetric (phase: 'room_check')
```

### 4. Ajuste de Ganancia
```
Cliente → WS: gain_tick (múltiples veces)
Backend → Registra métricas en tiempo real
Backend → Crea CalibrationMetric (phase: 'gain')
```

### 5. Métricas Finales
```
Cliente → WS: metrics_tick
Backend → Registra métricas consolidadas
Backend → Crea CalibrationMetric (phase: 'metrics')
```

### 6. Finalización
```
Cliente → POST /calibrations/finish
Backend → Actualiza status a 'completed'
Backend → Crea CalibrationProfile
Backend → Retorna perfil generado
```

---

## 📊 Variables de Entorno

Archivo `.env` requerido:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/ursinger_db"

# Server
PORT=3000
NODE_ENV=development

# CORS
CORS_ORIGIN="http://localhost:5173"  # Frontend URL
```

---

## 🚀 Comandos Disponibles

```bash
# Desarrollo
npm run start:dev        # Modo watch
npm run start:debug      # Con debugger

# Producción
npm run build            # Compilar
npm run start:prod       # Ejecutar compilado

# Base de datos
npx prisma migrate dev   # Crear/aplicar migraciones
npx prisma studio        # Interfaz gráfica de BD
npx prisma generate      # Regenerar Prisma Client

# Testing
npm run test             # Tests unitarios
npm run test:e2e         # Tests end-to-end
npm run test:cov         # Cobertura

# Linting
npm run lint             # ESLint
npm run format           # Prettier
```

---

## 🎯 Funcionalidades Futuras / Pendientes

### Alto Prioridad
- [ ] **Autenticación de usuarios** (JWT, OAuth)
- [ ] **Gestión de usuarios** (registro, login, perfil)
- [ ] **Múltiples perfiles por usuario** (diferentes dispositivos)
- [ ] **Historial de calibraciones** (dashboard con estadísticas)

### Media Prioridad
- [ ] **Exportar/importar perfiles** de calibración
- [ ] **Comparación de perfiles** entre sesiones
- [ ] **Alertas y notificaciones** (WebSocket push)
- [ ] **Métricas agregadas** por usuario/dispositivo
- [ ] **Recomendaciones automáticas** basadas en métricas

### Baja Prioridad
- [ ] **API pública** con rate limiting
- [ ] **Webhooks** para integraciones externas
- [ ] **Análisis de tendencias** a largo plazo
- [ ] **Modo colaborativo** (profesor-estudiante)

### Mejoras Técnicas
- [ ] **Migraciones automáticas** en producción
- [ ] **Logging estructurado** (Winston configurado)
- [ ] **Monitoreo y métricas** (Prometheus/Grafana)
- [ ] **Tests unitarios completos** (coverage >80%)
- [ ] **Tests E2E** para flujos completos
- [ ] **Docker Compose** para desarrollo local
- [ ] **CI/CD pipeline** (GitHub Actions)
- [ ] **Documentación OpenAPI/Swagger**

---

## 🐛 Problemas Conocidos / Limitaciones

1. **Sin autenticación:** Actualmente no hay control de acceso
2. **Umbrales hardcoded:** Los thresholds no son configurables
3. **Sin validación de sesión activa:** Se pueden crear múltiples sesiones con mismo sessionId
4. **Sin cleanup de sesiones:** Sesiones abandonadas quedan en estado 'started'
5. **Sin manejo de reconexión WebSocket:** Si se pierde conexión, se pierde el estado
6. **Sin paginación:** Endpoints como `/metrics` pueden retornar grandes volúmenes

---

## 📝 Notas de Implementación

### Decisiones de Diseño

1. **CUID para IDs:** Se usa `cuid()` en lugar de UUID para mejor performance
2. **Campos opcionales:** `snrDb`, `tunerOffsetCents` son opcionales para flexibilidad
3. **Timestamps automáticos:** `@default(now())` en Prisma para auditoría
4. **Validación en DTO:** class-validator asegura datos correctos desde el cliente
5. **WebSockets para tiempo real:** Permite feedback instantáneo durante calibración
6. **Métricas granulares:** Se guardan todos los ticks para análisis posterior

### Patrones Utilizados

- **Repository Pattern:** A través de Prisma Service
- **DTO Pattern:** Para validación y transformación de datos
- **Module Pattern:** Separación clara de responsabilidades
- **Dependency Injection:** Nativo de NestJS

---
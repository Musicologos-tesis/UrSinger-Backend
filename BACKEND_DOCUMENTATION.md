# UrSinger Backend - Documentación Completa

**Fecha:** Noviembre 2025  
**Versión:** 1.0  
**Stack:** NestJS + TypeScript + PostgreSQL + Prisma

---

## 📋 Índice

1. [Visión General](#visión-general)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Modelos de Base de Datos](#modelos-de-base-de-datos)
4. [Módulos y Funcionalidades](#módulos-y-funcionalidades)
5. [Endpoints API](#endpoints-api)
6. [Algoritmo de Generación de Planes de Entrenamiento](#algoritmo-de-generación-de-planes-de-entrenamiento)
7. [Integración con Machine Learning](#integración-con-machine-learning)
8. [Configuración y Deployment](#configuración-y-deployment)

---

## 1. Visión General

### ¿Qué es UrSinger Backend?

UrSinger es una plataforma de entrenamiento vocal personalizado que utiliza **Machine Learning** para analizar las capacidades vocales de los usuarios y generar **planes de entrenamiento adaptativos** basados en sus debilidades específicas.

### Tecnologías Principales

- **Framework:** NestJS 11.0.1
- **Lenguaje:** TypeScript 5.7.3
- **Base de Datos:** PostgreSQL
- **ORM:** Prisma 6.18.0
- **Autenticación:** JWT + Passport
- **Documentación:** Swagger/OpenAPI
- **Machine Learning:** Servicio externo en Python (localhost:8000)

### Principios de Diseño

1. **Arquitectura Modular:** Cada funcionalidad está encapsulada en su propio módulo
2. **API RESTful:** Endpoints claros y semánticos
3. **Validación de Datos:** DTOs con class-validator
4. **Persistencia Inteligente:** Prisma ORM con migraciones versionadas
5. **Progresión Bloqueada:** El usuario debe completar ejercicios antes de avanzar

---

## 2. Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (React)                        │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP/REST
┌──────────────────────▼──────────────────────────────────────┐
│                   NESTJS BACKEND (Port 3000)                 │
│  ┌────────────┬────────────┬────────────┬─────────────┐     │
│  │   Auth     │  Profile   │Calibration │  Metrics    │     │
│  │  Module    │   Module   │  Module    │  Module     │     │
│  └────────────┴────────────┴────────────┴─────────────┘     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Training Plans Module (Core)                 │   │
│  │  - Generación inteligente de planes                  │   │
│  │  - Algoritmo de distribución ponderada               │   │
│  │  - Seguimiento de progreso                           │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Prisma Service                          │   │
│  └─────────────────────┬────────────────────────────────┘   │
└────────────────────────┼────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                  PostgreSQL Database                         │
│  - Users & Profiles                                          │
│  - Calibrations & Evaluations                                │
│  - Exercise Catalog (15 exercises, 30 levels)                │
│  - Training Plans & Progress Tracking                        │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│           ML Service (Python - localhost:8000)               │
│  POST /predict                                               │
│  - Analiza 10 métricas vocales                               │
│  - Detecta debilidades en 5 grupos vocales (G1-G5)           │
│  - Retorna: weaknessesDetected, confidenceScores            │
└──────────────────────────────────────────────────────────────┘
```

---

## 3. Modelos de Base de Datos

### 3.1 Autenticación y Perfiles

#### User
```prisma
model User {
  id          String       @id @default(cuid())
  email       String       @unique
  password    String       // Hasheado con bcrypt
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  profile     UserProfile?
}
```

#### UserProfile
```prisma
model UserProfile {
  id                  String   @id @default(cuid())
  userId              String   @unique
  name                String
  age                 Int
  gender              String   // male | female | other
  weeklyTrainingFreq  Int      // 1-7
  
  calibrations        Calibration[]
  evaluations         Evaluation[]
  trainingPlans       TrainingPlan[]
}
```

### 3.2 Calibración

#### Calibration
```prisma
model Calibration {
  id               String   @id @default(cuid())
  profileId        String
  sessionId        String   @unique
  deviceIdHash     String
  sampleRate       Int      // 44100 o 48000
  noiseFloorDbfs   Float    // Ruido ambiente medido
  snrDb            Float?
  isCurrent        Boolean  @default(false)
  createdAt        DateTime @default(now())
}
```

**Propósito:** Almacena la calibración del micrófono para normalizar las métricas vocales.

### 3.3 Evaluación

#### Evaluation
```prisma
model Evaluation {
  id                  String   @id @default(cuid())
  profileId           String
  sessionId           String   @unique
  
  // Métricas de volumen
  meanRmsDb           Float
  rmsConsistency      Float
  dynamicRangeDb      Float
  durationSec         Float
  
  // Métricas de afinación
  precisionCents      Float
  stabilityCents      Float
  
  // Métricas de rango
  rangeMinMidi        Float
  rangeMaxMidi        Float
  rangeSpanSemitones  Float
  attackLatencyMs     Float
  
  // Análisis ML
  weaknessesDetected  String[]  // ["G4", "G2"]
  totalWeaknesses     Int
  confidenceScores    Json
  
  createdAt           DateTime  @default(now())
  trainingPlans       TrainingPlan[]
}
```

**Propósito:** Resultados de la evaluación vocal y predicciones del modelo ML.

### 3.4 Catálogo de Ejercicios

#### ExerciseGroup
```prisma
model ExerciseGroup {
  id          Int      @id @default(autoincrement())
  groupNumber Int      @unique  // 1-5 (G1-G5)
  name        String
  objective   String
  rationale   String   @db.Text  // Sustento CVT/EVM
  exercises   Exercise[]
}
```

**Grupos Vocales:**
- **G1:** Soporte respiratorio y control del aire
- **G2:** Afinación y oído tonal
- **G3:** Estabilidad y vibrato controlado
- **G4:** Potencia y control dinámico
- **G5:** Rango y flexibilidad vocal

#### Exercise
```prisma
model Exercise {
  id              Int      @id @default(autoincrement())
  groupId         Int
  exerciseNumber  Int
  name            String
  rationale       String
  cvtDescription  String?  @db.Text  // Sustento CVT
  evmDescription  String?  @db.Text  // Sustento EVM
  objective       String
  instructions    String   @db.Text
  levels          ExerciseLevel[]
}
```

**Ejemplo:**
- **Nombre:** "Breath Flow Hold"
- **CVT:** "Support: Uso activo del cuerpo para sostener la voz con apoyo diafragmático"
- **EVM:** "Flow: Mantener un flujo de aire constante y equilibrado"

#### ExerciseLevel
```prisma
model ExerciseLevel {
  id          Int      @id @default(autoincrement())
  exerciseId  Int
  level       Int      // 1 o 2
  description String
  videoUrl    String?
  planExercises TrainingPlanExercise[]
}
```

**Total del catálogo:**
- 5 grupos vocales
- 15 ejercicios (3 por grupo)
- 30 niveles (2 por ejercicio)

### 3.5 Planes de Entrenamiento

#### TrainingPlan
```prisma
model TrainingPlan {
  id            String   @id @default(cuid())
  profileId     String
  evaluationId  String
  startDate     DateTime @default(now())
  endDate       DateTime // startDate + 28 días
  frequency     Int      // 3 (Lunes, Miércoles, Viernes)
  focusGroups   Int[]    // [4, 2] - Grupos débiles
  status        String   @default("active") // active | replaced | completed
  exercises     TrainingPlanExercise[]
}
```

#### TrainingPlanExercise
```prisma
model TrainingPlanExercise {
  id              String     @id @default(cuid())
  planId          String
  exerciseLevelId Int
  dayOfWeek       Int        // 1=Lunes, 3=Miércoles, 5=Viernes
  orderInDay      Int        // 0, 1, 2
  completionCount Int        @default(0)  // 0-4
  completedDates  DateTime[]
}
```

**Modelo de Progresión:**
- 9 ejercicios totales
- 3 ejercicios por día
- 4 semanas de duración
- 36 completaciones totales posibles (9 × 4)

---

## 4. Módulos y Funcionalidades

### 4.1 Auth Module

**Responsabilidad:** Autenticación y autorización de usuarios.

**Endpoints:**
- `POST /auth/register` - Registro de usuario
- `POST /auth/login` - Login y generación de JWT

**Seguridad:**
- Contraseñas hasheadas con bcrypt
- JWT con expiración configurable
- Guards de Passport para proteger rutas

### 4.2 Profile Module

**Responsabilidad:** Gestión de perfiles de usuario.

**Endpoints:**
- `GET /profile/:userId` - Obtener perfil
- `PUT /profile/:userId` - Actualizar perfil

**Datos almacenados:**
- Información demográfica (nombre, edad, género)
- Frecuencia de entrenamiento semanal

### 4.3 Calibrations Module

**Responsabilidad:** Calibración del micrófono del usuario.

**Endpoints:**
- `POST /calibrations` - Crear calibración
- `GET /calibrations/current/:profileId` - Obtener calibración activa
- `GET /calibrations/profile/:profileId` - Listar todas las calibraciones
- `PUT /calibrations/:sessionId/set-current` - Marcar como activa

**Proceso:**
1. Usuario realiza grabación de prueba
2. Sistema mide ruido ambiente (noiseFloorDbfs)
3. Calcula SNR (Signal-to-Noise Ratio)
4. Guarda calibración para normalizar evaluaciones futuras

### 4.4 Metrics Module

**Responsabilidad:** Evaluación vocal y análisis con ML.

**Endpoints:**
- `POST /metrics/evaluate` - Evaluar métricas vocales
- `GET /metrics/:sessionId` - Obtener evaluación

**Flujo:**
1. Recibe 10 métricas vocales del frontend
2. Envía a servicio ML (POST localhost:8000/predict)
3. ML retorna debilidades detectadas: `["G4", "G2"]`
4. Guarda evaluación en BD
5. Retorna resultado al frontend

**Métricas analizadas:**
- Volumen: meanRmsDb, rmsConsistency, dynamicRangeDb
- Afinación: precisionCents, stabilityCents
- Rango: rangeMinMidi, rangeMaxMidi, rangeSpanSemitones
- Timing: durationSec, attackLatencyMs

### 4.5 Training Plans Module ⭐ (Core)

**Responsabilidad:** Generación inteligente de planes de entrenamiento personalizados.

**Endpoints:**

#### `POST /training-plans/generate`
Genera un plan personalizado basado en la última evaluación.

**Request:**
```json
{
  "profileId": "cm3p..."
}
```

**Response:**
```json
{
  "planId": "cm3pa...",
  "focusGroups": ["Potencia y control dinámico"],
  "startDate": "2025-11-20T00:00:00.000Z",
  "endDate": "2025-12-18T00:00:00.000Z",
  "weekPlan": [
    {
      "day": 1,
      "dayName": "Lunes",
      "exercises": [
        {
          "exerciseName": "Single Burst",
          "groupName": "Potencia y control dinámico",
          "level": 1,
          "description": "Emisión fuerte de 3 s en nota media.",
          "cvtDescription": "Twang/Overdrive: Modos vocales...",
          "evmDescription": null
        }
      ]
    }
  ],
  "instructions": "Repite esta misma semana durante 4 semanas..."
}
```

#### `GET /training-plans/active/:profileId`
Obtiene el plan activo con estado de progreso.

**Response adicional:**
```json
{
  "frequency": 3,
  "focusGroups": ["Potencia y control dinámico"],
  "currentWeek": 2,
  "completedThisWeek": 7,
  "totalExercises": 9,
  "weekPlan": [...]
}
```

#### `GET /training-plans/exercise/:planExerciseId`
Obtiene detalles completos de un ejercicio específico.

**Response:**
```json
{
  "planExerciseId": "cm3pb...",
  "exerciseLevelId": 10,
  "exerciseId": 5,
  "exerciseName": "Single Burst",
  "groupNumber": 4,
  "groupName": "Potencia y control dinámico",
  "level": 1,
  "description": "Emisión fuerte de 3 s en nota media.",
  "instructions": "UrSinger da una nota guía. El usuario...",
  "videoUrl": null,
  "cvtDescription": "Twang/Overdrive: Modos vocales...",
  "evmDescription": null,
  "completionCount": 2,
  "completedDates": ["2025-11-17T19:00:00.000Z"],
  "isCompletedThisWeek": true,
  "dayOfWeek": 1,
  "orderInDay": 0
}
```

#### `PUT /training-plans/exercise/complete`
Marca un ejercicio como completado.

**Request:**
```json
{
  "planExerciseId": "cm3pb..."
}
```

**Response:**
```json
{
  "success": true,
  "exerciseId": "cm3pb...",
  "completionCount": 3,
  "completedDates": [
    "2025-11-17T19:00:00.000Z",
    "2025-11-24T19:00:00.000Z",
    "2025-12-01T19:00:00.000Z"
  ]
}
```

#### `GET /training-plans/progress/:profileId`
Obtiene estadísticas detalladas de progreso.

**Response:**
```json
{
  "planId": "cm3pa...",
  "totalCompletions": 24,
  "totalPossibleCompletions": 36,
  "monthlyProgressPercentage": 67,
  "currentWeek": 3,
  "calendarWeek": 3,
  "isBlocked": false,
  "completedThisWeek": 9,
  "pendingToAdvance": 0,
  "totalExercises": 9,
  "uniqueExercisesStarted": 9,
  "startDate": "2025-11-20T00:00:00.000Z",
  "endDate": "2025-12-18T00:00:00.000Z",
  "daysRemaining": 14,
  "daysSinceStart": 14
}
```

### 4.6 Health Module

**Responsabilidad:** Health checks para monitoring.

**Endpoints:**
- `GET /health` - Estado del servidor y BD

---

## 5. Endpoints API - Resumen Completo

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| **Auth** |
| POST | `/auth/register` | Registro de usuario | No |
| POST | `/auth/login` | Login y generación JWT | No |
| **Profile** |
| GET | `/profile/:userId` | Obtener perfil | Sí |
| PUT | `/profile/:userId` | Actualizar perfil | Sí |
| **Calibrations** |
| POST | `/calibrations` | Crear calibración | Sí |
| GET | `/calibrations/current/:profileId` | Obtener calibración activa | Sí |
| GET | `/calibrations/profile/:profileId` | Listar calibraciones | Sí |
| GET | `/calibrations/:sessionId` | Obtener calibración específica | Sí |
| PUT | `/calibrations/:sessionId/set-current` | Marcar como activa | Sí |
| **Metrics** |
| POST | `/metrics/evaluate` | Evaluar métricas vocales | Sí |
| GET | `/metrics/:sessionId` | Obtener evaluación | Sí |
| **Training Plans** |
| POST | `/training-plans/generate` | Generar plan personalizado | Sí |
| GET | `/training-plans/active/:profileId` | Obtener plan activo | Sí |
| GET | `/training-plans/exercise/:planExerciseId` | Obtener ejercicio | Sí |
| PUT | `/training-plans/exercise/complete` | Completar ejercicio | Sí |
| GET | `/training-plans/progress/:profileId` | Obtener progreso | Sí |
| **Health** |
| GET | `/health` | Health check | No |

---

## 6. Algoritmo de Generación de Planes de Entrenamiento

### 6.1 Resumen Ejecutivo

El algoritmo genera un plan de **9 ejercicios** distribuidos en **3 días/semana** (Lunes, Miércoles, Viernes) basándose en las **debilidades vocales** detectadas por Machine Learning.

**Clave:** Balancear el énfasis en áreas débiles sin descuidar las áreas fuertes.

### 6.2 Entrada del Algoritmo

```typescript
// Entrada del ML
const weaknessesDetected = ["G4"];  // Grupos débiles

// Clasificación
const allGroups = [1, 2, 3, 4, 5];
const weakGroups = [4];              // Débiles
const strongGroups = [1, 2, 3, 5];   // Fuertes
```

### 6.3 Restricciones

1. ✅ **Cobertura completa:** Todos los 5 grupos deben aparecer
2. ✅ **Énfasis adaptativo:** Más ejercicios para grupos débiles
3. ✅ **Balance diario:** 3 ejercicios por día
4. ✅ **Progresión adecuada:** Nivel 1 para débiles, Nivel 2 para fuertes

### 6.4 Ponderación y Selección

```typescript
const weights = {
  weak: 2,    // Grupos débiles reciben 2 ejercicios
  strong: 1   // Grupos fuertes reciben 1 ejercicio
};

const levels = {
  weak: 1,    // Nivel principiante (construir base)
  strong: 2   // Nivel avanzado (mantenimiento)
};
```

**Distribución típica (1 grupo débil):**
```
Grupos débiles:   1 grupo  × 2 ejercicios × nivel 1 = 2 ejercicios
Grupos fuertes:   4 grupos × 1 ejercicio  × nivel 2 = 4 ejercicios
Ajuste:           3 ejercicios adicionales de grupos débiles
                                          TOTAL = 9 ejercicios
```

### 6.5 Fases del Algoritmo

#### Fase 1: Clasificación y Ponderación
```typescript
for (const groupNum of allGroups) {
  const isWeak = weakGroups.includes(groupNum);
  const level = isWeak ? 1 : 2;
  const count = isWeak ? 2 : 1;
  
  const groupExercises = await getExercisesByGroups([groupNum], level);
  selectedExercises.push(...selectExercises(groupExercises, count));
}
```

#### Fase 2: Ajuste a 9 Ejercicios
```typescript
if (finalExercises.length < 9) {
  const missing = 9 - finalExercises.length;
  const additionalWeak = await getExercisesByGroups(weakGroups, 1);
  finalExercises.push(...selectRandomExercises(additionalWeak, missing));
}
```

#### Fase 3: Fisher-Yates Shuffle
```typescript
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
```

**¿Por qué Fisher-Yates?**
- Distribución uniforme (cada permutación equiprobable)
- Complejidad O(n)
- Elimina sesgos de ordenamiento

#### Fase 4: Round-Robin Distribution
```typescript
const weekPlan = [
  { day: 1, dayName: 'Lunes',      exercises: shuffled.slice(0, 3) },
  { day: 3, dayName: 'Miércoles',  exercises: shuffled.slice(3, 6) },
  { day: 5, dayName: 'Viernes',    exercises: shuffled.slice(6, 9) }
];
```

### 6.6 Ejemplo Completo

**Entrada:**
- Debilidad detectada: G4 (Potencia y control dinámico)

**Salida:**
```
Distribución final:
- G4 (débil):   5 ejercicios (55.6%) nivel 1  ← Enfoque principal
- G1 (fuerte):  1 ejercicio  (11.1%) nivel 2  ← Mantenimiento
- G2 (fuerte):  1 ejercicio  (11.1%) nivel 2
- G3 (fuerte):  1 ejercicio  (11.1%) nivel 2
- G5 (fuerte):  1 ejercicio  (11.1%) nivel 2

Lunes:      3 ejercicios (2 G4, 1 G1)
Miércoles:  3 ejercicios (1 G4, 1 G5, 1 G3)
Viernes:    3 ejercicios (2 G4, 1 G2)
```

### 6.7 Progresión Bloqueada

**Concepto:** La semana solo avanza si el usuario completa TODOS los 9 ejercicios.

```typescript
function calculateCurrentWeek(plan) {
  const calendarWeek = Math.floor(daysSinceStart / 7) + 1;
  
  let actualWeek = 1;
  for (let week = 1; week <= calendarWeek; week++) {
    const allCompleted = plan.exercises.every(
      ex => ex.completionCount >= week
    );
    if (allCompleted) {
      actualWeek = Math.min(week + 1, 4);
    } else {
      break; // Bloqueado
    }
  }
  return actualWeek;
}
```

**Ejemplo:**
- Día 1: Semana 1, completados 0/9 → `currentWeek = 1`
- Día 3: Semana 1, completados 3/9 → `currentWeek = 1` (bloqueado)
- Día 5: Semana 1, completados 9/9 → `currentWeek = 2` (desbloqueado)

### 6.8 Complejidad del Algoritmo

**Temporal:**
```
Clasificación:           O(n) donde n = 5 (grupos)
Consulta BD:             O(g × q) donde g = grupos, q = query time
Selección:               O(e × log(e)) donde e = ejercicios
Fisher-Yates:            O(m) donde m = 9
Round-Robin:             O(9)

Total: O(g × q + e × log(e)) ≈ O(n log n)
```

**Espacial:** O(1) - Constante (siempre 9 ejercicios)

### 6.9 Fundamentos Pedagógicos

**Principio 1: Sobrecarga Óptima**
- 55-60% débiles → Suficiente estímulo para mejora
- 40-45% fuertes → Mantenimiento sin descuido

**Principio 2: Variedad Neuromuscular**
- Todos los grupos presentes → Evita desbalances

**Principio 3: Progresión Gradual**
- Nivel 1 (débiles): Construcción de fundamentos
- Nivel 2 (fuertes): Refinamiento

**Principio 4: CVT y EVM**
- **CVT (Complete Vocal Technique):** Técnica vocal completa
- **EVM (Estill Voice Model):** Modelo científico de la voz

---

## 7. Integración con Machine Learning

### 7.1 Arquitectura

```
┌─────────────┐                    ┌─────────────────┐
│   NestJS    │  POST /predict     │  Python ML      │
│   Backend   ├───────────────────►│   Service       │
│  (Port 3000)│                    │  (Port 8000)    │
└─────────────┘◄───────────────────┤                 │
                  JSON Response     └─────────────────┘
```

### 7.2 Request al ML

**Endpoint:** `POST http://localhost:8000/predict`

**Body:**
```json
{
  "metrics": {
    "meanRmsDb": -18.5,
    "rmsConsistency": 0.92,
    "dynamicRangeDb": 12.3,
    "durationSec": 3.5,
    "precisionCents": 15.2,
    "stabilityCents": 8.7,
    "rangeMinMidi": 55.0,
    "rangeMaxMidi": 72.0,
    "rangeSpanSemitones": 17.0,
    "attackLatencyMs": 45.0
  }
}
```

### 7.3 Response del ML

```json
{
  "weaknessesDetected": ["G4"],
  "totalWeaknesses": 1,
  "confidenceScores": {
    "weak_G1": 0.05,
    "weak_G2": 0.12,
    "weak_G3": 0.08,
    "weak_G4": 0.87,
    "weak_G5": 0.15
  }
}
```

**Interpretación:**
- `weak_G4: 0.87` → Alta confianza de debilidad en G4
- Threshold típico: > 0.5 para considerar debilidad

### 7.4 Flujo Completo

```
1. Frontend captura audio
   ↓
2. Frontend calcula 10 métricas
   ↓
3. Frontend envía a /metrics/evaluate
   ↓
4. Backend reenvía a ML Service
   ↓
5. ML predice debilidades
   ↓
6. Backend guarda en Evaluation
   ↓
7. Backend retorna al Frontend
   ↓
8. Frontend muestra resultados
   ↓
9. Frontend solicita generar plan
   ↓
10. Backend consulta última Evaluation
    ↓
11. Backend ejecuta algoritmo de distribución
    ↓
12. Backend guarda TrainingPlan
    ↓
13. Backend retorna plan al Frontend
```

---

## 8. Configuración y Deployment

### 8.1 Variables de Entorno

**Archivo:** `.env`

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/ursinger_db"

# JWT
JWT_SECRET="your-secret-key-here"
JWT_EXPIRATION="7d"

# API
PORT=3000
NODE_ENV="development"

# ML Service
ML_SERVICE_URL="http://localhost:8000"
```

### 8.2 Instalación Local

```bash
# 1. Clonar repositorio
git clone <repo-url>
cd UrSinger-Backend

# 2. Instalar dependencias
npm install

# 3. Configurar base de datos
# Crear BD PostgreSQL: ursinger_db

# 4. Ejecutar migraciones
npx prisma migrate dev

# 5. Poblar catálogo de ejercicios
npx prisma db seed

# 6. Iniciar servidor
npm run start:dev
```

### 8.3 Scripts Disponibles

```json
{
  "start": "nest start",
  "start:dev": "nest start --watch",
  "start:prod": "node dist/main",
  "build": "nest build",
  "test": "jest",
  "seed": "ts-node prisma/seed.ts"
}
```

### 8.4 Migraciones de Prisma

**Historial:**
1. `20251025223103_init_calibrations` - Calibración inicial
2. `20251105033723_add_noise_floor_field` - Campo noiseFloor
3. `20251113020814_add_users_table` - Users y auth
4. `20251113021500_separate_user_and_profile` - Separación User/Profile
5. `20251117122952_refactor_calibration_simple` - Calibración simplificada
6. `20251117132000_simplify_evaluation` - Evaluación simplificada
7. `20251117194431_add_training_plans` - Planes de entrenamiento
8. `20251117233000_add_exercises_structure` - Catálogo de ejercicios
9. `20251117235500_update_training_plan_exercise_completion` - Tracking
10. `20251202_add_cvt_evm_descriptions` - Campos CVT/EVM

### 8.5 Swagger Documentation

**URL:** `http://localhost:3000/api/docs`

Documentación interactiva automática con:
- Todos los endpoints
- Schemas de request/response
- Try-it-out funcional
- Autenticación JWT

### 8.6 Docker Deployment

**Archivo:** `docker-compose.yml`

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: ursinger_db
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: .
    ports:
      - "3000:3000"
    depends_on:
      - postgres
    environment:
      DATABASE_URL: postgresql://user:password@postgres:5432/ursinger_db

volumes:
  postgres_data:
```

**Comandos:**
```bash
docker-compose up -d
docker-compose logs -f backend
docker-compose down
```

---

## 9. Datos de Prueba

### 9.1 Catálogo de Ejercicios Poblado

**Script:** `prisma/seed.ts`

**Contenido:**
- 5 grupos vocales completos
- 15 ejercicios (3 por grupo)
- 30 niveles (2 por ejercicio)
- Todos con CVT y EVM descriptions

**Ejecutar:**
```bash
npx prisma db seed
```

### 9.2 Usuario de Prueba

```bash
POST /auth/register
{
  "email": "test@ursinger.com",
  "password": "Test123!"
}
```

### 9.3 Flujo de Prueba Completo

```bash
# 1. Registrar usuario
POST /auth/register

# 2. Crear perfil
POST /profile/{userId}

# 3. Crear calibración
POST /calibrations

# 4. Evaluar métricas
POST /metrics/evaluate

# 5. Generar plan
POST /training-plans/generate

# 6. Obtener plan activo
GET /training-plans/active/{profileId}

# 7. Completar ejercicio
PUT /training-plans/exercise/complete

# 8. Ver progreso
GET /training-plans/progress/{profileId}
```

---

## 10. Mejores Prácticas Implementadas

### 10.1 Arquitectura

- ✅ Separación de responsabilidades (módulos independientes)
- ✅ Inyección de dependencias (NestJS DI)
- ✅ DTOs para validación de entrada
- ✅ Interfaces para tipos de datos
- ✅ Servicios reutilizables

### 10.2 Base de Datos

- ✅ Migraciones versionadas
- ✅ Índices en campos clave
- ✅ Relaciones con cascada
- ✅ Timestamps automáticos
- ✅ Constraints de unicidad

### 10.3 Seguridad

- ✅ Contraseñas hasheadas (bcrypt)
- ✅ JWT para autenticación
- ✅ Guards en rutas protegidas
- ✅ Validación de DTOs
- ✅ Variables de entorno para secrets

### 10.4 Código

- ✅ TypeScript strict mode
- ✅ ESLint + Prettier
- ✅ Comentarios JSDoc
- ✅ Nombres descriptivos
- ✅ Manejo de errores consistente

### 10.5 API

- ✅ RESTful design
- ✅ HTTP status codes apropiados
- ✅ Versionado de API
- ✅ Documentación Swagger
- ✅ Respuestas consistentes

---

## 11. Roadmap y Extensiones Futuras

### Posibles Mejoras

1. **WebSockets en Tiempo Real**
   - Notificaciones de progreso
   - Ejercicios en vivo con feedback

2. **Analytics Avanzados**
   - Dashboards de progreso histórico
   - Comparación con otros usuarios
   - Tendencias de mejora

3. **Recomendaciones Avanzadas**
   - Ajuste dinámico del plan
   - Re-evaluación automática
   - Personalización de frecuencia

4. **Gamificación**
   - Logros y badges
   - Racha de días consecutivos
   - Ranking de usuarios

5. **Multimedia**
   - Videos instructivos
   - Audio de referencia
   - Grabación de ejercicios

6. **Social Features**
   - Compartir progreso
   - Grupos de entrenamiento
   - Desafíos entre usuarios

---

## 12. Referencias

### Fundamentos Vocales

- **CVT (Complete Vocal Technique):** Método danés de técnica vocal completa
- **EVM (Estill Voice Model):** Modelo científico de la voz de Jo Estill

### Algoritmos

- **Fisher-Yates Shuffle:** Algoritmo de permutación aleatoria (1938)
- **Round-Robin Scheduling:** Algoritmo de distribución equitativa
- **Weighted Selection:** Selección con probabilidades no uniformes

### Tecnologías

- **NestJS:** https://nestjs.com
- **Prisma:** https://prisma.io
- **PostgreSQL:** https://postgresql.org
- **TypeScript:** https://typescriptlang.org

---

## 13. Contacto y Soporte

**Proyecto:** UrSinger Backend  
**Versión:** 1.0  
**Fecha:** Noviembre 2025  

**Arquitectura:** NestJS + TypeScript + PostgreSQL + Prisma  
**Machine Learning:** Python (localhost:8000)  
**Documentación API:** http://localhost:3000/api/docs

---

**Última actualización:** Noviembre 20, 2025

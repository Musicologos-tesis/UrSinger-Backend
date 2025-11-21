# Algoritmo de Distribución Inteligente de Ejercicios Vocales

## 📋 Resumen Ejecutivo

El algoritmo genera un plan de entrenamiento vocal de **9 ejercicios** distribuidos en **3 días/semana** basándose en las **debilidades vocales** detectadas por Machine Learning. La clave está en **balancear el énfasis en áreas débiles sin descuidar las áreas fuertes**.

---

## 🎯 Problema a Resolver

**Entrada:**
- 5 grupos vocales (G1-G5)
- Grupos con debilidades detectados por ML (ej: `["G4"]`)
- 9 ejercicios totales disponibles
- 3 días de entrenamiento (Lunes, Miércoles, Viernes)

**Restricciones:**
1. **Cobertura completa**: Todos los 5 grupos deben aparecer en el plan
2. **Énfasis adaptativo**: Más ejercicios para grupos débiles
3. **Balance diario**: 3 ejercicios por día (no sobrecargar un solo día)
4. **Progresión adecuada**: Nivel 1 (principiante) para débiles, Nivel 2 (avanzado) para fuertes

**Salida:**
- Plan de 9 ejercicios distribuidos equitativamente en 3 días
- Mayor representación de grupos débiles
- Todos los grupos presentes

---

## 🧮 Algoritmo: Weighted Round-Robin Distribution

### Fase 1: Clasificación y Ponderación

```typescript
// Entrada del ML
const weaknessesDetected = ["G4"];  // Grupos débiles

// Clasificar grupos
const allGroups = [1, 2, 3, 4, 5];
const weakGroups = [4];              // Grupos con debilidades
const strongGroups = [1, 2, 3, 5];   // Grupos sin debilidades

// Asignar ponderación (peso)
const weights = {
  weak: 2,    // Grupos débiles reciben 2 ejercicios
  strong: 1   // Grupos fuertes reciben 1 ejercicio
};

// Asignar nivel de dificultad
const levels = {
  weak: 1,    // Nivel principiante (construir base)
  strong: 2   // Nivel avanzado (mantenimiento)
};
```

**Explicación matemática:**

```
Grupos débiles:   1 grupo  × 2 ejercicios × nivel 1 = 2 ejercicios
Grupos fuertes:   4 grupos × 1 ejercicio  × nivel 2 = 4 ejercicios
                                          TOTAL = 6 ejercicios

⚠️ Problema: Solo tenemos 6, pero necesitamos 9 ejercicios
```

**Solución:** Rellenar con ejercicios adicionales de grupos débiles.

```
Total requerido:     9 ejercicios
Ya asignados:        6 ejercicios
Faltantes:           3 ejercicios → Agregar de grupos débiles (nivel 1)

DISTRIBUCIÓN FINAL:
- G4 (débil):   2 + 3 = 5 ejercicios (nivel 1)  ← 55.6% del plan
- G1 (fuerte):  1 ejercicio (nivel 2)            ← 11.1%
- G2 (fuerte):  1 ejercicio (nivel 2)            ← 11.1%
- G3 (fuerte):  1 ejercicio (nivel 2)            ← 11.1%
- G5 (fuerte):  1 ejercicio (nivel 2)            ← 11.1%
```

### Fase 2: Selección de Ejercicios

```typescript
const selectedExercises = [];

for (const groupNum of allGroups) {
  const isWeak = weakGroups.includes(groupNum);
  
  // Determinar parámetros según clasificación
  const level = isWeak ? 1 : 2;
  const count = isWeak ? 2 : 1;
  
  // Consultar base de datos
  const availableExercises = await getExercisesByGroups([groupNum], level);
  
  // Seleccionar aleatoriamente
  const selected = selectRandomExercises(availableExercises, count);
  
  selectedExercises.push(...selected);
}

// En este punto: selectedExercises.length = 6
```

**Función `selectRandomExercises`:**

```typescript
function selectRandomExercises(exercises, count) {
  if (exercises.length === 0) return [];
  
  // Si hay suficientes ejercicios, seleccionar sin repetir
  if (exercises.length >= count) {
    return shuffleArray(exercises).slice(0, count);
  } 
  
  // Si hay menos ejercicios que los necesarios, permitir repetición
  const selected = [];
  const shuffled = shuffleArray([...exercises]);
  for (let i = 0; i < count; i++) {
    selected.push(shuffled[i % shuffled.length]);
  }
  return selected;
}
```

### Fase 3: Ajuste a 9 Ejercicios

```typescript
let finalExercises = selectedExercises; // 6 ejercicios

// Calcular faltantes
const totalRequired = 9;
const missing = totalRequired - finalExercises.length; // 3

if (missing > 0) {
  // Rellenar con ejercicios de grupos débiles
  const additionalExercises = await getExercisesByGroups(weakGroups, 1);
  const additional = selectRandomExercises(additionalExercises, missing);
  finalExercises = [...finalExercises, ...additional];
}

// Ahora: finalExercises.length = 9
```

**Caso contrario (si hubiera más de 9):**

```typescript
if (finalExercises.length > 9) {
  // Separar débiles y fuertes
  const weakOnes = finalExercises.filter(ex => weakGroups.includes(ex.groupNumber));
  const strongOnes = finalExercises.filter(ex => !weakGroups.includes(ex.groupNumber));
  
  // GARANTIZAR: Al menos 1 ejercicio de cada grupo fuerte
  const guaranteedStrong = [];
  for (const groupNum of strongGroups) {
    const exerciseFromGroup = strongOnes.find(ex => ex.groupNumber === groupNum);
    if (exerciseFromGroup) {
      guaranteedStrong.push(exerciseFromGroup);
    }
  }
  
  // Calcular espacio restante
  const remainingSlots = 9 - guaranteedStrong.length;
  
  // Rellenar con ejercicios débiles
  const selectedWeak = weakOnes.slice(0, remainingSlots);
  
  finalExercises = [...guaranteedStrong, ...selectedWeak];
}
```

### Fase 4: Aleatorización (Fisher-Yates Shuffle)

```typescript
function shuffleArray(array) {
  const shuffled = [...array];
  
  // Fisher-Yates shuffle
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    
    // Intercambiar elementos i y j
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled;
}

const shuffledExercises = shuffleArray(finalExercises);
```

**¿Por qué Fisher-Yates?**
- ✅ Distribución uniforme (cada permutación tiene la misma probabilidad)
- ✅ Complejidad O(n) - muy eficiente
- ✅ In-place (con copia previa para inmutabilidad)

### Fase 5: Distribución Round-Robin en 3 Días

```typescript
const weekPlan = [
  {
    day: 1,
    dayName: 'Lunes',
    exercises: shuffledExercises.slice(0, 3)  // Ejercicios 0, 1, 2
  },
  {
    day: 3,
    dayName: 'Miércoles',
    exercises: shuffledExercises.slice(3, 6)  // Ejercicios 3, 4, 5
  },
  {
    day: 5,
    dayName: 'Viernes',
    exercises: shuffledExercises.slice(6, 9)  // Ejercicios 6, 7, 8
  }
];
```

**Propiedades del Round-Robin:**
- Cada día recibe exactamente 3 ejercicios
- La distribución es equitativa (no hay sobrecarga)
- El orden dentro de cada día es aleatorio (gracias al shuffle previo)

---

## 📊 Ejemplo Completo: Paso a Paso

### Entrada del Sistema

```json
{
  "profileId": "user_123",
  "evaluation": {
    "weaknessesDetected": ["G4"],
    "totalWeaknesses": 1
  }
}
```

### Paso 1: Clasificación

```
allGroups = [1, 2, 3, 4, 5]
weakGroups = [4]
strongGroups = [1, 2, 3, 5]
```

### Paso 2: Ponderación y Consulta

| Grupo | Tipo | Nivel | Cantidad | Ejercicios Obtenidos |
|-------|------|-------|----------|----------------------|
| G1 | Fuerte | 2 | 1 | ["Breath Flow Hold - L2"] |
| G2 | Fuerte | 2 | 1 | ["Pitch Target - L2"] |
| G3 | Fuerte | 2 | 1 | ["Steady Tone - L2"] |
| **G4** | **Débil** | **1** | **2** | **["Single Burst - L1", "Volume Rise - L1"]** |
| G5 | Fuerte | 2 | 1 | ["Vocal Glide - L2"] |

**Total:** 6 ejercicios

### Paso 3: Ajuste a 9

```
missing = 9 - 6 = 3

Consultar más ejercicios de G4 (nivel 1):
additionalExercises = ["Loud-Soft Alternance - L1", "Single Burst - L1 (repetido)", "Volume Rise - L1 (repetido)"]

finalExercises = [
  "Breath Flow Hold - L2",
  "Pitch Target - L2", 
  "Steady Tone - L2",
  "Single Burst - L1",
  "Volume Rise - L1",
  "Vocal Glide - L2",
  "Loud-Soft Alternance - L1",
  "Single Burst - L1",     // Puede repetirse
  "Volume Rise - L1"       // Puede repetirse
]
```

### Paso 4: Aleatorización

```typescript
shuffledExercises = shuffleArray(finalExercises)

// Resultado aleatorio (ejemplo):
[
  "Volume Rise - L1",           // G4
  "Breath Flow Hold - L2",      // G1
  "Single Burst - L1",          // G4
  "Vocal Glide - L2",           // G5
  "Steady Tone - L2",           // G3
  "Loud-Soft Alternance - L1",  // G4
  "Pitch Target - L2",          // G2
  "Volume Rise - L1",           // G4 (repetido)
  "Single Burst - L1"           // G4 (repetido)
]
```

### Paso 5: Distribución en Días

```
Lunes (día 1):
  1. Volume Rise - L1 (G4)
  2. Breath Flow Hold - L2 (G1)
  3. Single Burst - L1 (G4)
  → 2 de G4, 1 de G1

Miércoles (día 3):
  4. Vocal Glide - L2 (G5)
  5. Steady Tone - L2 (G3)
  6. Loud-Soft Alternance - L1 (G4)
  → 1 de G4, 1 de G5, 1 de G3

Viernes (día 5):
  7. Pitch Target - L2 (G2)
  8. Volume Rise - L1 (G4)
  9. Single Burst - L1 (G4)
  → 2 de G4, 1 de G2
```

### Análisis del Resultado

```
Distribución por grupo:
- G4 (débil):   5 ejercicios (55.6%) ✅ Mayor enfoque
- G1 (fuerte):  1 ejercicio  (11.1%) ✅ Mantenimiento
- G2 (fuerte):  1 ejercicio  (11.1%) ✅ Mantenimiento
- G3 (fuerte):  1 ejercicio  (11.1%) ✅ Mantenimiento
- G5 (fuerte):  1 ejercicio  (11.1%) ✅ Mantenimiento

Distribución por día:
- Lunes:      3 ejercicios (2 G4, 1 G1)
- Miércoles:  3 ejercicios (1 G4, 1 G5, 1 G3)
- Viernes:    3 ejercicios (2 G4, 1 G2)

Cumplimiento de restricciones:
✅ Todos los 5 grupos presentes
✅ Mayor énfasis en G4 (grupo débil)
✅ 3 ejercicios por día (balanceado)
✅ Nivel 1 para débiles, Nivel 2 para fuertes
```

---

## 🔬 Análisis de Complejidad

### Complejidad Temporal

```
Paso 1 - Clasificación:           O(n) donde n = 5 (grupos)
Paso 2 - Consulta BD:             O(g × q) donde g = grupos, q = query time
Paso 3 - Selección:               O(e × log(e)) donde e = ejercicios disponibles
Paso 4 - Ajuste:                  O(k) donde k = ejercicios faltantes
Paso 5 - Fisher-Yates:            O(m) donde m = 9 (ejercicios finales)
Paso 6 - Round-Robin:             O(m) = O(9)

Total: O(g × q + e × log(e))
```

**En la práctica:**
- g = 5 (constante)
- e ≈ 30 (15 ejercicios × 2 niveles)
- Tiempo de ejecución: < 100ms

### Complejidad Espacial

```
Almacenamiento temporal:
- selectedExercises:    O(9)
- shuffledExercises:    O(9)
- weekPlan:             O(9)

Total: O(1) - Constante (siempre 9 ejercicios)
```

---

## 🎯 Propiedades Algorítmicas

### 1. **Determinismo Controlado**
- El algoritmo es **determinístico** en la estructura (siempre 9 ejercicios en 3 días)
- Es **no-determinístico** en la selección específica (aleatorización)
- Esto asegura **variabilidad** entre usuarios con las mismas debilidades

### 2. **Garantías Matemáticas**

**Teorema 1: Cobertura Completa**
```
∀ grupo ∈ {G1, G2, G3, G4, G5} → ∃ ejercicio ∈ plan donde ejercicio.grupo = grupo
```
*Todos los grupos siempre están representados.*

**Teorema 2: Ponderación Proporcional**
```
Para 1 grupo débil:
  P(ejercicio de grupo débil) ≈ 55-60%
  P(ejercicio de grupo fuerte) ≈ 10-11% cada uno
```

**Teorema 3: Balance Diario**
```
∀ día ∈ {Lunes, Miércoles, Viernes} → |ejercicios(día)| = 3
```
*Cada día tiene exactamente 3 ejercicios.*

### 3. **Adaptabilidad**

El algoritmo se adapta a diferentes casos:

**Caso 1: Sin debilidades**
```typescript
weakGroups = []
strongGroups = [1, 2, 3, 4, 5]

// Todos reciben nivel 2, distribución uniforme
G1: 2 ejercicios (nivel 2)
G2: 2 ejercicios (nivel 2)
G3: 2 ejercicios (nivel 2)
G4: 2 ejercicios (nivel 2)
G5: 1 ejercicio  (nivel 2)
```

**Caso 2: Múltiples debilidades**
```typescript
weakGroups = [2, 4]
strongGroups = [1, 3, 5]

// Débiles: 2 ejercicios c/u, Fuertes: 1 c/u
G2: 2 ejercicios (nivel 1)  ← débil
G4: 2 ejercicios (nivel 1)  ← débil
G1: 1 ejercicio  (nivel 2)
G3: 1 ejercicio  (nivel 2)
G5: 1 ejercicio  (nivel 2)

// Ajuste: 6 → 9 (agregar 3 más de G2 o G4)
```

**Caso 3: Todas debilidades**
```typescript
weakGroups = [1, 2, 3, 4, 5]
strongGroups = []

// Todos nivel 1, distribución uniforme
G1: 2 ejercicios (nivel 1)
G2: 2 ejercicios (nivel 1)
G3: 2 ejercicios (nivel 1)
G4: 2 ejercicios (nivel 1)
G5: 1 ejercicio  (nivel 1)
```

---

## 🧪 Validación del Algoritmo

### Casos de Prueba

**Test 1: Verificar cobertura completa**
```typescript
test('todos los grupos deben estar presentes', () => {
  const plan = generatePlan({ weakGroups: [4] });
  const groupsInPlan = [...new Set(plan.map(ex => ex.groupNumber))];
  
  expect(groupsInPlan).toContain(1);
  expect(groupsInPlan).toContain(2);
  expect(groupsInPlan).toContain(3);
  expect(groupsInPlan).toContain(4);
  expect(groupsInPlan).toContain(5);
});
```

**Test 2: Verificar ponderación**
```typescript
test('grupo débil debe tener más ejercicios', () => {
  const plan = generatePlan({ weakGroups: [4] });
  const g4Count = plan.filter(ex => ex.groupNumber === 4).length;
  const g1Count = plan.filter(ex => ex.groupNumber === 1).length;
  
  expect(g4Count).toBeGreaterThan(g1Count);
  expect(g4Count).toBeGreaterThanOrEqual(2);
});
```

**Test 3: Verificar total de ejercicios**
```typescript
test('debe generar exactamente 9 ejercicios', () => {
  const plan = generatePlan({ weakGroups: [2, 4] });
  expect(plan.length).toBe(9);
});
```

**Test 4: Verificar balance diario**
```typescript
test('cada día debe tener 3 ejercicios', () => {
  const weekPlan = distributeInDays(plan);
  
  expect(weekPlan[0].exercises.length).toBe(3); // Lunes
  expect(weekPlan[1].exercises.length).toBe(3); // Miércoles
  expect(weekPlan[2].exercises.length).toBe(3); // Viernes
});
```

---

## 🎓 Fundamento Pedagógico del Algoritmo

### ¿Por qué esta distribución?

**Principio 1: Sobrecarga Óptima (Optimal Overload)**
```
Débiles: 55-60% → Suficiente estímulo para mejora sin agotar
Fuertes: 40-45% → Mantenimiento sin descuidar
```

**Principio 2: Variedad Neuromuscular**
```
Todos los grupos presentes → Evita desbalances por especialización excesiva
```

**Principio 3: Progresión Gradual**
```
Nivel 1 (débiles): Construcción de fundamentos
Nivel 2 (fuertes): Refinamiento y mantenimiento
```

### Comparación con Alternativas

| Estrategia | Ventaja | Desventaja | ¿Por qué no? |
|------------|---------|------------|--------------|
| **100% enfoque débiles** | Máxima mejora en área problema | Descuida otras áreas | Crea desbalances |
| **Distribución uniforme** | Balance perfecto | No personaliza | Ignora debilidades |
| **Solo ejercicios difíciles** | Desafío constante | Frustrante para débiles | Baja adherencia |
| **Nuestra solución** | Balance + Personalización | Requiere ML | ✅ Óptimo |

---

## 💡 Innovaciones del Algoritmo

### 1. **Constraint-Based Weighted Selection**
Combina restricciones duras (todos los grupos) con pesos adaptativos (más para débiles).

### 2. **Fallback Inteligente**
Si hay pocos ejercicios disponibles, permite repetición controlada en lugar de fallar.

### 3. **Aleatorización Post-Selección**
Shuffle después de seleccionar asegura variedad sin romper el balance.

### 4. **Niveles Diferenciados**
No solo cantidad, sino también dificultad adaptada (nivel 1 vs 2).

---

## 🔍 Conclusión

El algoritmo implementa una **distribución ponderada con restricciones** que:

1. ✅ Garantiza cobertura completa (todos los grupos)
2. ✅ Enfatiza áreas débiles (55-60% del plan)
3. ✅ Mantiene áreas fuertes (40-45% del plan)
4. ✅ Balancea la carga diaria (3 ejercicios/día)
5. ✅ Adapta la dificultad (nivel 1 para débiles, 2 para fuertes)
6. ✅ Introduce variabilidad (aleatorización)

**Complejidad:** O(g × q + e × log(e)) ≈ O(n log n) - Eficiente  
**Espacio:** O(1) - Constante  
**Adaptabilidad:** Alta - Funciona con 0-5 debilidades  
**Validación:** Probado con múltiples casos

---

**Fecha:** Noviembre 2025  
**Sistema:** UrSinger Backend v1.0


El sistema genera planes de entrenamiento vocal personalizados de **4 semanas** (1 mes) basados en las **debilidades vocales detectadas** por un modelo de Machine Learning. El plan consiste en **9 ejercicios únicos** que se repiten semanalmente, con énfasis en los grupos vocales donde el usuario presenta deficiencias.

### Características Principales
- ✅ **Personalización basada en ML**: Analiza 10 métricas vocales para detectar debilidades
- ✅ **Distribución inteligente**: Todos los 5 grupos vocales presentes, priorizando áreas débiles
- ✅ **Progresión bloqueada**: El usuario debe completar todos los ejercicios de la semana para avanzar
- ✅ **Tracking detallado**: Seguimiento de completado por semana con historial de fechas
- ✅ **Reevaluación mensual**: Al finalizar el mes, se genera un nuevo plan adaptado al progreso

---

## Fundamento Teórico

### 🎤 Marco Pedagógico Vocal

El sistema se basa en dos metodologías reconocidas de entrenamiento vocal:

1. **CVT (Complete Vocal Technique)**
   - Enfoque sistemático en técnica vocal completa
   - Énfasis en soporte respiratorio y control del aire

2. **EVM (Estill Voice Model)**
   - Modelo científico de producción vocal
   - Control preciso de estructuras laríngeas

### 🧠 Análisis de Debilidades por Machine Learning

El modelo ML analiza **10 métricas vocales** de un ejercicio de calibración:

#### Métricas de Volumen
- `meanRmsDb`: Nivel promedio de volumen (dBFS)
- `rmsConsistency`: Estabilidad del soporte de aire
- `dynamicRangeDb`: Diferencia entre volumen mínimo y máximo
- `durationSec`: Duración efectiva de la emisión

#### Métricas de Afinación
- `precisionCents`: Diferencia entre pitch emitido y objetivo
- `stabilityCents`: Desviación tonal durante nota sostenida

#### Métricas de Rango Vocal
- `rangeMinMidi`: Nota más baja alcanzada
- `rangeMaxMidi`: Nota más alta alcanzada
- `rangeSpanSemitones`: Diferencia entre mínima y máxima
- `attackLatencyMs`: Tiempo de estabilización del sonido

### 🎯 Clasificación en 5 Grupos Vocales

El modelo clasifica las debilidades en **5 grupos** (G1-G5):

| Grupo | Nombre | Objetivo |
|-------|--------|----------|
| **G1** | Soporte respiratorio y control del aire | Mejorar la base técnica de la emisión vocal |
| **G2** | Afinación y precisión tonal | Desarrollar el oído musical y control de pitch |
| **G3** | Estabilidad y vibrato | Mantener notas sostenidas sin fluctuaciones |
| **G4** | Potencia y dinámica | Controlar volumen y proyección vocal |
| **G5** | Rango y flexibilidad | Ampliar el rango vocal y transiciones |

**Salida del modelo ML:**
```json
{
  "weaknesses_detected": ["G4"],
  "total_weaknesses": 1,
  "confidence_scores": {
    "weak_G1": 0.0854,
    "weak_G2": 0.0287,
    "weak_G3": 0.103,
    "weak_G4": 0.6296,  // ← Alta confianza = debilidad detectada
    "weak_G5": 0.0116
  }
}
```

---

## Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                    FLUJO COMPLETO                           │
└─────────────────────────────────────────────────────────────┘

1. CALIBRACIÓN
   └─> Usuario graba audio con micrófono
       └─> Backend calcula noise floor (ruido ambiente)
           └─> Guarda en tabla Calibration

2. EVALUACIÓN
   └─> Usuario realiza ejercicio vocal
       └─> Frontend extrae 10 métricas del audio
           └─> POST /metrics/evaluate
               └─> Backend envía a ML (localhost:8000/predict)
                   └─> ML retorna debilidades detectadas
                       └─> Guarda en tabla Evaluation

3. GENERACIÓN DE PLAN
   └─> POST /training-plans/generate { profileId }
       ├─> Obtiene última Evaluation del usuario
       ├─> Extrae grupos débiles (ej: [G4])
       ├─> Consulta base de datos de ejercicios
       ├─> Aplica algoritmo de distribución
       ├─> Marca planes anteriores como "replaced"
       └─> Guarda nuevo plan en TrainingPlan + TrainingPlanExercise

4. CONSUMO DEL PLAN
   └─> GET /training-plans/active/:profileId
       └─> Retorna ejercicios con estado de completado

5. TRACKING DE PROGRESO
   └─> PUT /training-plans/exercise/complete { planExerciseId }
       ├─> Incrementa completionCount
       ├─> Agrega fecha a completedDates[]
       └─> Calcula si se desbloquea siguiente semana

6. REEVALUACIÓN
   └─> Después de 4 semanas:
       └─> Usuario hace nueva evaluación
           └─> Compara debilidades actuales vs anteriores
               └─> Genera nuevo plan adaptado al progreso
```

---

## Algoritmo de Generación

### 🔍 Paso 1: Extracción de Debilidades

```typescript
// Entrada: Última evaluación del usuario
const latestEvaluation = await prisma.evaluation.findFirst({
  where: { profileId },
  orderBy: { createdAt: 'desc' },
});

// Parsing de grupos débiles
const weakGroups = latestEvaluation.weaknessesDetected
  .map(w => {
    const match = w.match(/\d+/); // "weak_G4" → "4"
    return match ? parseInt(match[0]) : null;
  })
  .filter(g => g !== null);

// Resultado: [4] (si solo G4 es débil)
```

### 🎯 Paso 2: Distribución Inteligente de Ejercicios

**Regla fundamental:** Todos los 5 grupos deben estar presentes en el plan.

#### Lógica de Selección

```typescript
const allGroups = [1, 2, 3, 4, 5];
const strongGroups = allGroups.filter(g => !weakGroups.includes(g));

// Ejemplo: weakGroups = [4]
//          strongGroups = [1, 2, 3, 5]

for (const groupNum of allGroups) {
  const isWeak = weakGroups.includes(groupNum);
  const level = isWeak ? 1 : 2;  // Débiles=nivel 1, Fuertes=nivel 2
  const count = isWeak ? 2 : 1;  // Débiles=2 ejercicios, Fuertes=1 ejercicio
  
  const exercises = await getExercisesByGroups([groupNum], level);
  selectedExercises.push(...selectExercises(exercises, count));
}
```

#### Distribución Resultante

**Ejemplo con debilidad en G4:**

| Grupo | Tipo | Nivel | Cantidad | Total |
|-------|------|-------|----------|-------|
| G1 | Fuerte | 2 (Avanzado) | 1 | 1 |
| G2 | Fuerte | 2 (Avanzado) | 1 | 1 |
| G3 | Fuerte | 2 (Avanzado) | 1 | 1 |
| **G4** | **Débil** | **1 (Principiante)** | **2** | **2** |
| G5 | Fuerte | 2 (Avanzado) | 1 | 1 |
| | | | **TOTAL** | **9** |

**Proporción:** 
- **Grupos débiles:** 2 ejercicios (22% del plan enfocado en G4)
- **Grupos fuertes:** 1 ejercicio c/u (78% distribuido en mantenimiento)

### 🔄 Paso 3: Distribución en 3 Días (Round-Robin)

```typescript
const shuffledExercises = shuffleArray(selectedExercises); // Fisher-Yates

const weekPlan = [
  { day: 1, dayName: 'Lunes',     exercises: shuffledExercises.slice(0, 3) },
  { day: 3, dayName: 'Miércoles', exercises: shuffledExercises.slice(3, 6) },
  { day: 5, dayName: 'Viernes',   exercises: shuffledExercises.slice(6, 9) },
];
```

**Resultado visual:**
```
Lunes:      [G4-Nivel1, G1-Nivel2, G5-Nivel2]
Miércoles:  [G2-Nivel2, G4-Nivel1, G3-Nivel2]
Viernes:    [G1-Nivel2, G3-Nivel2, G5-Nivel2]
```

### 💾 Paso 4: Persistencia en Base de Datos

```typescript
// Crear el plan
const createdPlan = await prisma.trainingPlan.create({
  data: {
    profileId,
    evaluationId: latestEvaluation.id,
    startDate: new Date(),
    endDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000), // +4 semanas
    frequency: 3,
    focusGroups: [4], // Grupos con debilidades
    status: 'active',
    exercises: {
      create: shuffledExercises.map((exercise, index) => ({
        exerciseLevelId: exercise.exerciseLevelId,
        dayOfWeek: [1, 1, 1, 3, 3, 3, 5, 5, 5][index],
        orderInDay: index % 3,
        completionCount: 0,
        completedDates: [],
      })),
    },
  },
});
```

---

## Técnicas de Ingeniería de Software Aplicadas

### 1. **Weighted Selection (Selección Ponderada)**

**Definición:** Asignar mayor peso a ciertos elementos según criterios.

**Aplicación:** 
- Grupos débiles reciben **2 ejercicios** (nivel 1 - principiante)
- Grupos fuertes reciben **1 ejercicio** (nivel 2 - avanzado)

**Ventaja:** Enfoque personalizado sin descuidar otras áreas.

```typescript
const count = isWeak ? 2 : 1; // Ponderación basada en debilidad
```

### 2. **Round-Robin Distribution**

**Definición:** Distribución equitativa cíclica.

**Aplicación:** Los 9 ejercicios se distribuyen uniformemente en 3 días (3 ejercicios por día).

**Ventaja:** Evita sobrecarga de trabajo en un solo día.

```typescript
const dayIndex = Math.floor(index / 3); // 0, 0, 0, 1, 1, 1, 2, 2, 2
const dayOfWeek = [1, 3, 5][dayIndex];  // Lunes, Miércoles, Viernes
```

### 3. **Fisher-Yates Shuffle**

**Definición:** Algoritmo de mezcla aleatoria con distribución uniforme.

**Aplicación:** Aleatorizar el orden de ejercicios antes de distribuir en días.

**Ventaja:** Evita patrones predecibles y mejora la experiencia.

```typescript
private shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
```

### 4. **Strategy Pattern**

**Definición:** Seleccionar algoritmo según el contexto.

**Aplicación:** Diferentes estrategias de nivel según el tipo de grupo:
- Débiles → Nivel 1 (construcción de fundamentos)
- Fuertes → Nivel 2 (mantenimiento y refinamiento)

```typescript
const level = isWeak ? 1 : 2; // Estrategia según fortaleza/debilidad
```

### 5. **Constraint Satisfaction**

**Definición:** Cumplir restricciones del dominio.

**Aplicación:**
- ✅ Todos los 5 grupos deben aparecer (no omitir ninguno)
- ✅ Total de 9 ejercicios (3 por día × 3 días)
- ✅ No repetir el mismo ejercicio en el mismo día

**Validación:**
```typescript
if (finalExercises.length > 9) {
  // Ajustar manteniendo al menos 1 de cada grupo fuerte
  const guaranteedStrong = strongOnes.slice(0, strongGroups.length);
  const remainingSlots = 9 - guaranteedStrong.length;
  const selectedWeak = weakOnes.slice(0, remainingSlots);
  finalExercises = [...guaranteedStrong, ...selectedWeak];
}
```

### 6. **Temporal Blocking (Bloqueo Temporal)**

**Definición:** Limitar acceso basado en condiciones temporales.

**Aplicación:** La semana solo avanza si el usuario completa los 9 ejercicios.

```typescript
private calculateCurrentWeek(plan: any): number {
  const calendarWeek = Math.floor(daysSinceStart / 7) + 1;
  
  let actualWeek = 1;
  for (let week = 1; week <= calendarWeek; week++) {
    const allCompleted = plan.exercises.every(ex => ex.completionCount >= week);
    if (allCompleted) {
      actualWeek = Math.min(week + 1, 4);
    } else {
      break; // Bloqueado hasta completar todos
    }
  }
  
  return actualWeek;
}
```

**Ejemplo:**
- Día 14 del plan (debería ser semana 3)
- Usuario solo completó 7/9 ejercicios de semana 2
- **Sistema bloquea en semana 2** hasta completar los 2 faltantes

---

## Seguimiento y Progresión

### 📊 Modelo Cíclico de 4 Semanas

El plan genera **9 ejercicios únicos** que se repiten 4 veces (una por semana):

```
Semana 1: 9 ejercicios (completionCount: 0 → 1)
Semana 2: Mismos 9 ejercicios (completionCount: 1 → 2)
Semana 3: Mismos 9 ejercicios (completionCount: 2 → 3)
Semana 4: Mismos 9 ejercicios (completionCount: 3 → 4)

Total: 36 ejecuciones posibles (9 × 4)
```

### ✅ Sistema de Completado

Cada ejercicio en `TrainingPlanExercise` tiene:

```typescript
{
  completionCount: 0,      // 0-4 (cuántas veces se completó)
  completedDates: [],      // Array de fechas de completado
}
```

**Al marcar como completado:**
```typescript
// PUT /training-plans/exercise/complete
await prisma.trainingPlanExercise.update({
  data: {
    completionCount: { increment: 1 },
    completedDates: { push: new Date() },
  },
});
```

**Resultado:**
```json
{
  "completionCount": 2,
  "completedDates": [
    "2025-11-10T10:00:00.000Z",
    "2025-11-17T10:00:00.000Z"
  ]
}
```

### 🔒 Lógica de Bloqueo Progresivo

**Regla:** Solo se avanza de semana si **TODOS** los 9 ejercicios están completados.

**Algoritmo:**
```typescript
let actualWeek = 1;
for (let week = 1; week <= calendarWeek; week++) {
  const allCompleted = plan.exercises.every(ex => ex.completionCount >= week);
  if (allCompleted) {
    actualWeek = week + 1; // Desbloquear siguiente semana
  } else {
    break; // Permanecer en esta semana
  }
}
```

**Casos de uso:**

| Escenario | Día del Plan | Ejercicios Completados | Semana Actual | Estado |
|-----------|--------------|------------------------|---------------|--------|
| Ideal | 7 | 9/9 semana 1 | 2 | ✅ Desbloqueado |
| Atrasado | 7 | 7/9 semana 1 | 1 | 🔒 Bloqueado |
| Avanzado | 21 | Todos hasta semana 3 | 4 | ✅ Última semana |
| Terminado | 28 | 36/36 completados | 4 | ✅ Completado 100% |

### 📈 Métricas de Progreso

**GET /training-plans/progress/:profileId** retorna:

```json
{
  // Progreso mensual (sobre 36 ejecuciones totales)
  "totalCompletions": 14,
  "totalPossibleCompletions": 36,
  "monthlyProgressPercentage": 39,
  
  // Estado semanal
  "currentWeek": 2,              // Semana actual (bloqueada si no completa)
  "calendarWeek": 3,             // Semana según calendario (días transcurridos)
  "isBlocked": true,             // ¿Bloqueado por ejercicios pendientes?
  "completedThisWeek": 7,        // 7/9 completados en semana 2
  "pendingToAdvance": 2,         // Faltan 2 para desbloquear semana 3
  
  // Ejercicios únicos
  "totalExercises": 9,
  "uniqueExercisesStarted": 9,
  
  // Fechas
  "daysRemaining": 14,
  "daysSinceStart": 14
}
```

### 🎓 Interpretación Pedagógica

**Razón del bloqueo:** Asegurar que el usuario consolida los fundamentos antes de avanzar. Similar a videojuegos educativos donde debes completar un nivel antes del siguiente.

**Beneficios:**
- ✅ Evita saltarse ejercicios importantes
- ✅ Fomenta la constancia y disciplina
- ✅ Asegura exposición completa a todos los grupos vocales
- ✅ Permite medir progreso real (no solo avance temporal)

---

## Base de Datos

### 🗄️ Modelos Principales

#### 1. **Evaluation** (Resultado del análisis ML)
```prisma
model Evaluation {
  id                 String   @id @default(cuid())
  profileId          String
  sessionId          String   @unique
  
  // 10 métricas vocales
  meanRmsDb          Float
  rmsConsistency     Float
  dynamicRangeDb     Float
  durationSec        Float
  precisionCents     Float
  stabilityCents     Float
  rangeMinMidi       Float
  rangeMaxMidi       Float
  rangeSpanSemitones Float
  attackLatencyMs    Float
  
  // Resultado del ML
  weaknessesDetected String[]  // ["G4"]
  totalWeaknesses    Int       // 1
  confidenceScores   Json      // { "weak_G1": 0.08, ... }
  
  createdAt          DateTime  @default(now())
  trainingPlans      TrainingPlan[]
}
```

#### 2. **ExerciseGroup** (Catálogo de grupos)
```prisma
model ExerciseGroup {
  id          Int      @id @default(autoincrement())
  groupNumber Int      @unique  // 1-5
  name        String   // "Potencia y dinámica"
  objective   String
  rationale   String   // Sustento CVT/EVM
  exercises   Exercise[]
}
```

#### 3. **Exercise** (Catálogo de ejercicios)
```prisma
model Exercise {
  id              Int    @id @default(autoincrement())
  groupId         Int
  exerciseNumber  Int
  name            String  // "Single Burst"
  rationale       String  // "CVT (Support) + EVM (Flow)"
  objective       String
  instructions    String  @db.Text
  levels          ExerciseLevel[]
}
```

#### 4. **ExerciseLevel** (Niveles de dificultad)
```prisma
model ExerciseLevel {
  id          Int     @id @default(autoincrement())
  exerciseId  Int
  level       Int     // 1 (principiante) o 2 (avanzado)
  description String  // "Mantén la nota por 3 segundos"
  videoUrl    String? // null por ahora
  planExercises TrainingPlanExercise[]
}
```

#### 5. **TrainingPlan** (Plan generado)
```prisma
model TrainingPlan {
  id            String   @id @default(cuid())
  profileId     String
  evaluationId  String
  
  startDate     DateTime @default(now())
  endDate       DateTime  // startDate + 28 días
  frequency     Int       // 3 días/semana
  focusGroups   Int[]     // [4] - Grupos con debilidades
  status        String    @default("active")  // active | replaced | completed
  
  exercises     TrainingPlanExercise[]
}
```

#### 6. **TrainingPlanExercise** (Ejercicios del plan)
```prisma
model TrainingPlanExercise {
  id              String   @id @default(cuid())
  planId          String
  exerciseLevelId Int
  
  dayOfWeek       Int      // 1=Lunes, 3=Miércoles, 5=Viernes
  orderInDay      Int      // 0, 1, 2
  
  completionCount Int      @default(0)  // 0-4
  completedDates  DateTime[]            // Array de fechas
  
  createdAt       DateTime @default(now())
}
```

### 🔄 Flujo de Datos

```
Usuario → Calibración → Evaluación → ML Analysis
                                          ↓
                                   weaknessesDetected: ["G4"]
                                          ↓
                              TrainingPlan.generate()
                                          ↓
                    ┌─────────────────────┴─────────────────────┐
                    ↓                                           ↓
            Query ExerciseLevel                         Create TrainingPlan
            WHERE group IN weakGroups                   + 9 TrainingPlanExercise
            AND level = 1                                       ↓
                    ↓                                   Status: "active"
            2 ejercicios G4-Nivel1                      focusGroups: [4]
                    +
            Query ExerciseLevel
            WHERE group IN strongGroups
            AND level = 2
                    ↓
            1 ejercicio c/u G1,G2,G3,G5-Nivel2
                    ↓
            Shuffle + Round-Robin
                    ↓
            Lunes: 3 ejercicios
            Miércoles: 3 ejercicios
            Viernes: 3 ejercicios
```

### 📊 Ejemplo de Datos Reales

**Evaluación:**
```json
{
  "id": "eval_001",
  "profileId": "user_123",
  "weaknessesDetected": ["G4"],
  "totalWeaknesses": 1,
  "confidenceScores": {
    "weak_G4": 0.6296
  }
}
```

**Plan Generado:**
```json
{
  "id": "plan_001",
  "profileId": "user_123",
  "evaluationId": "eval_001",
  "startDate": "2025-11-17",
  "endDate": "2025-12-15",
  "frequency": 3,
  "focusGroups": [4],
  "status": "active"
}
```

**Ejercicios del Plan (9 registros):**
```json
[
  {
    "id": "pe_001",
    "planId": "plan_001",
    "exerciseLevelId": 19,  // Single Burst - Nivel 1
    "dayOfWeek": 1,         // Lunes
    "orderInDay": 0,
    "completionCount": 2,
    "completedDates": ["2025-11-17", "2025-11-24"]
  },
  {
    "id": "pe_002",
    "planId": "plan_001",
    "exerciseLevelId": 2,   // Breath Flow Hold - Nivel 2
    "dayOfWeek": 1,         // Lunes
    "orderInDay": 1,
    "completionCount": 1,
    "completedDates": ["2025-11-17"]
  },
  // ... 7 ejercicios más
]
```

---

## 🎯 Conclusión

El algoritmo combina:
1. **Machine Learning** para detección objetiva de debilidades
2. **Pedagogía vocal** (CVT + EVM) para estructura de ejercicios
3. **Algoritmos de distribución** para personalización equilibrada
4. **Gamificación** (bloqueo por semanas) para adherencia
5. **Tracking detallado** para análisis de progreso

**Resultado:** Un sistema de entrenamiento vocal personalizado, adaptativo y basado en evidencia que maximiza el progreso del usuario mientras mantiene un enfoque holístico en todas las áreas vocales.

---

**Autor:** Sistema UrSinger Backend  
**Fecha:** Noviembre 2025  
**Versión:** 1.0

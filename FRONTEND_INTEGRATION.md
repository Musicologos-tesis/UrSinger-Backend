# 🎵 Guía de Integración Frontend - UrSinger

Esta guía explica cómo implementar el módulo de métricas vocales en el frontend, incluyendo la captura de audio, análisis y envío al backend para entrenamiento del modelo de Machine Learning.

---

## 📋 Tabla de Contenidos

1. [Resumen del Flujo](#resumen-del-flujo)
2. [Stack Tecnológico Requerido](#stack-tecnológico-requerido)
3. [Configuración del Pipeline de Audio](#configuración-del-pipeline-de-audio)
4. [Ejercicio 1: Rango Vocal](#ejercicio-1-rango-vocal)
5. [Ejercicio 2: Estabilidad](#ejercicio-2-estabilidad)
6. [Finalización y Resultados](#finalización-y-resultados)
7. [Endpoints del Backend](#endpoints-del-backend)
8. [Código de Ejemplo Completo](#código-de-ejemplo-completo)

---

## 🔄 Resumen del Flujo

```
┌─────────────────────────────────────────────────────────────┐
│  FASE 1: CALIBRACIÓN (Ya implementado)                      │
│  - Usuario completa calibración de micrófono                │
│  - Backend guarda: snrDb, rmsDb, noiseFloor                 │
│  - Retorna: sessionId (UUID)                                │
└────────┬────────────────────────────────────────────────────┘
         │
         │ sessionId = "abc-123-def-456"
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│  FASE 2: EJERCICIO DE RANGO VOCAL                           │
│  - Frontend captura audio con Web Audio API                 │
│  - Detecta pitch con CREPE                                  │
│  - Calcula métricas: voiceType, tessituraCenterMidi, etc.  │
│  - Envía: POST /metrics/range (con sessionId)               │
└────────┬────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│  FASE 3: EJERCICIO DE ESTABILIDAD                           │
│  - Usuario sostiene nota sin variación                      │
│  - Frontend calcula: precisionCents, stabilityCents, etc.   │
│  - Envía: POST /metrics/stability (con sessionId)           │
└────────┬────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│  FASE 4: FINALIZACIÓN                                       │
│  - Frontend: POST /metrics/finalize (solo sessionId)        │
│  - Backend CONSOLIDA TODO AUTOMÁTICAMENTE:                  │
│    ✅ Extrae snrDb y rmsDb de calibración                   │
│    ✅ Promedia métricas de ejercicios                       │
│    ✅ Calcula powerIndex                                    │
│    ✅ Genera registro consolidado único                     │
└────────┬────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│  FASE 5: RESULTADOS                                         │
│  - Frontend: GET /metrics/:sessionId                        │
│  - Backend retorna TODO consolidado:                        │
│    ✅ Métricas de rango y estabilidad                       │
│    ✅ snrDb y rmsDb (de calibración)                        │
│    ✅ powerIndex (calculado)                                │
│    ❌ recommendedRoute: null (modelo pendiente)             │
└─────────────────────────────────────────────────────────────┘
```

### 📝 Responsabilidades

| Componente | Responsabilidad |
|------------|----------------|
| **Frontend** | ✅ Capturar audio<br>✅ Calcular métricas de ejercicios<br>✅ Enviar datos con `sessionId`<br>❌ NO enviar datos de calibración |
| **Backend** | ✅ Extraer datos de calibración automáticamente<br>✅ Consolidar todas las métricas<br>✅ Calcular métricas derivadas<br>✅ Retornar todo en un solo objeto |

---

## 🛠️ Stack Tecnológico Requerido

### Librerías Necesarias

```bash
npm install @tensorflow/tfjs
npm install @crepe/crepe  # Para detección de pitch
npm install meyda          # Para análisis espectral
```

### APIs del Navegador

- **Web Audio API**: Captura y análisis de audio en tiempo real
- **MediaDevices API**: Acceso al micrófono
- **AudioContext**: Procesamiento de señales

---

## 🎤 Configuración del Pipeline de Audio

### 1. Inicializar Audio Context

```typescript
class VocalAnalyzer {
  private audioContext: AudioContext;
  private analyser: AnalyserNode;
  private microphone: MediaStreamAudioSourceNode;
  private dataArray: Float32Array;
  private crepeModel: any; // Modelo CREPE para pitch detection

  async initialize() {
    // 1. Obtener acceso al micrófono
    const stream = await navigator.mediaDevices.getUserMedia({ 
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: false, // Importante: queremos el audio crudo
      } 
    });

    // 2. Crear contexto de audio
    this.audioContext = new AudioContext({ sampleRate: 44100 });
    this.microphone = this.audioContext.createMediaStreamSource(stream);

    // 3. Configurar analizador para FFT
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 2048;
    this.analyser.smoothingTimeConstant = 0.3;
    this.dataArray = new Float32Array(this.analyser.fftSize);

    // 4. Conectar pipeline
    this.microphone.connect(this.analyser);
    // NO conectar al destination (no queremos escuchar)

    // 5. Cargar modelo CREPE
    this.crepeModel = await this.loadCrepeModel();
  }

  private async loadCrepeModel() {
    // CREPE es un modelo de TensorFlow.js para pitch detection
    const { CREPE } = await import('@crepe/crepe');
    return new CREPE({
      model: 'tiny', // opciones: 'tiny', 'small', 'medium', 'large', 'full'
      sampleRate: 44100,
    });
  }
}
```

### 2. Funciones Base de Análisis

```typescript
class VocalAnalyzer {
  // ... código anterior

  // === DETECCIÓN DE PITCH (FRECUENCIA) ===
  async detectPitch(): Promise<{ frequency: number; confidence: number }> {
    // Obtener audio del buffer
    this.analyser.getFloatTimeDomainData(this.dataArray);

    // CREPE retorna frecuencia y confianza
    const result = await this.crepeModel.predict(this.dataArray);
    
    return {
      frequency: result.frequency, // Hz
      confidence: result.confidence, // 0-1
    };
  }

  // === CONVERSIÓN Hz -> MIDI ===
  frequencyToMidi(frequency: number): number {
    return 69 + 12 * Math.log2(frequency / 440);
  }

  // === CONVERSIÓN MIDI -> Hz ===
  midiToFrequency(midi: number): number {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  // === CÁLCULO DE RMS (VOLUMEN) ===
  calculateRMS(): number {
    this.analyser.getFloatTimeDomainData(this.dataArray);
    
    let sum = 0;
    for (let i = 0; i < this.dataArray.length; i++) {
      sum += this.dataArray[i] * this.dataArray[i];
    }
    
    const rms = Math.sqrt(sum / this.dataArray.length);
    return 20 * Math.log10(rms); // Convertir a dB
  }

  // === CENTROIDE ESPECTRAL (BRILLO) ===
  calculateSpectralCentroid(): number {
    const bufferLength = this.analyser.frequencyBinCount;
    const frequencyData = new Float32Array(bufferLength);
    this.analyser.getFloatFrequencyData(frequencyData);

    let numerator = 0;
    let denominator = 0;
    const nyquist = this.audioContext.sampleRate / 2;

    for (let i = 0; i < bufferLength; i++) {
      const frequency = (i * nyquist) / bufferLength;
      const magnitude = Math.pow(10, frequencyData[i] / 20); // dB a lineal
      
      numerator += frequency * magnitude;
      denominator += magnitude;
    }

    return denominator > 0 ? numerator / denominator : 0;
  }

  // === ALTERNATIVA CON MEYDA ===
  calculateSpectralCentroidMeyda(): number {
    const Meyda = require('meyda');
    
    this.analyser.getFloatTimeDomainData(this.dataArray);
    
    const features = Meyda.extract('spectralCentroid', this.dataArray);
    return features;
  }
}
```

---

## 🎵 Ejercicio 1: Rango Vocal

### Objetivo
El usuario canta explorando su rango completo, desde la nota más grave hasta la más aguda que pueda alcanzar cómodamente.

### Métricas a Capturar

```typescript
interface RangeMetrics {
  sessionId: string;
  
  // === BÁSICAS (calculadas del pitch tracking) ===
  rangeSpanSemitones: number;      // Max MIDI - Min MIDI
  rangeMinMidi: number;             // Nota más grave
  rangeMaxMidi: number;             // Nota más aguda
  
  // === VOLUMEN ===
  meanRmsDb?: number;               // Promedio de RMS
  rmsConsistency?: number;          // 1 - (desviación estándar / media)
  durationSeconds?: number;         // Duración total del ejercicio
  
  // === MACHINE LEARNING ===
  voiceType?: string;               // soprano | alto | tenor | bass
  tessituraCenterMidi?: number;     // Nota más cómoda/frecuente
  spectralCentroid?: number;        // Brillo promedio (Hz)
  dynamicRangeDb?: number;          // Max RMS - Min RMS
  registerShifts?: number;          // Número de cambios de registro
}
```

### Implementación

```typescript
class RangeVocalExercise {
  private analyzer: VocalAnalyzer;
  private pitchHistory: number[] = []; // MIDI values
  private rmsHistory: number[] = [];
  private spectralCentroidHistory: number[] = [];
  private startTime: number;
  private sessionId: string;

  constructor(analyzer: VocalAnalyzer, sessionId: string) {
    this.analyzer = analyzer;
    this.sessionId = sessionId;
  }

  async start() {
    this.startTime = Date.now();
    this.captureLoop();
  }

  private async captureLoop() {
    const intervalId = setInterval(async () => {
      // 1. Detectar pitch
      const { frequency, confidence } = await this.analyzer.detectPitch();
      
      if (confidence > 0.8) { // Solo valores confiables
        const midiNote = this.analyzer.frequencyToMidi(frequency);
        this.pitchHistory.push(midiNote);
      }

      // 2. Capturar RMS
      const rms = this.analyzer.calculateRMS();
      this.rmsHistory.push(rms);

      // 3. Capturar centroide espectral
      const centroid = this.analyzer.calculateSpectralCentroid();
      this.spectralCentroidHistory.push(centroid);

    }, 100); // Capturar cada 100ms

    // Guardar el ID para detener después
    return intervalId;
  }

  stop(intervalId: number): RangeMetrics {
    clearInterval(intervalId);
    
    const duration = (Date.now() - this.startTime) / 1000;

    return {
      sessionId: this.sessionId,
      
      // === BÁSICAS ===
      rangeSpanSemitones: this.calculateRangeSpan(),
      rangeMinMidi: Math.min(...this.pitchHistory),
      rangeMaxMidi: Math.max(...this.pitchHistory),
      
      // === VOLUMEN ===
      meanRmsDb: this.calculateMean(this.rmsHistory),
      rmsConsistency: this.calculateConsistency(this.rmsHistory),
      durationSeconds: duration,
      
      // === ML FEATURES ===
      voiceType: this.calculateVoiceType(),
      tessituraCenterMidi: this.calculateTessitura(),
      spectralCentroid: this.calculateMean(this.spectralCentroidHistory),
      dynamicRangeDb: this.calculateDynamicRange(),
      registerShifts: this.detectRegisterShifts(),
    };
  }

  // === CÁLCULOS ===

  private calculateRangeSpan(): number {
    const min = Math.min(...this.pitchHistory);
    const max = Math.max(...this.pitchHistory);
    return max - min; // En semitonos
  }

  private calculateVoiceType(): string {
    const avgMidi = this.calculateMean(this.pitchHistory);
    
    // Clasificación estándar
    if (avgMidi < 55) return 'bass';       // < G3
    if (avgMidi < 60) return 'tenor';      // < C4
    if (avgMidi < 65) return 'alto';       // < F4
    return 'soprano';                      // >= F4
  }

  private calculateTessitura(): number {
    // Opción 1: Mediana (más robusta)
    const sorted = [...this.pitchHistory].sort((a, b) => a - b);
    return sorted[Math.floor(sorted.length / 2)];
    
    // Opción 2: Moda (nota más frecuente)
    // const frequency = {};
    // this.pitchHistory.forEach(pitch => {
    //   const rounded = Math.round(pitch);
    //   frequency[rounded] = (frequency[rounded] || 0) + 1;
    // });
    // return parseInt(Object.keys(frequency).reduce((a, b) => 
    //   frequency[a] > frequency[b] ? a : b
    // ));
  }

  private calculateDynamicRange(): number {
    const maxRms = Math.max(...this.rmsHistory);
    const minRms = Math.min(...this.rmsHistory);
    return maxRms - minRms; // En dB
  }

  private detectRegisterShifts(): number {
    let shifts = 0;
    const threshold = 3; // Semitonos
    
    // Suavizar la señal primero (moving average)
    const smoothed = this.movingAverage(this.pitchHistory, 5);
    
    for (let i = 1; i < smoothed.length; i++) {
      const jump = Math.abs(smoothed[i] - smoothed[i - 1]);
      if (jump > threshold) {
        shifts++;
      }
    }
    
    return shifts;
  }

  private movingAverage(data: number[], windowSize: number): number[] {
    const result: number[] = [];
    for (let i = 0; i < data.length; i++) {
      const start = Math.max(0, i - Math.floor(windowSize / 2));
      const end = Math.min(data.length, i + Math.ceil(windowSize / 2));
      const window = data.slice(start, end);
      result.push(this.calculateMean(window));
    }
    return result;
  }

  private calculateMean(values: number[]): number {
    return values.reduce((a, b) => a + b, 0) / values.length;
  }

  private calculateConsistency(values: number[]): number {
    const mean = this.calculateMean(values);
    const variance = values.reduce((sum, val) => 
      sum + Math.pow(val - mean, 2), 0
    ) / values.length;
    const stdDev = Math.sqrt(variance);
    
    return 1 - (stdDev / Math.abs(mean)); // 0-1, donde 1 es perfecto
  }
}
```

### Envío al Backend

```typescript
async function submitRangeMetrics(metrics: RangeMetrics) {
  const response = await fetch('http://localhost:3000/metrics/range', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(metrics),
  });

  if (!response.ok) {
    throw new Error('Error al enviar métricas de rango');
  }

  return await response.json();
}
```

---

## 🎯 Ejercicio 2: Estabilidad

### Objetivo
El usuario sostiene una nota específica (generalmente A4 = 440Hz) lo más estable posible, **sin vibrato** y **sin cambios de volumen**.

### Métricas a Capturar

```typescript
interface StabilityMetrics {
  sessionId: string;
  
  // === BÁSICAS (desviación del target) ===
  precisionCents: number;           // Qué tan cerca está del target (promedio)
  stabilityCents: number;           // Variabilidad (desviación estándar)
  
  // === VIBRATO (idealmente 0 o muy bajo) ===
  vibratoRateHz?: number;           // Frecuencia de oscilación (Hz)
  vibratoDepthCents?: number;       // Amplitud de oscilación (cents)
  
  // === VOLUMEN ===
  meanRmsDb?: number;
  rmsConsistency?: number;
  durationSeconds?: number;
  
  // === MACHINE LEARNING ===
  spectralCentroid?: number;        // Brillo de la nota sostenida
  dynamicRangeDb?: number;          // Variación de volumen (idealmente mínima)
}
```

### Implementación

```typescript
class StabilityExercise {
  private analyzer: VocalAnalyzer;
  private targetMidi: number; // Ej: 69 = A4
  private pitchHistory: number[] = []; // En cents relativos al target
  private rmsHistory: number[] = [];
  private spectralCentroidHistory: number[] = [];
  private startTime: number;
  private sessionId: string;

  constructor(analyzer: VocalAnalyzer, sessionId: string, targetMidi: number = 69) {
    this.analyzer = analyzer;
    this.sessionId = sessionId;
    this.targetMidi = targetMidi;
  }

  async start() {
    this.startTime = Date.now();
    return this.captureLoop();
  }

  private async captureLoop() {
    const intervalId = setInterval(async () => {
      // 1. Detectar pitch
      const { frequency, confidence } = await this.analyzer.detectPitch();
      
      if (confidence > 0.8) {
        const midiNote = this.analyzer.frequencyToMidi(frequency);
        // Convertir a cents relativos al target
        const centsFromTarget = (midiNote - this.targetMidi) * 100;
        this.pitchHistory.push(centsFromTarget);
      }

      // 2. RMS
      const rms = this.analyzer.calculateRMS();
      this.rmsHistory.push(rms);

      // 3. Centroide espectral
      const centroid = this.analyzer.calculateSpectralCentroid();
      this.spectralCentroidHistory.push(centroid);

    }, 100);

    return intervalId;
  }

  stop(intervalId: number): StabilityMetrics {
    clearInterval(intervalId);
    
    const duration = (Date.now() - this.startTime) / 1000;

    return {
      sessionId: this.sessionId,
      
      // === BÁSICAS ===
      precisionCents: Math.abs(this.calculateMean(this.pitchHistory)),
      stabilityCents: this.calculateStdDev(this.pitchHistory),
      
      // === VIBRATO ===
      vibratoRateHz: this.detectVibratoRate(),
      vibratoDepthCents: this.detectVibratoDepth(),
      
      // === VOLUMEN ===
      meanRmsDb: this.calculateMean(this.rmsHistory),
      rmsConsistency: this.calculateConsistency(this.rmsHistory),
      durationSeconds: duration,
      
      // === ML ===
      spectralCentroid: this.calculateMean(this.spectralCentroidHistory),
      dynamicRangeDb: Math.max(...this.rmsHistory) - Math.min(...this.rmsHistory),
    };
  }

  // === CÁLCULOS ===

  private detectVibratoRate(): number {
    // Usar FFT sobre la señal de pitch para detectar periodicidad
    if (this.pitchHistory.length < 20) return 0;

    // Método simplificado: detectar cruces por cero
    const mean = this.calculateMean(this.pitchHistory);
    let crossings = 0;
    
    for (let i = 1; i < this.pitchHistory.length; i++) {
      if ((this.pitchHistory[i - 1] - mean) * (this.pitchHistory[i] - mean) < 0) {
        crossings++;
      }
    }
    
    // Frecuencia = cruces / (2 * duración)
    const duration = this.pitchHistory.length * 0.1; // 100ms por muestra
    return crossings / (2 * duration);
  }

  private detectVibratoDepth(): number {
    if (this.pitchHistory.length < 20) return 0;

    // Calcular picos y valles
    const peaks: number[] = [];
    const valleys: number[] = [];
    
    for (let i = 1; i < this.pitchHistory.length - 1; i++) {
      if (this.pitchHistory[i] > this.pitchHistory[i-1] && 
          this.pitchHistory[i] > this.pitchHistory[i+1]) {
        peaks.push(this.pitchHistory[i]);
      }
      if (this.pitchHistory[i] < this.pitchHistory[i-1] && 
          this.pitchHistory[i] < this.pitchHistory[i+1]) {
        valleys.push(this.pitchHistory[i]);
      }
    }
    
    if (peaks.length === 0 || valleys.length === 0) return 0;
    
    const avgPeak = this.calculateMean(peaks);
    const avgValley = this.calculateMean(valleys);
    
    return Math.abs(avgPeak - avgValley); // En cents
  }

  private calculateMean(values: number[]): number {
    return values.reduce((a, b) => a + b, 0) / values.length;
  }

  private calculateStdDev(values: number[]): number {
    const mean = this.calculateMean(values);
    const variance = values.reduce((sum, val) => 
      sum + Math.pow(val - mean, 2), 0
    ) / values.length;
    return Math.sqrt(variance);
  }

  private calculateConsistency(values: number[]): number {
    const mean = this.calculateMean(values);
    const stdDev = this.calculateStdDev(values);
    return 1 - (stdDev / Math.abs(mean));
  }
}
```

### Envío al Backend

```typescript
async function submitStabilityMetrics(metrics: StabilityMetrics) {
  const response = await fetch('http://localhost:3000/metrics/stability', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(metrics),
  });

  if (!response.ok) {
    throw new Error('Error al enviar métricas de estabilidad');
  }

  return await response.json();
}
```

---

## 🏁 Finalización y Resultados

### Consolidación de Sesión

Después de completar ambos ejercicios, llamar al endpoint de finalización:

```typescript
async function finalizeSession(sessionId: string) {
  const response = await fetch('http://localhost:3000/metrics/finalize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId }),
  });

  if (!response.ok) {
    throw new Error('Error al finalizar sesión');
  }

  return await response.json();
}
```

> **💡 Importante**: El `sessionId` debe ser el mismo que se obtuvo de la fase de **calibración**. El backend usará este ID para:
> - ✅ Extraer automáticamente `snrDb` y `rmsDb` de la calibración
> - ✅ Consolidar todas las métricas de los ejercicios de rango y estabilidad
> - ✅ Calcular métricas derivadas como `powerIndex`
> - ✅ Generar un único registro consolidado con todos los datos
>
> **El frontend NO necesita enviar datos de calibración** - el backend los obtiene automáticamente.

### Obtener Resultados

```typescript
async function getResults(sessionId: string) {
  const response = await fetch(`http://localhost:3000/metrics/${sessionId}`);
  
  if (!response.ok) {
    throw new Error('Error al obtener resultados');
  }

  const data = await response.json();
  return data;
}
```

### Estructura de Respuesta

```typescript
interface ConsolidatedResults {
  id: string;
  sessionId: string;
  calibrationId: string;
  finalized: boolean;
  createdAt: string;
  updatedAt: string;
  
  // === MÉTRICAS CONSOLIDADAS ===
  rangeSpanSemitones: number;
  precisionCents: number;
  stabilityCents: number;
  vibratoRateHz: number;
  voiceType: string;              // soprano | alto | tenor | bass
  tessituraCenterMidi: number;
  spectralCentroid: number;
  dynamicRangeDb: number;
  registerShifts: number;
  powerIndex: number;
  snrDb: number;
  
  // === RECOMENDACIÓN (ACTUALMENTE NULL) ===
  recommendedRoute: null;         // ⚠️ Será 'CVT' | 'EVM' después del entrenamiento
  routeConfidence: null;          // ⚠️ Será 0-100 después del entrenamiento
  
  // === EJERCICIOS INDIVIDUALES ===
  exercises: ExerciseMetric[];
}

interface ExerciseMetric {
  id: number;
  sessionId: string;
  exerciseType: string;           // 'range' | 'stability'
  rangeSpanSemitones: number | null;
  rangeMinMidi: number | null;
  rangeMaxMidi: number | null;
  precisionCents: number | null;
  stabilityCents: number | null;
  vibratoRateHz: number | null;
  vibratoDepthCents: number | null;
  meanRmsDb: number | null;
  rmsConsistency: number | null;
  durationSeconds: number | null;
  voiceType: string | null;
  tessituraCenterMidi: number | null;
  spectralCentroid: number | null;
  dynamicRangeDb: number | null;
  registerShifts: number | null;
  createdAt: string;
}
```

### Mostrar Resultados en UI

```typescript
function displayResults(results: ConsolidatedResults) {
  console.log('=== RESULTADOS DE EVALUACIÓN VOCAL ===');
  console.log(`Tipo de voz: ${results.voiceType}`);
  console.log(`Rango vocal: ${results.rangeSpanSemitones.toFixed(1)} semitonos`);
  console.log(`Precisión: ${results.precisionCents.toFixed(1)} cents`);
  console.log(`Estabilidad: ${results.stabilityCents.toFixed(1)} cents`);
  console.log(`Centroide espectral: ${results.spectralCentroid.toFixed(0)} Hz`);
  console.log(`Rango dinámico: ${results.dynamicRangeDb.toFixed(1)} dB`);
  console.log(`Cambios de registro: ${results.registerShifts}`);
  
  // ⚠️ IMPORTANTE: No mostrar recomendación aún
  if (results.recommendedRoute === null) {
    console.log('\n⏳ Recomendación CVT/EVM: Pendiente (modelo en entrenamiento)');
  } else {
    console.log(`\n✅ Ruta recomendada: ${results.recommendedRoute}`);
    console.log(`   Confianza: ${results.routeConfidence}%`);
  }
}
```

---

## 📡 Endpoints del Backend

### 1. POST `/metrics/range`

**Body:**
```json
{
  "sessionId": "uuid-del-calibration",
  "rangeSpanSemitones": 24.5,
  "rangeMinMidi": 55.2,
  "rangeMaxMidi": 79.7,
  "meanRmsDb": -25.3,
  "rmsConsistency": 0.85,
  "durationSeconds": 30.5,
  "voiceType": "tenor",
  "tessituraCenterMidi": 65.5,
  "spectralCentroid": 1200.5,
  "dynamicRangeDb": 15.2,
  "registerShifts": 3
}
```

**Response:**
```json
{
  "id": 123,
  "sessionId": "uuid-del-calibration",
  "exerciseType": "range",
  "rangeSpanSemitones": 24.5,
  ...
}
```

### 2. POST `/metrics/stability`

**Body:**
```json
{
  "sessionId": "uuid-del-calibration",
  "precisionCents": 12.5,
  "stabilityCents": 8.3,
  "vibratoRateHz": 1.2,
  "vibratoDepthCents": 15.5,
  "meanRmsDb": -22.1,
  "rmsConsistency": 0.92,
  "durationSeconds": 20.0,
  "spectralCentroid": 1100.2,
  "dynamicRangeDb": 3.5
}
```

**Response:**
```json
{
  "id": 124,
  "sessionId": "uuid-del-calibration",
  "exerciseType": "stability",
  "precisionCents": 12.5,
  ...
}
```

### 3. POST `/metrics/finalize`

**Body:**
```json
{
  "sessionId": "uuid-del-calibration"
}
```

**Response:**
```json
{
  "id": "consolidated-uuid",
  "sessionId": "uuid-del-calibration",
  "finalized": true,
  "rangeSpanSemitones": 24.5,
  "precisionCents": 12.5,
  "voiceType": "tenor",
  "recommendedRoute": null,
  "routeConfidence": null,
  ...
}
```

### 4. GET `/metrics/:sessionId`

**Response:**
```json
{
  "id": "consolidated-uuid",
  "sessionId": "uuid-del-calibration",
  "finalized": true,
  "exercises": [
    { "exerciseType": "range", ... },
    { "exerciseType": "stability", ... }
  ],
  ...
}
```

---

## 💻 Código de Ejemplo Completo

### Flujo Completo de Evaluación

```typescript
import { VocalAnalyzer } from './VocalAnalyzer';
import { RangeVocalExercise } from './RangeVocalExercise';
import { StabilityExercise } from './StabilityExercise';

class VocalEvaluationFlow {
  private analyzer: VocalAnalyzer;
  private sessionId: string;

  constructor(sessionId: string) {
    this.sessionId = sessionId;
    this.analyzer = new VocalAnalyzer();
  }

  async initialize() {
    await this.analyzer.initialize();
    console.log('✅ Audio pipeline inicializado');
  }

  async runRangeExercise(): Promise<void> {
    console.log('🎵 Iniciando ejercicio de RANGO VOCAL...');
    console.log('Instrucciones: Canta desde tu nota más grave hasta la más aguda');
    
    const exercise = new RangeVocalExercise(this.analyzer, this.sessionId);
    const intervalId = await exercise.start();

    // Simular duración del ejercicio (en la UI sería un botón "Detener")
    await this.sleep(30000); // 30 segundos

    const metrics = exercise.stop(intervalId);
    console.log('📊 Métricas capturadas:', metrics);

    // Enviar al backend
    await this.submitRangeMetrics(metrics);
    console.log('✅ Métricas de rango enviadas al backend');
  }

  async runStabilityExercise(): Promise<void> {
    console.log('🎯 Iniciando ejercicio de ESTABILIDAD...');
    console.log('Instrucciones: Sostén la nota A4 (440Hz) sin variación');
    
    const exercise = new StabilityExercise(this.analyzer, this.sessionId, 69);
    const intervalId = await exercise.start();

    // Duración del ejercicio
    await this.sleep(20000); // 20 segundos

    const metrics = exercise.stop(intervalId);
    console.log('📊 Métricas capturadas:', metrics);

    // Enviar al backend
    await this.submitStabilityMetrics(metrics);
    console.log('✅ Métricas de estabilidad enviadas al backend');
  }

  async finalizeAndShowResults(): Promise<void> {
    console.log('🏁 Finalizando sesión...');
    
    // Consolidar métricas
    await this.finalizeSession();
    console.log('✅ Sesión finalizada');

    // Obtener resultados
    const results = await this.getResults();
    console.log('📈 Resultados obtenidos');

    // Mostrar en UI
    this.displayResults(results);
  }

  async run() {
    try {
      await this.initialize();
      await this.runRangeExercise();
      await this.sleep(2000); // Pausa entre ejercicios
      await this.runStabilityExercise();
      await this.finalizeAndShowResults();
    } catch (error) {
      console.error('❌ Error en el flujo de evaluación:', error);
    }
  }

  // === MÉTODOS AUXILIARES ===

  private async submitRangeMetrics(metrics: any) {
    const response = await fetch('http://localhost:3000/metrics/range', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metrics),
    });
    if (!response.ok) throw new Error('Error al enviar métricas de rango');
    return await response.json();
  }

  private async submitStabilityMetrics(metrics: any) {
    const response = await fetch('http://localhost:3000/metrics/stability', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metrics),
    });
    if (!response.ok) throw new Error('Error al enviar métricas de estabilidad');
    return await response.json();
  }

  private async finalizeSession() {
    const response = await fetch('http://localhost:3000/metrics/finalize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: this.sessionId }),
    });
    if (!response.ok) throw new Error('Error al finalizar sesión');
    return await response.json();
  }

  private async getResults() {
    const response = await fetch(`http://localhost:3000/metrics/${this.sessionId}`);
    if (!response.ok) throw new Error('Error al obtener resultados');
    return await response.json();
  }

  private displayResults(results: any) {
    console.log('\n=== 📊 RESULTADOS DE TU EVALUACIÓN VOCAL ===\n');
    console.log(`🎤 Tipo de voz: ${results.voiceType.toUpperCase()}`);
    console.log(`📏 Rango vocal: ${results.rangeSpanSemitones.toFixed(1)} semitonos`);
    console.log(`🎯 Precisión: ${results.precisionCents.toFixed(1)} cents`);
    console.log(`📊 Estabilidad: ${results.stabilityCents.toFixed(1)} cents`);
    console.log(`✨ Brillo (centroide): ${results.spectralCentroid.toFixed(0)} Hz`);
    console.log(`🔊 Rango dinámico: ${results.dynamicRangeDb.toFixed(1)} dB`);
    console.log(`🎵 Cambios de registro: ${results.registerShifts}`);
    
    if (results.recommendedRoute === null) {
      console.log('\n⏳ Recomendación de metodología: PENDIENTE');
      console.log('   El modelo está siendo entrenado con más datos...');
    } else {
      console.log(`\n✅ Metodología recomendada: ${results.recommendedRoute}`);
      console.log(`   Confianza: ${results.routeConfidence}%`);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// === USO ===
const sessionId = 'uuid-from-calibration'; // Obtener del módulo de calibración
const evaluation = new VocalEvaluationFlow(sessionId);
evaluation.run();
```

---

## 🎯 Checklist de Implementación

### Preparación
- [ ] Instalar dependencias: `@tensorflow/tfjs`, `@crepe/crepe`, `meyda`
- [ ] Configurar permisos de micrófono en el navegador
- [ ] Inicializar `AudioContext` y `AnalyserNode`
- [ ] Cargar modelo CREPE para pitch detection

### Ejercicio de Rango
- [ ] Implementar captura continua de pitch (cada 100ms)
- [ ] Calcular `rangeSpanSemitones`, `rangeMinMidi`, `rangeMaxMidi`
- [ ] Calcular `voiceType` basado en rango
- [ ] Calcular `tessituraCenterMidi` (mediana de pitches)
- [ ] Calcular `spectralCentroid` con FFT o Meyda
- [ ] Calcular `dynamicRangeDb` (max RMS - min RMS)
- [ ] Detectar `registerShifts` (saltos > 3 semitonos)
- [ ] Enviar datos a `POST /metrics/range`

### Ejercicio de Estabilidad
- [ ] Implementar captura continua relativa a target (A4)
- [ ] Calcular `precisionCents` (promedio de desviación)
- [ ] Calcular `stabilityCents` (desviación estándar)
- [ ] Detectar `vibratoRateHz` (frecuencia de oscilación)
- [ ] Detectar `vibratoDepthCents` (amplitud de oscilación)
- [ ] Calcular `spectralCentroid` promedio
- [ ] Calcular `dynamicRangeDb` (debe ser bajo)
- [ ] Enviar datos a `POST /metrics/stability`

### Finalización
- [ ] Llamar a `POST /metrics/finalize` con `sessionId`
- [ ] Obtener resultados consolidados con `GET /metrics/:sessionId`
- [ ] Mostrar métricas en UI
- [ ] **NO mostrar `recommendedRoute`** (aún es `null`)
- [ ] Preparar UI para mostrar recomendación cuando modelo esté listo

---

## 🚨 Notas Importantes

### ⚠️ El sessionId es la clave de todo

**MUY IMPORTANTE**: El `sessionId` que obtienes de la calibración es el **único vínculo** entre:
1. Los datos de calibración (`snrDb`, `rmsDb`, `noiseFloor`)
2. Los ejercicios vocales (rango y estabilidad)
3. Los resultados consolidados finales

```typescript
// ✅ CORRECTO: Usar el mismo sessionId en todo el flujo
const sessionId = await calibrateUser(); // "abc-123-def-456"

await submitRangeMetrics({ sessionId, ... });
await submitStabilityMetrics({ sessionId, ... });
await finalizeSession(sessionId);
const results = await getResults(sessionId);

// ❌ ERROR: Usar diferentes IDs o generar nuevos
const newId = generateUUID(); // ¡NO HAGAS ESTO!
await submitRangeMetrics({ sessionId: newId, ... }); // Backend no encontrará la calibración
```

**¿Por qué?** El backend usa el `sessionId` para:
- ✅ Buscar la calibración: `CalibrationMetric.findFirst({ where: { sessionId } })`
- ✅ Verificar que existe: `CalibrationSession.findUnique({ where: { id: sessionId } })`
- ✅ Extraer `snrDb` y `rmsDb` automáticamente
- ✅ Vincular todos los ejercicios a la misma evaluación

### Sobre la Recomendación CVT/EVM

⚠️ **ACTUALMENTE**: `recommendedRoute` y `routeConfidence` son `null`

**Razón**: El modelo de Machine Learning necesita:
1. Recolectar 200-300 muestras de usuarios reales
2. Etiquetar datos con expertos en CVT y EVM
3. Entrenar modelo de clasificación binaria
4. Integrar modelo en el backend

**Timeline estimado**: 2-3 meses después del lanzamiento

### Consolidación Automática

**El frontend NO necesita calcular ni enviar**:
- ❌ `snrDb` (lo extrae el backend de la calibración)
- ❌ `rmsDb` (lo extrae el backend de la calibración)
- ❌ `powerIndex` (lo calcula el backend: `1 - (rmsConsistency / 10)`)
- ❌ Promedios de métricas entre ejercicios (el backend los consolida)

**El frontend SOLO envía**:
- ✅ Métricas del ejercicio de rango → `POST /metrics/range`
- ✅ Métricas del ejercicio de estabilidad → `POST /metrics/stability`
- ✅ Señal de finalización → `POST /metrics/finalize` (solo `sessionId`)

### Optimizaciones de Performance

- **Throttling**: Capturar datos cada 100ms es suficiente
- **CREPE Model**: Usar versión `'tiny'` para producción (más rápido)
- **Buffer Size**: `fftSize: 2048` es un buen balance entre resolución y performance
- **Confidence Threshold**: Solo usar pitches con `confidence > 0.8`

### Manejo de Errores

```typescript
// Siempre validar permisos de micrófono
try {
  await navigator.mediaDevices.getUserMedia({ audio: true });
} catch (error) {
  if (error.name === 'NotAllowedError') {
    alert('Se requiere acceso al micrófono para continuar');
  }
}

// Validar que el backend esté disponible
async function checkBackendHealth() {
  try {
    const response = await fetch('http://localhost:3000/health');
    return response.ok;
  } catch {
    return false;
  }
}

// Validar que la calibración existe antes de continuar
async function validateSession(sessionId: string): Promise<boolean> {
  try {
    const response = await fetch(`http://localhost:3000/calibrations/${sessionId}/metrics`);
    return response.ok;
  } catch {
    return false;
  }
}
```

---

## 📚 Referencias

- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [CREPE - Pitch Detection](https://github.com/marl/crepe)
- [Meyda - Audio Feature Extraction](https://meyda.js.org/)
- [Cent (music)](https://en.wikipedia.org/wiki/Cent_(music)) - 100 cents = 1 semitono

---

## ✅ Estado del Proyecto

- ✅ Backend configurado y funcionando (puerto 3000)
- ✅ Base de datos con schema completo
- ✅ Endpoints REST implementados
- ✅ Sistema de métricas validado
- ⏳ Frontend por implementar (esta guía)
- ⏳ Modelo ML en fase de recolección de datos

---

**¿Dudas?** Consulta el código fuente del backend en `src/metrics/` para detalles de implementación.

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding exercises...');

  // Grupo 1: Soporte respiratorio y control del aire
  const group1 = await prisma.exerciseGroup.create({
    data: {
      groupNumber: 1,
      name: 'Soporte respiratorio y control del aire',
      objective: 'Desarrollar la capacidad de mantener un flujo de aire constante y una presión subglótica controlada mientras se sostiene una nota o sonido.',
      rationale: 'CVT: "Support" (uso activo del cuerpo para sostener la voz). EVM: "Flow" y "Anchoring" (equilibrio respiratorio y control corporal).',
      exercises: {
        create: [
          {
            exerciseNumber: 1,
            name: 'Breath Flow Hold',
            rationale: 'CVT (Support) + EVM (Flow)',
            objective: 'Mantener una nota sostenida a volumen estable',
            instructions: 'El usuario elige una nota cómoda ("Ah") y la sostiene intentando mantener el volumen lo más parejo posible.',
            levels: {
              create: [
                { level: 1, description: 'Mantén la nota por 3 segundos.', videoUrl: null },
                { level: 2, description: 'Mantén la nota por 5 segundos.', videoUrl: null },
              ],
            },
          },
          {
            exerciseNumber: 2,
            name: 'S–Z Balance',
            rationale: 'EVM (Flow)',
            objective: 'Controlar el flujo de aire comparando la duración del sonido "S" (aire) con "Z" (voz).',
            instructions: 'Emitir "ssss" hasta agotar el aire. Luego emitir "zzzz" buscando igualar la duración. UrSinger mide consistencia y duración.',
            levels: {
              create: [
                { level: 1, description: 'Cada sonido dura 3 segundos.', videoUrl: null },
                { level: 2, description: 'Cada sonido dura 5 segundos.', videoUrl: null },
              ],
            },
          },
          {
            exerciseNumber: 3,
            name: 'Dynamic Wave',
            rationale: 'CVT (Metal Control)',
            objective: 'Mantener control del flujo durante cambios suaves de volumen',
            instructions: 'Emitir una vocal "Ah" a una nota cómoda, comenzando suave, subiendo ligeramente el volumen, y luego volviendo al volumen inicial.',
            levels: {
              create: [
                { level: 1, description: 'Haz un ciclo de 3 segundos.', videoUrl: null },
                { level: 2, description: 'Haz un ciclo de 5 segundos.', videoUrl: null },
              ],
            },
          },
        ],
      },
    },
  });

  // Grupo 2: Afinación y oído tonal
  const group2 = await prisma.exerciseGroup.create({
    data: {
      groupNumber: 2,
      name: 'Afinación y oído tonal',
      objective: 'Desarrollar la habilidad de emitir y mantener notas con precisión tonal, reconocer desviaciones, y mejorar la coordinación entre la percepción auditiva y la producción vocal.',
      rationale: 'CVT: "Neutral" y "Avoid constriction" (emisión libre y relajada para precisión). EVM: "Onsets" y "Pitch control" (coordinación aire–sonido).',
      exercises: {
        create: [
          {
            exerciseNumber: 1,
            name: 'Pitch Target',
            rationale: 'EVM (Onset)',
            objective: 'Coincidir la nota emitida con una referencia que UrSinger reproduce (tono guía).',
            instructions: 'El sistema reproduce una nota (por ejemplo, A3). El usuario debe cantarla intentando igualar el tono lo más posible.',
            levels: {
              create: [
                { level: 1, description: '3 repeticiones con tolerancia de ±50 cents.', videoUrl: null },
                { level: 2, description: '3 repeticiones con tolerancia de ±25 cents.', videoUrl: null },
              ],
            },
          },
          {
            exerciseNumber: 2,
            name: 'Pitch Steps',
            rationale: 'CVT (Neutral) + EVM (Pitch memory)',
            objective: 'Mejorar la precisión al moverse entre notas (intervalos simples).',
            instructions: 'UrSinger toca dos notas consecutivas (por ejemplo, C4 → E4). El usuario repite intentando mantener la relación exacta entre ambas.',
            levels: {
              create: [
                { level: 1, description: 'Intervalo de 2 semitonos (1 tono).', videoUrl: null },
                { level: 2, description: 'Intervalo de 5 semitonos (cuarta).', videoUrl: null },
              ],
            },
          },
          {
            exerciseNumber: 3,
            name: 'Pitch Glide',
            rationale: 'CVT (Neutral flow) + EVM (Pitch glide)',
            objective: 'Lograr transiciones suaves y controladas entre notas sin saltos bruscos.',
            instructions: 'El usuario emite una vocal "oo" o "ee", deslizando la voz desde una nota baja hasta una alta y regresando. UrSinger mide la suavidad y continuidad del cambio tonal.',
            levels: {
              create: [
                { level: 1, description: 'Desliza entre 3 semitonos.', videoUrl: null },
                { level: 2, description: 'Desliza entre 6 semitonos.', videoUrl: null },
              ],
            },
          },
        ],
      },
    },
  });

  // Grupo 3: Estabilidad y vibrato controlado
  const group3 = await prisma.exerciseGroup.create({
    data: {
      groupNumber: 3,
      name: 'Estabilidad y vibrato controlado',
      objective: 'Entrenar la capacidad de mantener notas estables en tono y volumen, y desarrollar un vibrato natural, controlado y regular.',
      rationale: 'CVT: Neutral y Metal Control (control del flujo y del color vocal sin tensión). EVM: Anchoring y True Vocal Fold Onset (control de la laringe y de la activación muscular para vibrato).',
      exercises: {
        create: [
          {
            exerciseNumber: 1,
            name: 'Steady Tone',
            rationale: 'CVT (Neutral) + EVM (Anchoring)',
            objective: 'Mantener una nota sin que varíe su afinación más de lo necesario.',
            instructions: 'El usuario elige una nota cómoda y la sostiene intentando evitar cualquier temblor o vibrato.',
            levels: {
              create: [
                { level: 1, description: 'Mantén la nota por 3 s.', videoUrl: null },
                { level: 2, description: 'Mantén la nota por 5 s.', videoUrl: null },
              ],
            },
          },
          {
            exerciseNumber: 2,
            name: 'Controlled vibrato',
            rationale: 'EVM (Anchoring + Onset control)',
            objective: 'Generar vibrato de forma controlada, regular y sin perder afinación base.',
            instructions: 'El usuario sostiene una nota y aplica un vibrato suave (oscilaciones de tono naturales, no forzadas). UrSinger analiza su regularidad.',
            levels: {
              create: [
                { level: 1, description: 'Vibrato libre por 3 s.', videoUrl: null },
                { level: 2, description: 'Vibrato libre por 5 s.', videoUrl: null },
              ],
            },
          },
          {
            exerciseNumber: 3,
            name: 'Clean onset',
            rationale: 'CVT (Avoid constriction) + EVM (True Vocal Fold Onset)',
            objective: 'Entrenar la precisión al iniciar una nota sin ataques bruscos ni retrasos en la afinación.',
            instructions: 'UrSinger da una nota guía → el usuario la emite intentando empezar directamente en el tono correcto.',
            levels: {
              create: [
                { level: 1, description: '3 repeticiones con ±50 cents al inicio.', videoUrl: null },
                { level: 2, description: '3 repeticiones con ±25 cents al inicio.', videoUrl: null },
              ],
            },
          },
        ],
      },
    },
  });

  // Grupo 4: Potencia y control dinámico
  const group4 = await prisma.exerciseGroup.create({
    data: {
      groupNumber: 4,
      name: 'Potencia y control dinámico',
      objective: 'Desarrollar la habilidad de aumentar o disminuir el volumen vocal sin perder estabilidad de tono ni tensión, logrando una proyección eficiente.',
      rationale: 'CVT: Twang, Overdrive, Edge, Metal Control. EVM: Source–Filter Balance y Anchoring.',
      exercises: {
        create: [
          {
            exerciseNumber: 1,
            name: 'Single Burst',
            rationale: 'CVT (Twang/Overdrive)',
            objective: 'Ejecutar una nota breve con proyección firme y controlada, evitando saturación o tensión.',
            instructions: 'UrSinger da una nota guía. El usuario la emite con un ataque energético (como un "¡HEY!"), manteniendo 1 segundo de potencia estable.',
            levels: {
              create: [
                { level: 1, description: 'Emisión fuerte de 3 s en nota media.', videoUrl: null },
                { level: 2, description: 'Emisión fuerte de 5 s en nota media.', videoUrl: null },
              ],
            },
          },
          {
            exerciseNumber: 2,
            name: 'Volume Rise',
            rationale: 'EVM (Source–Filter Balance) + CVT (Metal Control)',
            objective: 'Aumentar gradualmente el volumen manteniendo el tono estable.',
            instructions: 'El usuario mantiene una vocal "Ah", comenzando suave y aumentando volumen uniformemente hasta el final del tiempo.',
            levels: {
              create: [
                { level: 1, description: 'Aumenta volumen durante 3 s.', videoUrl: null },
                { level: 2, description: 'Aumenta volumen durante 5 s.', videoUrl: null },
              ],
            },
          },
          {
            exerciseNumber: 3,
            name: 'Loud–Soft Alternance',
            rationale: 'CVT (Twang + Metal Control) + EVM (Anchoring)',
            objective: 'Cambiar rápidamente entre voz suave y fuerte sin perder tono ni calidad.',
            instructions: 'El usuario alterna una vocal entre "suave → fuerte → suave" sin cambiar la nota.',
            levels: {
              create: [
                { level: 1, description: '1 ciclo de 3 s.', videoUrl: null },
                { level: 2, description: '2 ciclos de 5 s.', videoUrl: null },
              ],
            },
          },
        ],
      },
    },
  });

  // Grupo 5: Rango y flexibilidad vocal
  const group5 = await prisma.exerciseGroup.create({
    data: {
      groupNumber: 5,
      name: 'Rango y flexibilidad vocal',
      objective: 'Desarrollar la habilidad de ampliar la extensión vocal (notas graves y agudas) y mejorar la transición fluida entre registros (pecho, cabeza, mixto)',
      rationale: 'CVT: Edge, Curbing, Overdrive → expansión del rango con control de soporte. EVM: CT–TA balance, Pitch glide, Anchoring → coordinación de músculos laríngeos (cricotiroides y tiroaritenoideos) para transiciones suaves.',
      exercises: {
        create: [
          {
            exerciseNumber: 1,
            name: 'Vocal glide',
            rationale: 'CVT (Edge) + EVM (Pitch Glide)',
            objective: 'Deslizar la voz de una nota baja a una alta (y viceversa) sin quiebres de registro.',
            instructions: 'El usuario hace una sirena con una vocal cómoda ("oo" o "ee"), desde su nota más baja hasta la más alta posible y regresa, sin forzar.',
            levels: {
              create: [
                { level: 1, description: 'Desliza entre 5 semitonos.', videoUrl: null },
                { level: 2, description: 'Desliza entre 8 semitonos.', videoUrl: null },
              ],
            },
          },
          {
            exerciseNumber: 2,
            name: 'Step Expansion',
            rationale: 'EVM (CT–TA Balance)',
            objective: 'Cantar una secuencia de notas ascendentes y descendentes controlando el paso entre registros.',
            instructions: 'UrSinger reproduce una escala corta (3–5 notas). El usuario la repite manteniendo el mismo color y volumen en cada nota.',
            levels: {
              create: [
                { level: 1, description: 'Escala de 3 notas (3 semitonos).', videoUrl: null },
                { level: 2, description: 'Escala de 5 notas (5 semitonos).', videoUrl: null },
              ],
            },
          },
          {
            exerciseNumber: 3,
            name: 'Mix coordination',
            rationale: 'CVT (Curbing) + EVM (Anchoring + CT–TA Balance)',
            objective: 'Entrenar la transición entre voz de pecho y voz de cabeza (registro mixto) sin quiebre ni pérdida de potencia.',
            instructions: 'El usuario emite una sirena corta ("ah") pasando por la zona de mezcla (ej.: E4–A4) intentando mantener el mismo color de voz.',
            levels: {
              create: [
                { level: 1, description: 'Transición de 3 notas.', videoUrl: null },
                { level: 2, description: 'Transición de 5 notas.', videoUrl: null },
              ],
            },
          },
        ],
      },
    },
  });

  console.log('✅ Seed completed successfully!');
  console.log(`Created ${5} exercise groups with all exercises and levels`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

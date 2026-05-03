import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding exercises...');

  // Limpiar datos existentes
  console.log('🧹 Cleaning existing data...');
  await prisma.trainingPlanExercise.deleteMany({});
  await prisma.trainingPlan.deleteMany({});
  await prisma.exerciseLevel.deleteMany({});
  await prisma.exercise.deleteMany({});
  await prisma.exerciseGroup.deleteMany({});
  console.log('✅ Cleaned successfully!');

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
            name: 'Flujo de aire sostenido',
            rationale: 'CVT (Support) + EVM (Flow)',
            cvtDescription: 'Support: Uso activo del cuerpo para sostener la voz con apoyo diafragmático constante.',
            evmDescription: 'Flow: Mantener un flujo de aire constante y equilibrado durante la emisión sostenida.',
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
            name: 'Balance del aire sin voz / con voz',
            rationale: 'EVM (Flow)',
            cvtDescription: null,
            evmDescription: 'Flow: Comparar el flujo de aire sin voz con el flujo con voz para evaluar eficiencia vocal.',
            objective: 'Controlar el flujo de aire comparando la duración del sonido "S" con voz.',
            instructions: 'Emitir "ssss" hasta agotar el aire. Luego emitir una nota buscando igualar la duración. UrSinger mide consistencia y duración.',
            levels: {
              create: [
                { level: 1, description: 'Cada sonido dura 3 segundos.', videoUrl: null },
                { level: 2, description: 'Cada sonido dura 5 segundos.', videoUrl: null },
              ],
            },
          },
          {
            exerciseNumber: 3,
            name: 'Potencia dinámica',
            rationale: 'CVT (Metal Control)',
            cvtDescription: 'Metal Control: Mantener control del flujo durante cambios de volumen sin perder claridad vocal.',
            evmDescription: null,
            objective: 'Mantener una misma nota mientras se ejecuta el patrón dinámico suave → fuerte → suave',
            instructions: 'El usuario canta una única nota dentro de su rango y realiza el patrón de potencia suave → fuerte → suave sin cambiar la afinación. Cada patrón detectado cuenta como 1 repetición. Debe completar 3 repeticiones en máximo 1 minuto.',
            levels: {
              create: [
                { level: 1, description: 'Nota cómoda dentro de tu rango vocal. 3 repeticiones en 1 minuto.', videoUrl: null },
                { level: 2, description: 'Nota aguda cercana a tu límite superior. 3 repeticiones en 1 minuto.', videoUrl: null },
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
            name: 'Nota objetivo',
            rationale: 'EVM (Onset)',
            cvtDescription: null,
            evmDescription: 'Onset: Coordinación precisa entre el inicio del flujo de aire y la activación de las cuerdas vocales.',
            objective: 'Coincidir la nota emitida con una referencia y sostenerla en repeticiones controladas.',
            instructions: 'UrSinger reproduce una nota objetivo. El usuario debe mantener esa nota durante 3 segundos por repetición y completar 3 repeticiones.',
            levels: {
              create: [
                { level: 1, description: 'Nota cómoda dentro del rango vocal. 3 repeticiones de 3 segundos.', videoUrl: null },
                { level: 2, description: 'Nota alta del rango vocal. 3 repeticiones de 3 segundos.', videoUrl: null },
              ],
            },
          },
          {
            exerciseNumber: 2,
            name: 'Notas escalonadas',
            rationale: 'CVT (Neutral) + EVM (Pitch memory)',
            cvtDescription: 'Neutral: Emisión libre y relajada que permite cambios de pitch sin tensión laríngea.',
            evmDescription: 'Pitch Memory: Capacidad de reproducir intervalos precisos entre notas consecutivas.',
            objective: 'Replicar secuencias de dos notas objetivo con precisión temporal y tonal.',
            instructions: 'UrSinger reproduce una secuencia de dos notas (nota 1 y nota 2). El usuario debe cantar nota 1 por 1 segundo y luego nota 2 por 1 segundo. Al completar ambas, cuenta 1 repetición. Debe completar 3 repeticiones en máximo 1 minuto.',
            levels: {
              create: [
                { level: 1, description: 'Intervalo menor entre nota 1 y nota 2. 3 repeticiones (1s + 1s).', videoUrl: null },
                { level: 2, description: 'Intervalo mayor entre nota 1 y nota 2. 3 repeticiones (1s + 1s).', videoUrl: null },
              ],
            },
          },
          {
            exerciseNumber: 3,
            name: 'Deslizamiento entre notas',
            rationale: 'CVT (Neutral flow) + EVM (Pitch glide)',
            cvtDescription: 'Neutral Flow: Mantener el modo neutro durante todo el deslizamiento tonal.',
            evmDescription: 'Pitch Glide: Transiciones continuas y suaves entre diferentes alturas tonales.',
            objective: 'Completar barridos controlados entre dos notas objetivo, manteniendo continuidad tonal.',
            instructions: 'Cada repetición consiste en deslizar la voz desde nota 1 hacia nota 2 y regresar a nota 1. Se deben completar 3 repeticiones en máximo 1 minuto.',
            levels: {
              create: [
                { level: 1, description: 'Diferencia menor entre nota 1 y nota 2. 3 repeticiones en 1 minuto.', videoUrl: null },
                { level: 2, description: 'Diferencia mayor entre nota 1 y nota 2. 3 repeticiones en 1 minuto.', videoUrl: null },
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
            name: 'Nota estable',
            rationale: 'CVT (Neutral) + EVM (Anchoring)',
            cvtDescription: 'Neutral: Modo vocal que permite estabilidad tonal sin tensión laríngea.',
            evmDescription: 'Anchoring: Estabilización de la laringe para mantener pitch constante.',
            objective: 'Sostener la nota objetivo con afinación estable en repeticiones controladas.',
            instructions: 'UrSinger genera una nota objetivo dentro del rango vocal del usuario. Se deben completar 3 repeticiones manteniendo la nota estable según la duración del nivel.',
            levels: {
              create: [
                { level: 1, description: '3 repeticiones sosteniendo la nota por 3 segundos.', videoUrl: null },
                { level: 2, description: '3 repeticiones sosteniendo la nota por 5 segundos.', videoUrl: null },
              ],
            },
          },
          {
            exerciseNumber: 2,
            name: 'Vibrato controlado',
            rationale: 'EVM (Anchoring + Onset control)',
            cvtDescription: null,
            evmDescription: 'Anchoring + Onset Control: Oscilaciones regulares del pitch mediante control muscular fino.',
            objective: 'Aplicar vibrato controlado alrededor de una nota objetivo dentro del rango vocal.',
            instructions: 'UrSinger genera una nota objetivo según el rango vocal. El usuario no debe mantener tono plano, sino generar vibrato regular alrededor de la nota. Nivel 1 exige 3 segundos y nivel 2 exige 5 segundos, dentro de un máximo de 1 minuto.',
            levels: {
              create: [
                { level: 1, description: 'Vibrato controlado por 3 segundos sobre la nota objetivo.', videoUrl: null },
                { level: 2, description: 'Vibrato controlado por 5 segundos sobre la nota objetivo.', videoUrl: null },
              ],
            },
          },
          {
            exerciseNumber: 3,
            name: 'Ataque limpio de nota',
            rationale: 'CVT (Avoid constriction) + EVM (True Vocal Fold Onset)',
            cvtDescription: 'Avoid Constriction: Inicio de nota sin tensión ni constricción faríngea.',
            evmDescription: 'True Vocal Fold Onset: Activación precisa de las cuerdas vocales desde el primer momento.',
            objective: 'Iniciar la nota objetivo con afinación exacta, sin deslizar desde otra nota.',
            instructions: 'UrSinger genera una nota objetivo. Nivel 1 trabaja en una nota cómoda del rango vocal; nivel 2 usa una nota aguda al límite del rango. Se deben completar 3 repeticiones limpias para superar el desafío.',
            levels: {
              create: [
                { level: 1, description: '3 repeticiones en nota cómoda con entrada limpia (±50 cents).', videoUrl: null },
                { level: 2, description: '3 repeticiones en nota aguda límite con entrada limpia (±25 cents).', videoUrl: null },
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
            name: 'Ataque potente de nota',
            rationale: 'CVT (Twang/Overdrive)',
            cvtDescription: 'Twang/Overdrive: Modos vocales que permiten proyección potente sin tensión.',
            evmDescription: null,
            objective: 'Ejecutar una nota breve con proyección firme y controlada, evitando saturación o tensión.',
            instructions: 'UrSinger da una nota guía. El usuario la emite con un ataque energético (como un "¡HEY!"). Debe completar 3 repeticiones en un máximo de 1 minuto; si termina antes, el ejercicio se da por completado.',
            levels: {
              create: [
                { level: 1, description: '3 repeticiones válidas en máximo 1 minuto (exigencia base de precisión y ataque).', videoUrl: null },
                { level: 2, description: '3 repeticiones válidas en máximo 1 minuto (mayor exigencia de precisión y ataque).', videoUrl: null },
              ],
            },
          },
          {
            exerciseNumber: 2,
            name: 'Incremento de volumen',
            rationale: 'EVM (Source–Filter Balance) + CVT (Metal Control)',
            cvtDescription: 'Metal Control: Mantener claridad vocal durante aumento de volumen.',
            evmDescription: 'Source-Filter Balance: Equilibrio entre la fuente (cuerdas vocales) y el filtro (tracto vocal).',
            objective: 'Mantener una nota sostenida mientras aumenta ligeramente la potencia sin perder estabilidad tonal.',
            instructions: 'UrSinger genera una nota dentro del rango vocal. El usuario la sostiene y aumenta solo un poco la potencia desde el inicio hasta el final. Debe completar 3 repeticiones en un máximo de 1 minuto; si termina antes, el ejercicio se da por completado.',
            levels: {
              create: [
                { level: 1, description: '3 repeticiones sosteniendo 3 s con una subida suave de potencia.', videoUrl: null },
                { level: 2, description: '3 repeticiones sosteniendo 5 s con una subida suave de potencia.', videoUrl: null },
              ],
            },
          },
          {
            exerciseNumber: 3,
            name: 'Dinamismo de potencia controlado',
            rationale: 'CVT (Twang + Metal Control) + EVM (Anchoring)',
            cvtDescription: 'Twang + Metal Control: Cambios dinámicos manteniendo claridad y eficiencia vocal.',
            evmDescription: 'Anchoring: Estabilización laríngea durante cambios de volumen.',
            objective: 'Alternar potencia suave -> fuerte -> suave sobre una nota objetivo sin perder estabilidad tonal.',
            instructions: 'UrSinger genera una nota objetivo dentro del rango vocal del usuario. Cada ciclo suave -> fuerte -> suave cuenta como 1 repetición. Se deben completar 3 repeticiones en un máximo de 1 minuto; si termina antes, el ejercicio se da por completado.',
            levels: {
              create: [
                { level: 1, description: '3 repeticiones en nota cómoda del rango vocal.', videoUrl: null },
                { level: 2, description: '3 repeticiones en nota más alta del rango vocal.', videoUrl: null },
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
            name: 'Deslizamiento vocal',
            rationale: 'CVT (Edge) + EVM (Pitch Glide)',
            cvtDescription: 'Edge: Modo vocal que facilita transiciones entre registros sin quiebres.',
            evmDescription: 'Pitch Glide: Deslizamiento continuo del pitch a través de diferentes registros.',
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
            name: 'Expansión escalonada de notas',
            rationale: 'EVM (CT–TA Balance)',
            cvtDescription: null,
            evmDescription: 'CT-TA Balance: Equilibrio entre los músculos cricotiroides (agudos) y tiroaritenoideos (graves).',
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
            name: 'Transición de registro mixto',
            rationale: 'CVT (Curbing) + EVM (Anchoring + CT–TA Balance)',
            cvtDescription: 'Curbing: Modo vocal que facilita el registro mixto entre voz de pecho y cabeza.',
            evmDescription: 'Anchoring + CT-TA Balance: Coordinación muscular para transiciones suaves entre registros.',
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

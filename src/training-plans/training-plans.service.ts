import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface ExerciseDetail {
  planExerciseId?: string; // ID del TrainingPlanExercise (para completar)
  exerciseLevelId: number; // ID del ExerciseLevel
  exerciseId: number;
  exerciseName: string;
  groupNumber: number;
  groupName: string;
  level: number;
  description: string;
  instructions: string;
  videoUrl: string | null;
  cvtDescription: string | null; // Sustento CVT
  evmDescription: string | null; // Sustento EVM
  completionCount?: number; // Cuántas veces se completó (0-4)
  completedDates?: Date[]; // Fechas de completado
  isCompletedThisWeek?: boolean; // Si está completado en la semana actual
}

export interface ExerciseSummary {
  exerciseName: string;
  groupName: string;
  level: number;
  description: string;
  cvtDescription: string | null;
  evmDescription: string | null;
}

export interface DayPlan {
  day: number;
  dayName: string;
  exercises: ExerciseDetail[] | ExerciseSummary[];
}

export interface WeeklyPlan {
  frequency: number;
  focusGroups: number[];
  weekPlan: DayPlan[];
  instructions: string;
}

@Injectable()
export class TrainingPlansService {
  constructor(private prisma: PrismaService) {}

  /**
   * Genera un plan de entrenamiento semanal personalizado basado en las debilidades detectadas
   * Técnicas aplicadas:
   * - Weighted Selection: Todos los grupos presentes, más ejercicios para débiles
   * - Round-Robin Distribution: Distribuye ejercicios equitativamente entre los días
   * - Persistence: Guarda el plan en BD y marca anteriores como "replaced"
   */
  async generateWeeklyPlan(profileId: string): Promise<any> {
    // 1. Validar que el perfil exista
    const profile = await this.prisma.userProfile.findUnique({
      where: { id: profileId },
    });

    if (!profile) {
      throw new NotFoundException(`Perfil con ID ${profileId} no encontrado`);
    }

    // 2. Obtener la evaluación más reciente del perfil
    const latestEvaluation = await this.prisma.evaluation.findFirst({
      where: { profileId },
      orderBy: { createdAt: 'desc' },
    });

    if (!latestEvaluation) {
      throw new NotFoundException(
        `No se encontró ninguna evaluación para el perfil ${profileId}. Realiza primero una evaluación.`,
      );
    }

    // 3. Marcar planes anteriores como "replaced"
    await this.prisma.trainingPlan.updateMany({
      where: {
        profileId,
        status: 'active',
      },
      data: {
        status: 'replaced',
      },
    });

    // 4. Extraer grupos débiles y fuertes
    // weaknessesDetected viene como array de strings: ["G4", "G2"]
    const weakGroups = latestEvaluation.weaknessesDetected
      .map((w) => {
        const match = w.match(/\d+/); // Extraer solo el número
        return match ? parseInt(match[0]) : null;
      })
      .filter((g): g is number => g !== null); // Filtrar nulls y asegurar tipo number

    const allGroups = [1, 2, 3, 4, 5];
    const strongGroups = allGroups.filter((g) => !weakGroups.includes(g));

    console.log('Weak groups:', weakGroups);
    console.log('Strong groups:', strongGroups);

    // 4. Validar frecuencia semanal (MVP: bloqueado a 3 días)
    const frequency = 3; // Lunes, Miércoles, Viernes
    const totalExercisesPerDay = 3; // 3 ejercicios por día
    const totalExercisesPerWeek = totalExercisesPerDay * frequency; // 9 ejercicios en total

    // 5. NUEVA LÓGICA: Todos los grupos deben aparecer, con distribución balanceada
    // Grupos débiles: 2 ejercicios cada uno (nivel 1)
    // Grupos fuertes: 1 ejercicio cada uno (nivel 2)
    
    const selectedExercises: ExerciseDetail[] = [];

    // 6. Obtener ejercicios de TODOS los grupos
    for (const groupNum of allGroups) {
      const isWeak = weakGroups.includes(groupNum);
      const level = isWeak ? 1 : 2; // Débiles=nivel 1, Fuertes=nivel 2
      const count = isWeak ? 2 : 1; // Débiles=2 ejercicios, Fuertes=1 ejercicio

      const groupExercises = await this.getExercisesByGroups([groupNum], level);
      const selected = this.selectExercises(groupExercises, count);
      selectedExercises.push(...selected);
    }

    // 7. Si tenemos más de 9 ejercicios, ajustar
    // Si tenemos menos, rellenar con ejercicios débiles adicionales
    let finalExercises = selectedExercises;
    
    if (finalExercises.length > totalExercisesPerWeek) {
      // Priorizar ejercicios de grupos débiles
      const weakOnes = finalExercises.filter(ex => weakGroups.includes(ex.groupNumber));
      const strongOnes = finalExercises.filter(ex => !weakGroups.includes(ex.groupNumber));
      
      // Asegurar al menos 1 de cada grupo fuerte
      const guaranteedStrong = strongOnes.slice(0, strongGroups.length);
      const remainingSlots = totalExercisesPerWeek - guaranteedStrong.length;
      const selectedWeak = weakOnes.slice(0, remainingSlots);
      
      finalExercises = [...guaranteedStrong, ...selectedWeak];
    } else if (finalExercises.length < totalExercisesPerWeek) {
      // Rellenar con más ejercicios de grupos débiles
      const needed = totalExercisesPerWeek - finalExercises.length;
      const additionalWeak = await this.getExercisesByGroups(weakGroups, 1);
      const additional = this.selectExercises(additionalWeak, needed);
      finalExercises = [...finalExercises, ...additional];
    }

    // 8. Mezclar y distribuir en 3 días
    const shuffledExercises = this.shuffleArray(finalExercises);

    // 9. Calcular fecha de finalización (4 semanas desde hoy)
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 28); // 4 semanas

    // 10. Crear el plan en la BD
    const createdPlan = await this.prisma.trainingPlan.create({
      data: {
        profileId,
        evaluationId: latestEvaluation.id,
        startDate,
        endDate,
        frequency,
        focusGroups: weakGroups,
        status: 'active',
        exercises: {
          create: shuffledExercises.flatMap((exercise, index) => {
            const dayIndex = Math.floor(index / 3); // 0, 1, 2
            const dayOfWeek = [1, 3, 5][dayIndex]; // Lunes, Miércoles, Viernes
            const orderInDay = index % 3; // 0, 1, 2

            return {
              exerciseLevelId: exercise.exerciseLevelId, // Ya viene en ExerciseDetail
              dayOfWeek,
              orderInDay,
              completionCount: 0,
              completedDates: [],
            };
          }),
        },
      },
      include: {
        exercises: {
          include: {
            exerciseLevel: {
              include: {
                exercise: {
                  include: {
                    group: true,
                  },
                },
              },
            },
          },
          orderBy: [
            { dayOfWeek: 'asc' },
            { orderInDay: 'asc' },
          ],
        },
      },
    });

    // 11. Formatear respuesta para el frontend
    const currentWeek = 1; // Al crear el plan siempre empieza en semana 1
    
    // Obtener nombres de grupos para focusGroups
    const focusGroupsWithNames = await this.prisma.exerciseGroup.findMany({
      where: {
        groupNumber: { in: weakGroups },
      },
      select: {
        name: true,
      },
    });

    const weekPlan: DayPlan[] = [
      {
        day: 1,
        dayName: 'Lunes',
        exercises: this.formatExercisesForDay(createdPlan.exercises, 1, currentWeek).map(ex => ({
          exerciseName: ex.exerciseName,
          groupName: ex.groupName,
          level: ex.level,
          description: ex.description,
          cvtDescription: ex.cvtDescription,
          evmDescription: ex.evmDescription,
        })),
      },
      {
        day: 3,
        dayName: 'Miércoles',
        exercises: this.formatExercisesForDay(createdPlan.exercises, 3, currentWeek).map(ex => ({
          exerciseName: ex.exerciseName,
          groupName: ex.groupName,
          level: ex.level,
          description: ex.description,
          cvtDescription: ex.cvtDescription,
          evmDescription: ex.evmDescription,
        })),
      },
      {
        day: 5,
        dayName: 'Viernes',
        exercises: this.formatExercisesForDay(createdPlan.exercises, 5, currentWeek).map(ex => ({
          exerciseName: ex.exerciseName,
          groupName: ex.groupName,
          level: ex.level,
          description: ex.description,
          cvtDescription: ex.cvtDescription,
          evmDescription: ex.evmDescription,
        })),
      },
    ];

    return {
      planId: createdPlan.id,
      focusGroups: focusGroupsWithNames.map(g => g.name),
      startDate: createdPlan.startDate,
      endDate: createdPlan.endDate,
      weekPlan,
      instructions:
        'Repite esta misma semana durante 4 semanas consecutivas. Al finalizar el mes, realiza una nueva evaluación para ajustar tu plan.',
    };
  }

  /**
   * Formatea los ejercicios de un día específico
   */
  private formatExercisesForDay(exercises: any[], dayOfWeek: number, currentWeek: number): ExerciseDetail[] {
    return exercises
      .filter((ex) => ex.dayOfWeek === dayOfWeek)
      .map((ex) => ({
        planExerciseId: ex.id, // ID para completar el ejercicio
        exerciseLevelId: ex.exerciseLevel.id,
        exerciseId: ex.exerciseLevel.exercise.id,
        exerciseName: ex.exerciseLevel.exercise.name,
        groupNumber: ex.exerciseLevel.exercise.group.groupNumber,
        groupName: ex.exerciseLevel.exercise.group.name,
        level: ex.exerciseLevel.level,
        description: ex.exerciseLevel.description,
        instructions: ex.exerciseLevel.exercise.instructions,
        videoUrl: ex.exerciseLevel.videoUrl,
        cvtDescription: ex.exerciseLevel.exercise.cvtDescription,
        evmDescription: ex.exerciseLevel.exercise.evmDescription,
        completionCount: ex.completionCount,
        completedDates: ex.completedDates,
        isCompletedThisWeek: ex.completionCount >= currentWeek, // ✓ o ✗
      }));
  }

  /**
   * Calcula la semana actual con lógica BLOQUEADA
   * Solo avanza de semana si TODOS los 9 ejercicios están completados
   */
  private calculateCurrentWeek(plan: any): number {
    const daysSinceStart = Math.floor(
      (new Date().getTime() - plan.startDate.getTime()) /
        (1000 * 60 * 60 * 24),
    );
    const calendarWeek = Math.min(Math.floor(daysSinceStart / 7) + 1, 4);

    // Verificar si todos los ejercicios están completados para cada semana
    let actualWeek = 1;
    for (let week = 1; week <= calendarWeek; week++) {
      const allCompleted = plan.exercises.every(
        (ex: any) => ex.completionCount >= week,
      );
      if (allCompleted) {
        actualWeek = Math.min(week + 1, 4); // Avanzar a la siguiente
      } else {
        break; // Bloqueado en esta semana
      }
    }

    return actualWeek;
  }

  /**
   * Obtiene el plan activo de un usuario
   */
  async getActivePlan(profileId: string) {
    const activePlan = await this.prisma.trainingPlan.findFirst({
      where: {
        profileId,
        status: 'active',
      },
      include: {
        exercises: {
          include: {
            exerciseLevel: {
              include: {
                exercise: {
                  include: {
                    group: true,
                  },
                },
              },
            },
          },
          orderBy: [
            { dayOfWeek: 'asc' },
            { orderInDay: 'asc' },
          ],
        },
      },
    });

    if (!activePlan) {
      throw new NotFoundException(
        `No se encontró un plan activo para el perfil ${profileId}. Genera uno primero.`,
      );
    }

    // Calcular semana actual BLOQUEADA (solo avanza si todos completados)
    const currentWeek = this.calculateCurrentWeek(activePlan);

    // Formatear respuesta con info de completado
    const weekPlan: DayPlan[] = [
      {
        day: 1,
        dayName: 'Lunes',
        exercises: this.formatExercisesForDay(activePlan.exercises, 1, currentWeek),
      },
      {
        day: 3,
        dayName: 'Miércoles',
        exercises: this.formatExercisesForDay(activePlan.exercises, 3, currentWeek),
      },
      {
        day: 5,
        dayName: 'Viernes',
        exercises: this.formatExercisesForDay(activePlan.exercises, 5, currentWeek),
      },
    ];

    // Calcular completados esta semana
    const completedThisWeek = activePlan.exercises.filter(
      (ex) => ex.completionCount >= currentWeek,
    ).length;

    // Obtener nombres de grupos para focusGroups
    const focusGroupsWithNames = await this.prisma.exerciseGroup.findMany({
      where: {
        groupNumber: { in: activePlan.focusGroups },
      },
      select: {
        name: true,
      },
    });

    return {
      planId: activePlan.id,
      frequency: activePlan.frequency,
      focusGroups: focusGroupsWithNames.map(g => g.name),
      startDate: activePlan.startDate,
      endDate: activePlan.endDate,
      currentWeek, // Semana actual bloqueada
      completedThisWeek, // X/9 ejercicios completados
      totalExercises: 9,
      weekPlan,
    };
  }

  /**
   * Marca un ejercicio como completado (incrementa el contador)
   */
  async completeExercise(planExerciseId: string) {
    const exercise = await this.prisma.trainingPlanExercise.findUnique({
      where: { id: planExerciseId },
    });

    if (!exercise) {
      throw new NotFoundException(
        `Ejercicio con ID ${planExerciseId} no encontrado`,
      );
    }

    // Incrementar completionCount y agregar fecha actual
    const updated = await this.prisma.trainingPlanExercise.update({
      where: { id: planExerciseId },
      data: {
        completionCount: { increment: 1 },
        completedDates: {
          push: new Date(),
        },
      },
    });

    return {
      success: true,
      exerciseId: updated.id,
      completionCount: updated.completionCount,
      completedDates: updated.completedDates,
    };
  }

  /**
   * Obtiene el progreso del plan actual
   */
  async getProgress(profileId: string) {
    const activePlan = await this.prisma.trainingPlan.findFirst({
      where: {
        profileId,
        status: 'active',
      },
      include: {
        exercises: true,
      },
    });

    if (!activePlan) {
      throw new NotFoundException(
        `No se encontró un plan activo para el perfil ${profileId}.`,
      );
    }

    // Semana actual BLOQUEADA
    const currentWeek = this.calculateCurrentWeek(activePlan);

    const totalExercises = activePlan.exercises.length; // 9
    const totalPossibleCompletions = totalExercises * 4; // 36 (9 × 4 semanas)
    
    // Total de veces que se completaron ejercicios
    const totalCompletions = activePlan.exercises.reduce(
      (sum, ex) => sum + ex.completionCount,
      0,
    );

    // Porcentaje de avance general del mes (sobre 36)
    const monthlyProgressPercentage = Math.round(
      (totalCompletions / totalPossibleCompletions) * 100,
    );

    // Ejercicios únicos que se han completado al menos una vez
    const uniqueExercisesStarted = activePlan.exercises.filter(
      (ex) => ex.completionCount > 0,
    ).length;

    // Ejercicios completados en la semana actual
    const completedThisWeek = activePlan.exercises.filter(
      (ex) => ex.completionCount >= currentWeek,
    ).length;

    // Ejercicios faltantes para desbloquear siguiente semana
    const pendingToAdvance = totalExercises - completedThisWeek;

    // Calcular días transcurridos y semana del calendario
    const daysSinceStart = Math.floor(
      (new Date().getTime() - activePlan.startDate.getTime()) /
        (1000 * 60 * 60 * 24),
    );
    const calendarWeek = Math.min(Math.floor(daysSinceStart / 7) + 1, 4);
    const isBlocked = currentWeek < calendarWeek; // ¿Está bloqueado por ejercicios pendientes?

    return {
      planId: activePlan.id,
      
      // Progreso mensual general
      totalCompletions, // X/36 completados en total
      totalPossibleCompletions, // 36
      monthlyProgressPercentage, // % sobre los 36
      
      // Progreso semanal
      currentWeek, // Semana actual (bloqueada si no completan todos)
      calendarWeek, // Semana según calendario
      isBlocked, // true si está bloqueado por ejercicios pendientes
      completedThisWeek, // X/9 completados esta semana
      pendingToAdvance, // Cuántos faltan para desbloquear
      
      // Ejercicios únicos
      totalExercises, // 9
      uniqueExercisesStarted, // Cuántos se han intentado al menos una vez
      
      // Fechas
      startDate: activePlan.startDate,
      endDate: activePlan.endDate,
      daysRemaining: Math.ceil(
        (activePlan.endDate.getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24),
      ),
      daysSinceStart,
    };
  }

  /**
   * Obtiene un ejercicio específico del plan de entrenamiento
   */
  async getExercise(planExerciseId: string) {
    const planExercise = await this.prisma.trainingPlanExercise.findUnique({
      where: { id: planExerciseId },
      include: {
        plan: {
          include: {
            exercises: true,
          },
        },
        exerciseLevel: {
          include: {
            exercise: {
              include: {
                group: true,
              },
            },
          },
        },
      },
    });

    if (!planExercise) {
      throw new NotFoundException(
        `Ejercicio con ID ${planExerciseId} no encontrado`,
      );
    }

    // Calcular semana actual del plan
    const currentWeek = this.calculateCurrentWeek(planExercise.plan);

    return {
      planExerciseId: planExercise.id,
      exerciseLevelId: planExercise.exerciseLevel.id,
      exerciseId: planExercise.exerciseLevel.exercise.id,
      exerciseName: planExercise.exerciseLevel.exercise.name,
      groupNumber: planExercise.exerciseLevel.exercise.group.groupNumber,
      groupName: planExercise.exerciseLevel.exercise.group.name,
      level: planExercise.exerciseLevel.level,
      description: planExercise.exerciseLevel.description,
      instructions: planExercise.exerciseLevel.exercise.instructions,
      videoUrl: planExercise.exerciseLevel.videoUrl,
      cvtDescription: planExercise.exerciseLevel.exercise.cvtDescription,
      evmDescription: planExercise.exerciseLevel.exercise.evmDescription,
      completionCount: planExercise.completionCount,
      completedDates: planExercise.completedDates,
      isCompletedThisWeek: planExercise.completionCount >= currentWeek,
      dayOfWeek: planExercise.dayOfWeek,
      orderInDay: planExercise.orderInDay,
    };
  }

  /**
   * Obtiene ejercicios de grupos específicos con un nivel determinado
   */
  private async getExercisesByGroups(
    groupNumbers: number[],
    level: number,
  ): Promise<ExerciseDetail[]> {
    const exerciseLevels = await this.prisma.exerciseLevel.findMany({
      where: {
        level,
        exercise: {
          group: {
            groupNumber: { in: groupNumbers },
          },
        },
      },
      include: {
        exercise: {
          include: {
            group: true,
          },
        },
      },
    });

    return exerciseLevels.map((el) => ({
      exerciseLevelId: el.id, // ID del ExerciseLevel
      exerciseId: el.exercise.id,
      exerciseName: el.exercise.name,
      groupNumber: el.exercise.group.groupNumber,
      groupName: el.exercise.group.name,
      level: el.level,
      description: el.description,
      instructions: el.exercise.instructions,
      videoUrl: el.videoUrl,
      cvtDescription: el.exercise.cvtDescription,
      evmDescription: el.exercise.evmDescription,
    }));
  }

  /**
   * Selecciona N ejercicios de una lista evitando repeticiones
   * Si hay menos ejercicios disponibles que los solicitados, puede repetir
   */
  private selectExercises(
    exercises: ExerciseDetail[],
    count: number,
  ): ExerciseDetail[] {
    if (exercises.length === 0) return [];
    if (exercises.length >= count) {
      // Suficientes ejercicios, seleccionar sin repetir
      return this.shuffleArray([...exercises]).slice(0, count);
    } else {
      // Pocos ejercicios, repetir algunos
      const selected: ExerciseDetail[] = [];
      const shuffled = this.shuffleArray([...exercises]);
      for (let i = 0; i < count; i++) {
        selected.push(shuffled[i % shuffled.length]);
      }
      return selected;
    }
  }

  /**
   * Mezcla un array usando Fisher-Yates shuffle (distribución uniforme)
   */
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}

export interface SelectableExercise {
  exerciseLevelId: number;
  exerciseId: number;
  exerciseName: string;
  groupNumber: number;
  groupName: string;
  level: number;
  description: string;
  instructions: string;
  videoUrl: string | null;
  cvtDescription: string | null;
  evmDescription: string | null;
}

/**
 * Servicio de dominio puro: algoritmo de selección ponderada + distribución round-robin.
 * No tiene dependencias externas: solo recibe datos y retorna selección.
 */
export class ExerciseSelectionService {
  private readonly TOTAL_PER_WEEK = 9;
  private readonly DAYS = [1, 3, 5]; // Lunes, Miércoles, Viernes
  private readonly EXERCISES_PER_DAY = 3;

  buildSelection(
    allGroups: number[],
    weakGroups: number[],
    exercisesByGroupAndLevel: Map<string, SelectableExercise[]>,
  ): SelectableExercise[] {
    const selected: SelectableExercise[] = [];

    for (const groupNum of allGroups) {
      const isWeak = weakGroups.includes(groupNum);
      const level = isWeak ? 1 : 2;
      const count = isWeak ? 2 : 1;
      const key = `${groupNum}:${level}`;
      const available = exercisesByGroupAndLevel.get(key) ?? [];
      selected.push(...this.pickRandom(available, count));
    }

    return this.adjustToTarget(selected, weakGroups, exercisesByGroupAndLevel);
  }

  distributeAcrossDays(exercises: SelectableExercise[]): Array<{ exerciseLevelId: number; dayOfWeek: number; orderInDay: number }> {
    const shuffled = this.shuffle([...exercises]);
    return shuffled.map((ex, index) => ({
      exerciseLevelId: ex.exerciseLevelId,
      dayOfWeek: this.DAYS[Math.floor(index / this.EXERCISES_PER_DAY)],
      orderInDay: index % this.EXERCISES_PER_DAY,
    }));
  }

  private adjustToTarget(
    current: SelectableExercise[],
    weakGroups: number[],
    exercisesByGroupAndLevel: Map<string, SelectableExercise[]>,
  ): SelectableExercise[] {
    if (current.length > this.TOTAL_PER_WEEK) {
      const weak = current.filter((e) => weakGroups.includes(e.groupNumber));
      const strong = current.filter((e) => !weakGroups.includes(e.groupNumber));
      const remaining = this.TOTAL_PER_WEEK - strong.length;
      return [...strong, ...weak.slice(0, remaining)];
    }

    if (current.length < this.TOTAL_PER_WEEK) {
      const needed = this.TOTAL_PER_WEEK - current.length;
      const weakLevel1Exercises: SelectableExercise[] = [];
      for (const g of weakGroups) {
        weakLevel1Exercises.push(...(exercisesByGroupAndLevel.get(`${g}:1`) ?? []));
      }
      current.push(...this.pickRandom(weakLevel1Exercises, needed));
    }

    return current;
  }

  private pickRandom(exercises: SelectableExercise[], count: number): SelectableExercise[] {
    if (exercises.length === 0) return [];
    const shuffled = this.shuffle([...exercises]);
    if (shuffled.length >= count) return shuffled.slice(0, count);
    const result: SelectableExercise[] = [];
    for (let i = 0; i < count; i++) result.push(shuffled[i % shuffled.length]);
    return result;
  }

  private shuffle<T>(arr: T[]): T[] {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
}

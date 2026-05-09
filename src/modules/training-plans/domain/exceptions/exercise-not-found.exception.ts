export class ExerciseNotFoundException extends Error {
  constructor(planExerciseId: string) {
    super(`Ejercicio ${planExerciseId} no encontrado`);
    this.name = 'ExerciseNotFoundException';
  }
}

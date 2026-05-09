export class NoEvaluationFoundException extends Error {
  constructor(profileId: string) {
    super(`No se encontró evaluación para el perfil ${profileId}. Realiza primero una evaluación.`);
    this.name = 'NoEvaluationFoundException';
  }
}

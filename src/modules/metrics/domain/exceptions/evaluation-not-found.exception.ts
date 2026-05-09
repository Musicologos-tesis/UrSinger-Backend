export class EvaluationNotFoundException extends Error {
  constructor(sessionId: string) {
    super(`Evaluación ${sessionId} no encontrada`);
    this.name = 'EvaluationNotFoundException';
  }
}

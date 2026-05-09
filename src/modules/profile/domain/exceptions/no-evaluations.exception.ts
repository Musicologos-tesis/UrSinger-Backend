export class NoEvaluationsException extends Error {
  constructor() {
    super('No hay evaluaciones para este perfil');
    this.name = 'NoEvaluationsException';
  }
}

export class CalibrationNotFoundException extends Error {
  constructor(sessionId: string) {
    super(`Calibración ${sessionId} no encontrada`);
    this.name = 'CalibrationNotFoundException';
  }
}

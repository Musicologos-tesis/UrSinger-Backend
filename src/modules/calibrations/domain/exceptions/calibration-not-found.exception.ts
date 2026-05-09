export class CalibrationNotFoundException extends Error {
  constructor(identifier: string) {
    super(`Calibración no encontrada: ${identifier}`);
    this.name = 'CalibrationNotFoundException';
  }
}

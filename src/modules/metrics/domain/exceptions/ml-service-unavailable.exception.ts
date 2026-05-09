export class MLServiceUnavailableException extends Error {
  constructor() {
    super('El servicio ML no está disponible');
    this.name = 'MLServiceUnavailableException';
  }
}

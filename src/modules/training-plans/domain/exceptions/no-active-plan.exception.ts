export class NoActivePlanException extends Error {
  constructor(profileId: string) {
    super(`No se encontró un plan activo para el perfil ${profileId}`);
    this.name = 'NoActivePlanException';
  }
}

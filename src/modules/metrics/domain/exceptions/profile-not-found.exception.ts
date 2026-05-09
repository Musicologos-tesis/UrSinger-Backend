export class ProfileNotFoundException extends Error {
  constructor(profileId: string) {
    super(`Perfil ${profileId} no encontrado`);
    this.name = 'ProfileNotFoundException';
  }
}

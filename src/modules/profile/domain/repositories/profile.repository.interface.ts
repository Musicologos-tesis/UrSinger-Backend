export interface ProfileUpdateData {
  name?: string;
  age?: number;
  gender?: string;
  weeklyTrainingFreq?: number;
}

export interface ProfileRecord {
  id: string;
  userId: string;
  name: string;
  age: number;
  gender: string;
  weeklyTrainingFreq: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProfileRepository {
  findByUserId(userId: string): Promise<ProfileRecord | null>;
  findById(profileId: string): Promise<ProfileRecord | null>;
  update(userId: string, data: ProfileUpdateData): Promise<ProfileRecord>;
}

export const PROFILE_REPOSITORY = Symbol('IProfileRepository');

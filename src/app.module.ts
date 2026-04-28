import { Module } from '@nestjs/common';
import { AppConfigModule } from './config/config.module';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { CalibrationsModule } from './calibrations/calibrations.module';
import { MetricsModule } from './metrics/metrics.module';
import { AuthModule } from './auth/auth.module';
import { ProfileModule } from './profile/profile.module';
import { ExercisesModule } from './exercises/exercises.module';
import { TrainingPlansModule } from './training-plans/training-plans.module';

@Module({
  imports: [
    AppConfigModule,
    PrismaModule,
    HealthModule,
    AuthModule,
    ProfileModule,
    CalibrationsModule,
    MetricsModule,
    ExercisesModule,
    TrainingPlansModule,
  ],
})
export class AppModule {}

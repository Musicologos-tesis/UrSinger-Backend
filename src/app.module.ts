import { Module } from '@nestjs/common';
import { AppConfigModule } from './config/config.module';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './modules/auth/infrastructure/auth.module';
import { ProfileModule } from './modules/profile/infrastructure/profile.module';
import { CalibrationsModule } from './modules/calibrations/infrastructure/calibrations.module';
import { MetricsModule } from './modules/metrics/infrastructure/metrics.module';
import { ExercisesModule } from './modules/exercises/infrastructure/exercises.module';
import { TrainingPlansModule } from './modules/training-plans/infrastructure/training-plans.module';

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

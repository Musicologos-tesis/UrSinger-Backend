import { Module } from '@nestjs/common';
import { MetricsController } from './metrics.controller';
import { MetricsService } from './metrics.service';
import { PrismaModule } from '../prisma/prisma.module';
import { LearningModule } from '../learning/learning.module';

@Module({
  imports: [PrismaModule, LearningModule],
  controllers: [MetricsController],
  providers: [MetricsService],
  exports: [MetricsService],
})
export class MetricsModule {}

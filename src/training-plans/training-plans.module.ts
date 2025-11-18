import { Module } from '@nestjs/common';
import { TrainingPlansService } from './training-plans.service';
import { TrainingPlansController } from './training-plans.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [TrainingPlansService],
  controllers: [TrainingPlansController]
})
export class TrainingPlansModule {}

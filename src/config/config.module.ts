import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validationSchema } from './validation';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true, validationSchema })],
})
export class AppConfigModule {}

import { Module } from '@nestjs/common';
import { ContestDescriptionService } from './contest-description.service';
import { ContestDescriptionController } from './contest-description.controller';

@Module({
  controllers: [ContestDescriptionController],
  providers: [ContestDescriptionService],
})
export class ContestDescriptionModule {}

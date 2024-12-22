import { Controller, Get } from '@nestjs/common';
import { ContestService } from './contest.service';

@Controller()
export class ContestController {
  constructor(private readonly contestService: ContestService) {}

  @Get()
  getHello(): string {
    return this.contestService.getHello();
  }
}

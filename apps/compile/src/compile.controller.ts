import { Controller, Get } from '@nestjs/common';
import { CompileService } from './compile.service';

@Controller()
export class CompileController {
  constructor(private readonly compileService: CompileService) {}

  @Get()
  getHello(): string {
    return this.compileService.getHello();
  }
}

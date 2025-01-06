import { Controller, Get } from '@nestjs/common';
import { CompileService } from './compile.service';
import { CompileServiceControllerMethods, CompileServiceController, Compile } from '@app/common';

@Controller()
@CompileServiceControllerMethods()
export class CompileController implements CompileServiceController {
  constructor(private readonly compileService: CompileService) {}
  testCompile(request: Compile): void {
    console.log(request)
  }


  @Get()
  getHello(): string {
    return this.compileService.getHello();
  }
  
}

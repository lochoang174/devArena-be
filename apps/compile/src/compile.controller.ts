import { Controller, Get } from '@nestjs/common';
import { CompileService } from './compile.service';
import { CompileServiceControllerMethods, CompileServiceController, CompileRequest, CompileStatus } from '@app/common';
import { Observable } from 'rxjs';

@Controller()
@CompileServiceControllerMethods()
export class CompileController implements CompileServiceController {
  constructor(private readonly compileService: CompileService) {}
  runCompile(request: CompileRequest): Observable<CompileStatus> {
    try {
    return this.compileService.compile(request)
      
    } catch (error) {
      throw new Error('Method not implemented.');
      
    }
  }




  
}

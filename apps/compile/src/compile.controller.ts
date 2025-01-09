import { Controller, Get } from '@nestjs/common';
import { CompileService } from './compile.service';
import { CompileServiceControllerMethods, CompileServiceController, CompileRequest, CompileStatus, CompileResult } from '@app/common';
import { Observable } from 'rxjs';

@Controller()
@CompileServiceControllerMethods()
export class CompileController implements CompileServiceController {
  constructor(private readonly compileService: CompileService) {}
  runSubmit(request: CompileRequest): Observable<CompileResult> {
        try {
      return this.compileService.submit(request)
        
      } catch (error) {
        throw new Error('Method not implemented.');
        
      }  
  }

  runCompile(request: CompileRequest): Observable<CompileStatus> {
    try {
    return this.compileService.compile(request)
      
    } catch (error) {
      throw new Error('Method not implemented.');
      
    }
  }




  
}

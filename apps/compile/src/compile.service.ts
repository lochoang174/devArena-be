import { Injectable } from '@nestjs/common';

@Injectable()
export class CompileService {
  getHello(): string {
    return 'Hello World!';
  }
}

import { Injectable } from '@nestjs/common';

@Injectable()
export class ContestService {
  getHello(): string {
    return 'Hello World!';
  }
}

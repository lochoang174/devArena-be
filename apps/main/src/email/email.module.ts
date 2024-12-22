import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  providers: [EmailService,],
  exports:[EmailService],
imports:[    ConfigModule.forRoot({
  isGlobal: true,
  envFilePath: '.env',
}),]
})
export class EmailModule {}

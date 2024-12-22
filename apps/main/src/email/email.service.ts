import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('EMAIL_HOST'),
      port: this.configService.get<number>('EMAIL_PORT') ,
      secure: false, // Use TLS, for Gmail it should be false for port 587
      auth: {
        user: this.configService.get<string>('EMAIL_USER') ,
        pass: this.configService.get<string>('EMAIL_PASS') 
      },
    });
    
  }

  async sendMail(to: string, subject: string, text: string, html?: string) {
    const info = await this.transporter.sendMail({
      from: this.configService.get<string>('MAIL_FROM'),
      to,
      subject,
      text,
      html,
    });
    return info;
  }
}

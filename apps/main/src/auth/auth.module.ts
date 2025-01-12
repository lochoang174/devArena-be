import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { EmailModule } from '../email/email.module';
import { TokenService } from './jwt/token.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './passports/local.strategy';
import { JwtStrategy } from './passports/jwt.strategy';
import { GoogleStrategy } from './passports/google.strategy';
import { GithubStrategy } from './passports/github.strategy';
import { DiscordStrategy } from './passports/discord.strategy';

@Module({
  controllers: [AuthController],
  providers: [AuthService,LocalStrategy,JwtStrategy,GoogleStrategy,GithubStrategy,DiscordStrategy],
  imports: [
    UserModule,
    EmailModule,
    PassportModule,
    JwtModule.register({
      secret: 'your-jwt-secret',
      signOptions: { expiresIn: 3600 },
    }),
  ],
})
export class AuthModule {}   
 
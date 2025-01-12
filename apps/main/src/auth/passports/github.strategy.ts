// github.strategy.ts
import { Injectable, Scope } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor() {
    super({
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.GITHUB_CALLBACK_URL,
        scope: ['user:email'], // Chú ý đã yêu cầu quyền truy cập email
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    const { name, photos,emails } = profile;
    console.log(profile)
    const user = {
      email: emails[0].value,
    
      accessToken,  
    };
    return user
  }
}

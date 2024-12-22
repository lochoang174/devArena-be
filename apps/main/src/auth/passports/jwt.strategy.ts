// /* eslint-disable */

// import { ExtractJwt, Strategy } from 'passport-jwt';
// import { PassportStrategy } from '@nestjs/passport';
// import { Injectable, UnauthorizedException } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { IUser } from 'src/interface/IUer';

// @Injectable()
// export class JwtStrategy extends PassportStrategy(Strategy) {
//   constructor(private configService: ConfigService) {
//     super({
//       jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//       ignoreExpiration: false,
//       secretOrKey: configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
//     });
//   }

//   async validate(payload: IUser) {
//     const { _id, name, email, role } = payload;
//     const userRole = role as unknown as {_id: string, name: string}
//     // const temp = await this.rolesService.findOne(userRole._id);
  
//     return {
//       _id,
//       name,
//       email,
//       role,
//       permissions: temp?.permissions ??[]
//     };
//   }
// }

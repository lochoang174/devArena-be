/* eslint-disable */

import { IS_PUBLIC_KEY } from '@app/common';
import {
    ExecutionContext,
    ForbiddenException,
    Injectable,
    UnauthorizedException,
  } from '@nestjs/common';
  import { Reflector } from '@nestjs/core';
  import { AuthGuard } from '@nestjs/passport';
  import { Request } from 'express';
  
  @Injectable()
  export class JwtAuthGuard extends AuthGuard('jwt') {
    constructor(private reflector: Reflector) {
      super();
    }
  
    canActivate(context: ExecutionContext) {
      const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
      if (isPublic) {
        return true;
      }
      return super.canActivate(context);
    }
    handleRequest(err, user, info, context: ExecutionContext) {
      // You can throw an exception based on either "info" or "err" arguments
      const request: Request = context.switchToHttp().getRequest();     
      if (err || !user) {
        throw err || new UnauthorizedException('Token invalid');
      }
    //   const targetMethod = request.method;
    //   const targetEndpoint = request.route?.path;
    //   const permissions = user?.permissions ?? [];
    //   const isExist = permissions.find((per) => {
    //     return  targetMethod === per.method && targetEndpoint===per.apiPath;
    //   });
  
    //   if (!isExist && targetEndpoint !== '/api/v1/auth/account' && targetEndpoint !== '/api/v1/auth/logout') {
    //     throw new ForbiddenException('unathorized');
    //   }
      return user;
    }
  }
  
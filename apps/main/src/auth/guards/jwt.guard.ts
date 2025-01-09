/* eslint-disable */

import { IS_PUBLIC_KEY } from "@app/common";
import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { GqlExecutionContext } from "@nestjs/graphql";
import { AuthGuard } from "@nestjs/passport";
import { Request } from "express";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  constructor(private reflector: Reflector) {
    super();
  }

  getRequest(context: ExecutionContext) {
    if (context.getType() === "http") {
      return context.switchToHttp().getRequest();
    }

    // Handle GraphQL context
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;

    // Ensure request has all required properties for Passport
    if (request) {
      request.logIn = request.logIn || (() => {});
      request.logOut = request.logOut || (() => {});
    }

    return request;
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    } 

    const request = this.getRequest(context);
    console.log(request?.headers?.authorization)
    if (!request?.headers?.authorization) {
      throw new UnauthorizedException("Missing authorization token");
    }

    return super.canActivate(context);
  }
  handleRequest(err, user, info, context: ExecutionContext) {
    // You can throw an exception based on either "info" or "err" arguments
    // const request: Request = context.switchToHttp().getRequest();
    console.log(info)

    if(info&&info.message==="jwt expired"){
      console.log("error")
      throw new UnauthorizedException("Jwt expired")
    }
    if (err || !user) {
      throw new UnauthorizedException("Token invalid");
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

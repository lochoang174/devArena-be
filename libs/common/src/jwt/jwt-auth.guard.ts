import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from "@nestjs/common";
import { catchError, map, Observable, of, tap } from "rxjs";
import { MAIN_SERVICE } from "../constants";
import { IUser } from "../types";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";
import { ClientProxy } from "@nestjs/microservices";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  constructor(
    private readonly reflector: Reflector,    
    @Inject(MAIN_SERVICE) private readonly authClient: ClientProxy,
  ) {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return false;
    }

    const jwt = authHeader.split(" ")[1];
    if (!jwt) {
      return false;
    }

    return this.authClient
      .send<IUser>("authenticate", {
        Authentication: jwt,
      })
      .pipe(
        tap((res) => {
          context.switchToHttp().getRequest().user = res;
        }),
        map(() => true),
        catchError(() => of(false)),
      );
  }
}

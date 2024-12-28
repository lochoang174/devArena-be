import { Roles } from "@app/common";
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { GqlExecutionContext } from "@nestjs/graphql";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get(Roles, context.getHandler());
    if (!roles) {
      return true;
    }

    // Kiểm tra xem context là HTTP hay GraphQL
    const contextType = context.getType();
    let user;

    if (contextType === "http") {
      user = context.switchToHttp().getRequest().user;
    } else {
      // Trường hợp GraphQL
      const gqlContext = GqlExecutionContext.create(context);
      user = gqlContext.getContext().req.user;
    }

    if (!user) {
      throw new ForbiddenException("User not found in request");
    }

    if (roles.includes(user.role)) return true;
    throw new ForbiddenException(
      "You are not authorized to access this resource",
    );
  }
}

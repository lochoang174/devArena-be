/* eslint-disable */
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { MESSAGE_RESPONSE } from "../decorators/customize";

export interface Response<T> {
  statusCode: number;
  message: string;
  data: T;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  constructor(private reflector: Reflector) {}
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => {
        const contextType = context.getType<string>();

        if (contextType === "graphql") {
          return data; // Trả về dữ liệu gốc cho GraphQL
        }

        // Nếu không phải GraphQL, định dạng lại cho API HTTP
        return {
          statusCode: context.switchToHttp().getResponse().statusCode,
          message:
            this.reflector.get<string>(
              MESSAGE_RESPONSE,
              context.getHandler(),
            ) || "",
          data: data,
        };
      }),
    );
  }
}

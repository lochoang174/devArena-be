import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: string | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    
    // If data is provided, return specific field from user
    if (data) {
      return request.user?.[data];
    }

    return request.user;
  },
);

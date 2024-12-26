import {
    ExecutionContext,
    SetMetadata,
    createParamDecorator,
  } from '@nestjs/common';
  
  export const IS_PUBLIC_KEY = 'isPublic';
  export const MESSAGE_RESPONSE= "response_message"
  
  export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

  export const ResponseMessage = (message: string) =>
        SetMetadata(MESSAGE_RESPONSE, message);
  
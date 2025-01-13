import { Catch, ExceptionFilter, ArgumentsHost, RpcExceptionFilter } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { RpcException } from '@nestjs/microservices';

@Catch()
export class CustomRpcExceptionFilter<T> implements RpcExceptionFilter<T> {
  catch(exception: T, host: ArgumentsHost): Observable<any> {
    let code = 500; // Mặc định mã lỗi
    let message = 'An unexpected error occurred'; // Mặc định thông báo lỗi

    // Kiểm tra nếu lỗi là RpcException
    if (exception instanceof RpcException) {
      const errorResponse = exception.getError();
      code = errorResponse['code'] || code; // Lấy mã lỗi từ RpcException
      message = errorResponse['message'] || message; // Lấy thông báo từ RpcException
    }

    // Trả về lỗi chuẩn hóa
    return throwError(() => ({
      status: 'error',
      code,
      message,
    }));
  }
}

import { Controller, Post, Body, HttpCode, HttpStatus, Param, HttpException, Res, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDTO } from './dto/signup.dto';
import { Response } from 'express';  // Import the Express Response type
import { CurrentUser, JwtAuthGuard } from '@app/common';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { ResendDTO } from './dto/resend.dto';
import { VerifyDTO } from './dto/verifyOtp.dto';
import { Public, ResponseMessage } from '@app/common/decorators/customize';
import { IUser } from '@app/common/types';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  
  @Post('signup')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage("Signup successfully!")
  async signup(@Body() signupDto: SignupDTO) {
    const newUser = await  this.authService.signup(signupDto)
    return {data: newUser};
    
  }
  @Public()
  @Post('resend-otp')
  @HttpCode(HttpStatus.NO_CONTENT)
  async resend(@Body() resend: ResendDTO) {
    const newUser = await  this.authService.resendOtpCode(resend.email)
    return {data: newUser};
    
  }

  @Post('verify')
  @Public()
  @HttpCode(HttpStatus.NO_CONTENT)
  async verifyOtp(@Body() verify: VerifyDTO) {
    const newUser = await  this.authService.validateOtp(verify.email,verify.otpCode)
    return {data: newUser};
    
  }

  @Post('login')
  @Public()
  @UseGuards(LocalAuthGuard) // Sửa Local thành LocalAuthGuard
  @HttpCode(HttpStatus.OK)
  @ResponseMessage("Signup successfully!")
  async login(@CurrentUser() user:IUser) {
    const res = this.authService.login(user)
    return res
  }

  @Post('logout')
  async logout() {
    return this.authService.logout();
  }


  @MessagePattern('authenticate')
  async authenticate(@Payload() data: any) {
    return data.user;
  }
  // @Get('verify/:jwt')  
  // @HttpCode(HttpStatus.CREATED)
  // async verifyUser(
  //   @Param('jwt') jwt: string,  // lấy jwt từ URL params
  //   @Res({ passthrough: true }) response: Response
  // ) {
  //   try {
  //     // Truyền thêm jwt vào hàm verifyUser để xử lý
  //    await this.authService.verifyUser(jwt);
      
  //     // Redirect to the desired URL after success
  //     return response.redirect('https://www.google.com/'); // Redirect to /home
      
  //   } catch (error) {
  //     console.log(error)
  //     throw new HttpException('Verification failed', HttpStatus.BAD_REQUEST);
  //   }
  // }
  
}

import { Controller, Post, Body, HttpCode, HttpStatus, Param, HttpException, Res, Get, UseGuards, Req, Query, Session } from '@nestjs/common';
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
import { refreshDto } from './dto/refresh.dto';
import { AuthGuard } from '@nestjs/passport';

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
  @Public()
  @Post("refresh")
  async refresh( @Body() payload:refreshDto){
    return this.authService.refreshToken(payload.refreshToken)
  }


  @Get("/provider/google")
  @Public()
  @UseGuards(AuthGuard('google'))
  async addProvider() {

    // Redirect đến Google OAuth
    return "Redirecting to Google OAuth...";
  }
  @Get('/google')
  @Public()
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res) {

    await this.authService.addProvider("google",req.user.email)
    const isConnected = true; // Ví dụ kiểm tra trạng thái
    const message = isConnected
      ? 'Connect thành công'
      : 'Gmail này đã được connect vào tài khoản khác';
  
    // Redirect về FE với query parameters
    res.redirect(
      `http://localhost:3000/account-management?status=${isConnected ? 'success' : 'error'}&message=${encodeURIComponent(message)}`
    );
  }

  @Get("/provider/github")
  @Public()
  @UseGuards(AuthGuard('github'))
  async addgithubProvider(){
    console.log("djalkdj")
      return "data"
  }
  @Get('/github')
  @Public()
  @UseGuards(AuthGuard('github'))
  async githubAuthRedirect(@Req() req, @Res() res) {
    await this.authService.addProvider("github",req.user.email).catch((e)=>{
      res.redirect(
        `http://localhost:3000/account-management?status= 'error'}&message=loi}`
      );
    })
    const isConnected = true; // Ví dụ kiểm tra trạng thái
    const message = isConnected
      ? 'Connect thành công'
      : 'Gmail này đã được connect vào tài khoản khác';
   
    // Redirect về FE với query parameters
    res.redirect(
      `http://localhost:3000/account-management?status=${isConnected ? 'success' : 'error'}&message=${encodeURIComponent(message)}`
    );
  }

  @Get("/provider/discord")
  @Public()
  @UseGuards(AuthGuard('discord'))
  async adddiscordProvider(){
    console.log("djalkdj")
      return "data"
  }
  @Get('/discord')
  @Public()
  @UseGuards(AuthGuard('discord'))
  async gitdiscordAuthRedirect(@Req() req, @Res() res) {
    await this.authService.addProvider("discord",req.user.email)
    const isConnected = true; // Ví dụ kiểm tra trạng thái
    const message = isConnected
      ? 'Connect thành công'
      : 'Gmail này đã được connect vào tài khoản khác';
  
    // Redirect về FE với query parameters
    res.redirect(
      `http://localhost:3000/account-management?status=${isConnected ? 'success' : 'error'}&message=${encodeURIComponent(message)}`
    );
  }

}

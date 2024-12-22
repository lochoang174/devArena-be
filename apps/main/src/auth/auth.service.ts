import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { compare } from 'bcrypt';
import { UserService } from '../user/user.service';
import { SignupDTO } from './dto/signup.dto';
import { ProviderEnum, RoleEnum } from '../user/schema/user.schema';
import * as bcrypt from 'bcrypt';
import { CustomException } from '@app/common';
import { EmailService } from '../email/email.service';
import { TokenService } from './jwt/token.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UserService,
        private readonly emailService: EmailService,
        private jwtService: JwtService,
        private configService: ConfigService,


    ) {}
  async validate(email: string, password: string,provider: ProviderEnum): Promise<any> {
    try {
      // Find user in database
      const user = await this.usersService.findByEmail(email)
      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }
      if(!user.providers.includes(provider)){
        if(provider===ProviderEnum.CREDENTIALS && user.isEmailVerified===false){
          throw new CustomException("Your account is not verify",400)

        }
        throw new CustomException("providers not found",404)
      }
      if(provider===ProviderEnum.CREDENTIALS && user.password){
        const isPasswordValid = await compare(password, user.password);
        if (!isPasswordValid) {
          throw new UnauthorizedException('Invalid credentials');
        }
      }
      

      // Verify password
   

      // Return user without password
  
      return user;
    } catch (error) {
      throw error;
    }
  }


  async signup(signupDto: SignupDTO) {
    // const username = signupDto.email.split('@')[0];
    let password = null;
    let isCreatePassword = false
    if(signupDto.provider===ProviderEnum.CREDENTIALS){
        password = await bcrypt.hash(signupDto.password, 10);
        isCreatePassword=true
    }
    const user= await this.usersService.create({
        username:signupDto.username,
        email:signupDto.email,
        providers:[signupDto.provider],
         isEmailVerified:false,
         role:RoleEnum.CLIENT,
         password,
         isCreatePassword,


    }).catch((e)=>{
      throw new CustomException("User is existed",400)
    })
    if(signupDto.provider===ProviderEnum.CREDENTIALS){
        // const jwt = this.tokenService.generateLoginToken(user._id.toString())
        // const jwt = await this.jwtService.sign({userId:user._id}, {
        //     secret: this.configService.get<string>('JWT_ENABLE'),
        //     expiresIn:'3000s'
        //     // expiresIn: this.configService.get<string>('JWT_ENABLE_EXPIRED'),
        //   });
          this.resendOtpCode(signupDto.email)
        // let verificationUrl=`http://localhost:3000/api/auth/verify/${jwt}`
        // this.emailService.sendMail(signupDto.email,"Verify your account","",` <div>
        //     <h1>Welcome to Our Service</h1>
        //     <p>Thank you for registering. Please click the button below to verify your account:</p>
        //     <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; font-size: 16px; color: #fff; background-color: #28a745; text-decoration: none; border-radius: 5px;">Verify Account</a>
        //     <p>If you did not register, please ignore this email.</p>
        //   </div>`)
    }
    return user
  }
  async validateOtp(email: string, otpCode: string) {
    try {
      // Tìm người dùng bằng email
      const user = await this.usersService.findByEmail(email);
      if (!user) {
        throw new CustomException('User not found', 404);
      }
  
      // Kiểm tra xem OTP có khớp không
      if (user.otpCode !== otpCode) {
        throw new CustomException('Invalid OTP code', 400);
      }
  
      // Kiểm tra xem OTP đã hết hạn chưa
      if (new Date() > user.otpCodeExpired) {
        throw new CustomException('OTP code has expired', 400);
      }
  
      // Cập nhật trạng thái xác thực và xóa OTP
      await this.usersService.updateUserVerification(user.id);
  
      return { message: 'Account verified successfully' };
    } catch (error) {
      throw error;
    }
  }
  

  async logout() {
    // return this.usersService.remove(signupDto);
  }
  async resendOtpCode(email: string) {
    try {
      // Kiểm tra xem người dùng có tồn tại không
      const user = await this.usersService.findByEmail(email);
      if (!user) {
        throw new CustomException('User not found', 404);
      }

      // Random OTP code (6 số)
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

      // Đặt thời gian hết hạn là 5 phút kể từ lúc gửi
      const otpCodeExpired = new Date();
      otpCodeExpired.setMinutes(otpCodeExpired.getMinutes() + 5);

      // Cập nhật user với mã OTP mới và thời gian hết hạn
      await this.usersService.updateUserOtp(user.id, otpCode, otpCodeExpired);

      // Gửi email OTP
      const emailContent = `
        <div>
          <h1>Your OTP Code</h1>
          <p>Your verification code is: <strong>${otpCode}</strong></p>
          <p>This code will expire in 5 minutes.</p>
          <p>If you did not request this, please ignore this email.</p>
        </div>`;
      await this.emailService.sendMail(
        email,
        'Your OTP Code',
        '',
        emailContent,
      );

      return { message: 'OTP code sent successfully' };
    } catch (error) {
      throw error;
    }
  }


}

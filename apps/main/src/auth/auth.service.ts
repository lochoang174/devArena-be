import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { compare } from "bcrypt";
import { UserService } from "../user/user.service";
import { SignupDTO } from "./dto/signup.dto";
import { ProviderEnum, RoleEnum } from "../schemas/user.schema";
import * as bcrypt from "bcrypt";
import { CustomException } from "@app/common";
import { EmailService } from "../email/email.service";
import { TokenService } from "./jwt/token.service";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { ProviderDTO } from "./dto/provider.dto";
import { IUser } from "@app/common/types";
import { join } from "path";
import { unlink } from "fs/promises";
import { UpdateProfileDto } from "./dto/updateProfile";
import { UpdatePasswordDto } from "./dto/update-password.dto";
import { ResendDTO } from "./dto/resend.dto";
import { ResetPassworDto } from "./dto/reset-password.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UserService,
    private readonly emailService: EmailService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) { }
  async validate(
    emailValidate: string,
    password: string,
    provider: ProviderEnum,
  ): Promise<any> {
    const user = await this.usersService.findByEmail(emailValidate);
    console.log(user)

    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }
    if (provider === ProviderEnum.CREDENTIALS) {
      // Check if user has set password
      if (!user.isCreatePassword || !user.password) {
        throw new CustomException("Please set your password first", 400);
      }

      // Validate password
      const isPasswordValid = await compare(password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException("Invalid credentials");
      }

      if (!user.isEmailVerified) {
        throw new CustomException("Your account is not verified", 400);
      }
    } else {
      // For OAuth providers, check if the provider exists in user's providers array
      const providerInfo = user.providers.find((p) => p === provider);

      if (!providerInfo) {
        throw new CustomException(
          `This email is not registered with ${provider}`,
          404,
        );
      }
    }

    // Remove password from response
    const { role, _id, username, email, providers,avatar, isCreatePassword } = user.toObject();
    const url_profile= this.configService.get("URL_PROFILE")
    return { role, id: _id, username, email, providers, avatar:`${url_profile}/${avatar}`,isCreatePassword };
  }

  async signup(signupDto: SignupDTO) {
    const { email, password, provider, username } = signupDto;

    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(email);

    if (existingUser) {
      // If user exists and tries to sign up with OAuth, check if provider exists
      if (provider !== ProviderEnum.CREDENTIALS) {
        if (existingUser.providers.includes(provider)) {
          throw new CustomException(
            "Account already exists with this provider",
            400,
          );
        }
        // Add new provider to existing user
        existingUser.providers.push(provider);
        await existingUser.save();
        // await this.usersService.update(existingUser._id.toString(), {
        //   providers: existingUser.providers,
        // });
        return existingUser;
      }
      throw new CustomException("Email already registered", 400);
    }

    // Handle new user registration
    let hashedPassword = null;
    let isCreatePassword = false;

    if (provider === ProviderEnum.CREDENTIALS) {
      // For credentials signup, hash password and prepare OTP
      hashedPassword = await bcrypt.hash(password, 10);
      isCreatePassword = true;
    }

    // Create new user
    const newUser = await this.usersService.create({
      username,
      email,
      providers: provider !== ProviderEnum.CREDENTIALS ? [ProviderEnum.DISCORD,ProviderEnum.GITHUB,ProviderEnum.GOOGLE] : [],
      isEmailVerified: provider !== ProviderEnum.CREDENTIALS, // OAuth users are considered verified
      role: RoleEnum.CLIENT,
      password: hashedPassword,
      isCreatePassword,
    });

    // Send OTP for email verification if credentials signup
    if (provider === ProviderEnum.CREDENTIALS) {
      await this.resendOtpCode(email);
    }
    return newUser;
  }
  async login(user: IUser) {
    console.log(user);
    const access_token = this.jwtService.sign(
      {
        id: user.id,
        role: user.role,
        username: user.username,
        email: user.email, 
      },
      {
        secret: this.configService.get<string>("JWT_ACCESS_TOKEN_SECRET"),

        expiresIn: this.configService.get<string>("JWT_ACCESS_TOKEN_EXPIRED"), // Cập nhật thời gian hết hạn theo yêu cầu
      },
    );

    const refresh_token = this.jwtService.sign(
      {
        id: user.id,
        role: user.role,
        uesrname: user.username,
        email: user.email,
      },
      {
        secret: this.configService.get<string>("JWT_REFRESH_TOKEN_SECRET"),

        expiresIn: this.configService.get<string>("JWT_REFRESH_TOKEN_EXPIRED"), // Cập nhật thời gian hết hạn theo yêu cầu
      },
    );
    await this.usersService.updateToken(refresh_token, user.id);
    return {
      user,
      refresh_token,
      access_token,
    };
  }
  async validateOtp(email: string, otpCode: string) {
    try {
      const user = await this.usersService.findByEmail(email);
      if (!user) {
        throw new CustomException("User not found", 404);
      }

      if (user.otpCode !== otpCode) {
        throw new CustomException("Invalid OTP code", 400);
      }

      if (new Date() > user.otpCodeExpired) {
        throw new CustomException("OTP code has expired", 400);
      }

      await this.usersService.updateUserVerification(user._id.toString());

      return { message: "Account verified successfully" };
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
        throw new CustomException("User not found", 404);
      }

      // Random OTP code (6 số)
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

      // Đặt thời gian hết hạn là 5 phút kể từ lúc gửi
      const otpCodeExpired = new Date();
      otpCodeExpired.setMinutes(otpCodeExpired.getMinutes() + 5);

      // Cập nhật user với mã OTP mới và thời gian hết hạn
      // await this.usersService.updateUserOtp(user._id, otpCode, otpCodeExpired);

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
        "Your OTP Code",
        "",
        emailContent,
      );

      return { message: "OTP code sent successfully" };
    } catch (error) {
      throw error;
    }
  }

  async addProvider(provider: string, email: string) {
    this.usersService.addProvider(provider, email)
  }
  async refreshToken(old_refreshToken: string) {
    try {

      // 1. Kiểm tra tính hợp lệ của refresh token cũ và xác minh thời gian hết hạn
      const payload: IUser = this.jwtService.verify(old_refreshToken, {
        secret: this.configService.get<string>("JWT_REFRESH_TOKEN_SECRET"),
      });
      if (!payload) {
        throw new UnauthorizedException("Invalid refresh token");
      }

      // 2. Kiểm tra xem refresh token có khớp với refresh token của người dùng trong cơ sở dữ liệu
      const currentRefreshToken = await this.usersService.findOne(payload.id).select("refreshToken");

      if (currentRefreshToken.refreshToken !== old_refreshToken) {
        throw new UnauthorizedException("Invalid refresh token");
      }

      // 3. Tạo refresh token mới
      const newRefreshToken = this.jwtService.sign(
        {
          id: payload.id,
          role: payload.role,
          username: payload.username,
          email: payload.email,
        },
        {
          secret: this.configService.get<string>("JWT_REFRESH_TOKEN_SECRET"),
          expiresIn: this.configService.get<string>("JWT_REFRESH_TOKEN_EXPIRED"), // Cập nhật thời gian hết hạn theo yêu cầu
        }
      );

      // 4. Cập nhật refresh token mới vào cơ sở dữ liệu
      await this.usersService.updateToken(newRefreshToken, payload.id);

      // 5. Tạo access token mới
      const newAccessToken = this.jwtService.sign(
        {
          id: payload.id,
          role: payload.role,
          username: payload.username,
          email: payload.email,
        },
        {
          secret: this.configService.get<string>("JWT_ACCESS_TOKEN_SECRET"),
          expiresIn: this.configService.get<string>("JWT_ACCESS_TOKEN_EXPIRED"), // Cập nhật thời gian hết hạn theo yêu cầu
        }
      );

      return {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
      };
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new ForbiddenException("Refresh token expired");
      }
      console.log(error)
      throw new CustomException("Could not refresh token", 400);
    }
  }

  async updateProfile(userId: string, updateData: UpdateProfileDto) {
    const oldUser = await this.usersService.findOne(userId);

    if (updateData.avatar !== null) {
      
      // Nếu user có ảnh cũ và có ảnh mới được upload
      if (oldUser.avatar && updateData.avatar) {
        try {
          // Xóa file ảnh cũ trong thư mục uploads (cùng cấp với src)
          const oldAvatarPath = join(process.cwd(), './apps/main/uploads', '/profile', oldUser.avatar);
          await unlink(oldAvatarPath);
        } catch (error) {
          console.log('Error deleting old avatar:', error);
        }
      }
    }

    const updatedUser = await this.usersService.update(userId, {...updateData});
    const url_profile= this.configService.get("URL_PROFILE")

    return {
      ...(updateData.avatar && { avatar: `${url_profile}/${updateData.avatar}` }),
      username: updatedUser.username
    };
    
  }
  async updatePassword(userId: string, updateDto: UpdatePasswordDto) {
    const user = await this.usersService.findOne(userId);
    
    if (!user) {
      throw new BadRequestException("User not found.");
    }

    if (user.isCreatePassword) {
   
      const isOldPasswordValid = await compare(updateDto.oldPassword, user.password);

      if (!isOldPasswordValid) {
        throw new BadRequestException("Old password is incorrect.");
      }
    }

    // Hash mật khẩu mới và cập nhật
    const newHashedPassword = await bcrypt.hash(updateDto.newPassword, 10);
    const i=await this.usersService.update(userId, {password:  newHashedPassword, isCreatePassword:true});
    return { message: "Password updated successfully." };
  }
  async forgotPassword(email: string) {
    try {
      // Check if the user exists
      const user = await this.usersService.findByEmail(email);
      if (!user) {
        throw new CustomException("User not found", 404);
      }
  
      // Generate a password reset token
      const resetToken = this.jwtService.sign(
        { id: user._id },
        {
          secret: this.configService.get<string>("JWT_RESET_PASSWORD_SECRET"),
          expiresIn: "15m", // Token expires in 15 minutes
        }
      );
  
      // Save the reset token in the database
      await this.usersService.update(user._id.toString(), {resetPasswordToken:resetToken});
  
      // Generate password reset URL
      const resetUrl = `${this.configService.get<string>("FRONTEND_URL")}/auth/reset-password?token=${resetToken}`;
  
      // Email content
      const emailContent = `
        <div>
          <h1>Reset Your Password</h1>
          <p>Click the link below to reset your password:</p>
          <a href="${resetUrl}">Reset Password</a>
          <p>This link will expire in 15 minutes.</p>
        </div>
      `;
  
      // Send reset email
      await this.emailService.sendMail(email, "Password Reset Request", "", emailContent);
  
      return { message: "Password reset link sent to your email" };
    } catch (error) {
      throw error;
    }
  }
  async resetPassword( reset: ResetPassworDto){
    const payload = this.jwtService.verify(reset.token, {
      secret: this.configService.get<string>("JWT_RESET_PASSWORD_SECRET"),
    });
    const user = await this.usersService.findOne(payload.id)
    const newHashedPassword = await bcrypt.hash(reset.newPassword, 10);
    await this.usersService.update(user.id, {password:  newHashedPassword, isCreatePassword:true});
    return 

  }
}

import {
  BadRequestException,
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
@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UserService,
    private readonly emailService: EmailService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}
  async validate(
    emailValidate: string,
    password: string,
    provider: ProviderEnum,
  ): Promise<any> {
    const user = await this.usersService.findByEmail(emailValidate);

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
    const { role, _id, username, email } = user.toObject();
    return { role, _id, username, email };
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
      providers: provider !== ProviderEnum.CREDENTIALS ? [provider] : [],
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
    const access_token = this.jwtService.sign(
      {
        id: user.id,
        role: user.role,
        uesrname: user.username,
        email: user.email,
      },
      {
        secret: this.configService.get<string>("JWT_ACCESS_TOKEN_SECRET"),

        expiresIn: "6000s",
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

        expiresIn: "36000s",
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
}

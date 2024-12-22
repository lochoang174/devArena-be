import { IsEmail, IsString, IsNotEmpty, Matches, IsEnum } from 'class-validator';
import { ProviderEnum } from '../../user/schema/user.schema';

export class SignupDTO {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/,
    {
      message: 'Password must be at least 6 characters long and contain at least one uppercase letter, one lowercase letter, and one number',
    }
  )
  password: string;

  @IsEnum(ProviderEnum)
  @IsNotEmpty()
  provider: ProviderEnum;
}
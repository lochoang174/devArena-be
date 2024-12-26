import { IsEmail, IsEnum, IsNotEmpty } from "class-validator";
import { ProviderEnum } from "../../schemas/user.schema";

export class ProviderDTO {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsEnum(ProviderEnum)
  @IsNotEmpty()
  providerName: ProviderEnum;
}

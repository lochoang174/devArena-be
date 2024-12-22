import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Schema as MongooseSchema } from 'mongoose';

// Define the enums
export enum ProviderEnum {
  GITHUB = 'github',
  GOOGLE = 'google',
  DISCORD = 'discord',
  CREDENTIALS='credentials'
}

export enum RoleEnum {
  ADMIN = 'admin',
  CLIENT = 'client',
}

export type UserDocument = User & Document;

@Schema({
  timestamps: true, // Adds createdAt and updatedAt fields
})
export class User {
  @Prop({ required: true })
  username: string;


  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: false })
  password: string;

  @Prop({ default: false })
  isEmailVerified: boolean;

  @Prop({ type: String, enum: RoleEnum, default: RoleEnum.CLIENT })
  role: RoleEnum;

  @Prop({ required: false })
  isCreatePassword: boolean;

  @Prop()
  avatar?: string;

 

  @Prop()
  refreshToken?: string;

  @Prop({
    type: [String],
    enum: ProviderEnum,
    default: [],
  })
  providers: ProviderEnum[];

  @Prop({ required: false })
  otpCode?:string;
  @Prop({ required: false })
  otpCodeExpired?:Date
}

export const UserSchema = SchemaFactory.createForClass(User);



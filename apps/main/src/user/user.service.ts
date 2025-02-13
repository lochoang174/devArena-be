import { forwardRef, Injectable } from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { ProviderEnum, User, UserDocument } from "../schemas/user.schema";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import * as bcryptjs from "bcryptjs";
import { CustomException } from "@app/common";
import { UpdateProfileDto } from "../auth/dto/updateProfile";

@Injectable()
export class UserService {
  constructor(@InjectModel("User") private userModel: Model<User>) {}
  async onModuleInit() {
    const user = await this.userModel.findOne({ email: "admin@gmail.com" });
    if (!user) {
      const hashedPassword = await bcryptjs.hash("123456", 10);
      const newUser = new this.userModel({
        email: "admin@gmail.com",
        password: hashedPassword,
        role: "admin",
        username: "admin",
        isCreatePassword: true,
        isEmailVerified: true,
      });
      await newUser.save();
    }
  }
  async create(createUserDto: User) {
    try {
      console.log(createUserDto);
      const user = new this.userModel(createUserDto);
      const savedUser = await user.save();

      // Chuyển đổi document thành object và loại bỏ password
      const userObject = savedUser.toObject();
      delete userObject.password;

      return userObject;
    } catch (error) {
      if (error.code === 11000) {
        throw new Error("User with this email already exists");
      }
      throw new Error("Error creating user: " + error.message);
    }
  }
  async findByEmail(email: string): Promise<User> {
    const user = this.userModel.findOne({ email });
    return user;
  }
  findAll() {
    return `This action returns all user`;
  }

  findOne(id: string) {
    const user = this.userModel.findById(id);
    return user;
  }

  async update(id: string, updateUser: any) {
    const user = await this.userModel
      .findByIdAndUpdate(
        id,
        { $set: updateUser },
        { new: true, runValidators: true },
      )
      .lean();

    if (!user) {
      return null;
    }

    console.log(user);
    return user;
  }

  async verifyUser(userId: string) {
    try {
      const user = await this.userModel
        .findByIdAndUpdate(
          { _id: userId },
          { isEmailVerified: true },
          { new: true }, // Return the modified document rather than the original
        )
        .exec();

      if (!user) {
        throw new Error("User not found");
      }

      return user;
    } catch (error) {
      throw error;
    }
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
  async updateUserOtp(userId: string, otpCode: string, otpCodeExpired: Date) {
    return await this.userModel.findByIdAndUpdate(
      userId,
      { otpCode, otpCodeExpired },
      { new: true },
    );
  }
  async updateUserVerification(userId: string) {
    return await this.userModel.findByIdAndUpdate(
      userId,
      {
        isEmailVerified: true,
        otpCode: null,
        otpCodeExpired: null,
      },
      { new: true },
    );
  }
  updateToken = async (refresh_token: string, id: string) => {
    return await this.userModel.updateOne(
      { _id: id },
      { refreshToken: refresh_token },
    );
  };
  async addProvider(provider: string, email: string) {
    const user = await this.userModel.findOne({ email }).exec();
    if (!user) {
      throw new CustomException("Email has not been registried", 403);
    }
    const checkExist = await user.providers.includes(provider as ProviderEnum);
    if (checkExist) {
      throw new CustomException("Provider exist", 400);
    } else {
      user.providers.push(provider as ProviderEnum);
      user.save();
    }
  }
}

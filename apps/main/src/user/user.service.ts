import { forwardRef, Injectable } from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { User } from "../schemas/user.schema";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

@Injectable()
export class UserService {
  constructor(@InjectModel("User") private userModel: Model<User>) {}
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
  async findByEmail(email: string) {
    const user = this.userModel.findOne({ email });
    return user;
  }
  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: string) {
    const user = this.userModel.findByIdAndUpdate();
    return `This action updates a #${id} user`;
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
}

import { Injectable } from "@nestjs/common";
import { CreateCourseStatusDto } from "./dto/create-course-status.dto";
import { UpdateCourseStatusDto } from "./dto/update-course-status.dto";
import { COURSE_STATUS_MODEL } from "../schemas/mongoose.model";
import { Model } from "mongoose";
import { CourseStatusDocument } from "../schemas/courseStatus.schema";
import { InjectModel } from "@nestjs/mongoose";
import { CourseService } from "../course/course.service";
import { UserService } from "../user/user.service";
import { ExerciseStatusService } from "../exercise-status/exercise-status.service";

@Injectable()
export class CourseStatusService {
  constructor(
    @InjectModel("CourseStatus")
    private courseStatusModel: Model<CourseStatusDocument>,
    private readonly courseService: CourseService,
    private readonly userService: UserService,
    private readonly exerciseStatusService: ExerciseStatusService,
  ) {}

  async checkAndCreateCourseStatus(userId: string, courseId: string) {
    try {
      // Kiểm tra xem courseStatus đã tồn tại chưa
      const existingStatus = await this.courseStatusModel.findOne({
        userId,
        courseId,
      });

      if (existingStatus) {
        return existingStatus;
      }



      // Tạo mới courseStatus
      const newCourseStatus = new this.courseStatusModel({
        userId,
        courseId,
        progress: 0,
        status: "in-progress",
        enrolledAt: new Date(),
        completedAt: null,
      });
      this.exerciseStatusService.initExerciseStatus(userId, courseId);
      return await newCourseStatus.save();
    } catch (error) {
      throw new Error(`Failed to check/create course status: ${error.message}`);
    }
  }

  async getUserCourseStatuses(userId: string) {
    try {
      const courseStatuses = await this.courseStatusModel
        .find({ userId })
        .populate("courseId") // Nếu bạn muốn lấy thêm thông tin của course
        .exec();

      return courseStatuses;
    } catch (error) {
      throw new Error(`Failed to get user course statuses: ${error.message}`);
    }
  }

 
}

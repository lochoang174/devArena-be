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
import { ExerciseService } from "../exercise/exercise.service";

@Injectable()
export class CourseStatusService {
  constructor(
    @InjectModel("CourseStatus")
    private courseStatusModel: Model<CourseStatusDocument>,

    // private readonly exerciseService: ExerciseService,
  ) { }

  // async checkAndCreateCourseStatus(userId: string, courseId: string) {
  //   try {
  //     // Kiểm tra xem courseStatus đã tồn tại chưa
  //     const existingStatus = await this.courseStatusModel.findOne({
  //       userId,
  //       courseId,
  //     });

  //     if (existingStatus) {
  //       return existingStatus;
  //     }

  //     // Lấy danh sách exercises của course
  //     const exercises = await this.exerciseService.findAllByCourseId(courseId);

  //     // Tạo mảng exercise statuses
  //     const exerciseStatuses = exercises.map((exercise) => ({
  //       exerciseId: exercise._id,
  //       progress: 0,
  //     }));

  //     // Tạo mới courseStatus với mảng exercise statuses
  //     const newCourseStatus = new this.courseStatusModel({
  //       userId,
  //       courseId,
  //       progress: 0,
  //       status: "in-progress",
  //       enrolledAt: new Date(),
  //       completedAt: null,
  //       exerciseStatuses,
  //     });

  //     return await newCourseStatus.save();
  //   } catch (error) {
  //     throw new Error(`Failed to check/create course status: ${error.message}`);
  //   }
  // }

  async getUserCourseStatuses(userId: string) {
    try {
      const courseStatuses = await this.courseStatusModel
        .find({ userId }, {
          exerciseStatuses: 0, userId: 0, completedAt: 0

        })
        .exec();

      return courseStatuses;
    } catch (error) {
      throw new Error(`Failed to get user course statuses: ${error.message}`);
    }
  }
  async getCourseStatusById(courseStatusId: string) {
    return await this.courseStatusModel
      .findById(courseStatusId)
      .populate({
        path: "exerciseStatuses.exerciseId",
        model: "ExerciseModel",
      })
      .populate("courseId") // Added courseId population

      .exec();
  }
}

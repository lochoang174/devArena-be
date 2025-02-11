import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
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

  async create(createCourseStatusDto: CreateCourseStatusDto): Promise<CourseStatusDocument> {
    try {
      const newCourseStatus = {
        ...createCourseStatusDto,
        status: "in-progress",
      }
      return this.courseStatusModel.create(newCourseStatus);
    } catch (err) {
      throw new HttpException(
        { success: false, message: 'Failed to create course status', },
        HttpStatus.CONFLICT,
      );
    }
  }

  async checkExist(userId: string, courseId: string) {
    return this.courseStatusModel.findOne({
      userId
      , courseId
    }).exec();
  }


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

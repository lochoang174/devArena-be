import { HttpStatus, HttpException, Injectable } from "@nestjs/common";
import { CreateExerciseStatusDto } from "./dto/create-exercise-status.dto";
import { UpdateExerciseStatusDto } from "./dto/update-exercise-status.dto";
import { ExerciseStatusDocument } from "../schemas/exerciseStatus.schema";
import { Model, Types } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { ExerciseService } from "../exercise/exercise.service";
import { stat } from "fs";
import { Test } from "@nestjs/testing";
import { TestCase } from "@app/common";

@Injectable()
export class ExerciseStatusService {
  constructor(
    @InjectModel("ExerciseStatus")
    private exerciseStatusModel: Model<ExerciseStatusDocument>,
    private readonly exerciseService: ExerciseService,
  ) { }
  async create(createExerciseStatusDto: CreateExerciseStatusDto): Promise<ExerciseStatusDocument> {
    try {
      const newExerciseStatus = {
        ...createExerciseStatusDto,
        status: "in-progress",
      }
      return this.exerciseStatusModel.create(newExerciseStatus);
    } catch (err) {
      throw new HttpException(
        { success: false, message: 'Failed to create exercise status', },
        HttpStatus.CONFLICT,
      );
    }

  }


  //check exist exercise status
  async checkExist(userId: string, exerciseId: string) {
    return this.exerciseStatusModel.findOne({
      userId
      , exerciseId
    }).exec();
  }

  async update(userId: string, exerciseId: string) {
    //only update status
    return this.exerciseStatusModel.findOneAndUpdate({ userId, exerciseId }, { status: "completed" }).exec();
  }

  async findOneByUSerAndExercise(userId: string, exerciseId: string) {
    return this.exerciseStatusModel.findOne({ userId, exerciseId }).exec();
  }


  async initExerciseStatus(createExerciseStatusDto: CreateExerciseStatusDto) {
    // const exercises = await this.exerciseService.findAllByCourseId(courseId);

    // const exerciseStatuses = exercises.map((exercise) => ({
    //   exerciseId: exercise._id,
    //   userId,
    //   status: "in-progress",
    //   submission: [],
    // }));

    // return await this.exerciseStatusModel.insertMany(exerciseStatuses);
  }

  async findAllByUserAndCourse(userId: string, courseId: string) {
    const exercises = await this.exerciseService.findAllByCourseId(courseId);
    const exerciseIds = exercises.map((exercise) => exercise._id);

    return await this.exerciseStatusModel
      .find({ userId, exerciseId: { $in: exerciseIds } })
      .select("_id exerciseId status")
      .exec();
  }

  async updateStatusAndSubmission(
    userId: string,
    exerciseId: string,
    exerciseStatus: "in-progress" | "completed",
    code: string,
    submissionStatus: "accepted" | "wrong answer" | "compile error",
    errorCode?: string,
    result?: string,
    totalRuntime?: number,
    compareTime?: number,
    testcase?: {
      output: string;
      outputExpected: any;
      input: [any];
      hidden: boolean;
    },
  ) {
    const exerciseObjectId = new Types.ObjectId(exerciseId);

    // Tìm tài liệu
    let exercise = await this.exerciseStatusModel.findOne({
      userId,
      exerciseId: exerciseObjectId,
    });

    // Nếu không tồn tại, tạo mới
    if (!exercise) {
      exercise = await this.exerciseStatusModel.create({
        userId,
        exerciseId: exerciseObjectId,
        status: exerciseStatus,
        submission: [], // Khởi tạo mảng submission
      });
    } else {
      if (exerciseStatus === "completed")
        exercise.status = exerciseStatus;
    }

    if (submissionStatus === "accepted") {
      exercise.submission.push({
        code,
        isPublic: false,
        result,
        status: submissionStatus,
        totalTime: totalRuntime,
        compareTime,
      });
    } else if (submissionStatus === "wrong answer") {
      exercise.submission.push({
        code,
        isPublic: false,
        result,
        status: submissionStatus,
        totalTime: totalRuntime,
        testcase,
      });
    }
    else {
      exercise.submission.push({
        code,
        isPublic: false,
        errorCode,
        status: submissionStatus,
      });
    }

    // Lưu tài liệu sau khi thay đổi
    await exercise.save();
  }
  async getSubmissions(userId: string, exerciseId: string) {
    const exerciseStatus = await this.exerciseStatusModel.findOne({
      userId,
      exerciseId
    }).select({
      "submission.status": 1,
      "submission.result": 1,
      "submission.totalTime": 1,
      "submission.createdAt": 1,
      "submission._id": 1,
      status: 1, // Top-level field
      result: 1, // Top-level field
      totalTime: 1, // Top-level field
      createdAt: 1, // Top-level field
      _id: 1
    })
      .exec();
    return exerciseStatus
  }

  async getOneSubmission(userId: string, exerciseId: string, submissionId: string) {
    const exerciseStatus = await this.exerciseStatusModel.findOne({
      userId,
      exerciseId,
    }).select("submission")

    const submission = exerciseStatus.submission.find(submission => submission._id.toString() === submissionId)


    return submission
  }

  async compareRuntime(exerciseId: string, time: number): Promise<number> {
    // Bước 1: Tìm tất cả các exerciseStatus có status là 'completed'
    const exerciseStatuses = await this.exerciseStatusModel
      .find({ exerciseId: new Types.ObjectId(exerciseId), status: "completed" })
      .populate('submission') // Đảm bảo chúng ta có thể truy cập các submission
      .exec();

    console.log("exerciseStatuses", exerciseStatuses)

    // Bước 2: Lọc các submission có status là 'accepted'
    const allPerfectSubmissions = exerciseStatuses
      .flatMap(status => status.submission) // Lấy tất cả submission từ tất cả exerciseStatus
      .filter(submission => submission.status === "accepted"); // Lọc ra các submission có status là 'accepted'

    console.log("allPerfectSubmissions", allPerfectSubmissions)

    if (allPerfectSubmissions.length === 0) {
      return 0;
    }

    // Bước 3: Tính tỷ lệ người có runtime nhanh hơn so với thời gian của người dùng truyền vào
    const fasterCount = allPerfectSubmissions.filter(submission => submission.totalTime < time).length;

    // Bước 4: Tính tổng số submission có score = 100
    const totalCount = allPerfectSubmissions.length;

    // Tính tỷ lệ: (tổng số người có runtime nhanh hơn / tổng số người) * 100
    const percentage = ((fasterCount / totalCount) * 100);
    return percentage

  }


}

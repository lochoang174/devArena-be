import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Study, StudyDocument } from "../schemas/study.schema";
import { Model, Types } from "mongoose";
import { CreateStudyDto } from "./dto/createStudy.dto";
import { Course, CourseDocument } from "../schemas/course.schema";
import { ExerciseStatusService } from "../exercise-status/exercise-status.service";
import { ExerciseService } from "../exercise/exercise.service";
import { Exercise } from "../schemas/exercise.schema";

@Injectable()
export class StudyService {
  constructor(
    @InjectModel(Study.name) private studyModel: Model<StudyDocument>,
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    private readonly exerciseStatusService: ExerciseStatusService,
  ) { }
  async create(createStudyDto: CreateStudyDto): Promise<Study> {
    const study = new this.studyModel({ _id: new Types.ObjectId(), ...createStudyDto });
    return study.save();
  }
  async findSolutionCode(exerciseId: string) {
    const id = new Types.ObjectId(exerciseId); // Convert exerciseId to ObjectId if it's a string
    const select = await this.studyModel.findOne({ _id: id }).lean();
    return select.solution
  }
  async update(
    id: string,
    updateStudyDto: Partial<CreateStudyDto>,
  ): Promise<Study> {

    return this.studyModel
      .findByIdAndUpdate(new Types.ObjectId(id), updateStudyDto, { new: true })
      .exec();
  }

  async delete(id: string): Promise<Study> {
    const study = await this.studyModel.findOneAndDelete({ _id: new Types.ObjectId(id) }).exec();

    // Manually handle course update as needed
    if (study) {
      const CourseModel = this.courseModel;
      const totalExercises = await this.studyModel.countDocuments({ courseId: study.courseId });
      await CourseModel.findByIdAndUpdate(study.courseId, { totalExercises });
    }

    return study;
  }



  async findAll(): Promise<Study[]> {
    return this.studyModel.find().exec();
  }

  async findById(id: string): Promise<Study> {
    return this.studyModel.findById(new Types.ObjectId(id)).exec();
  }

  async findByCondition(condition: any): Promise<Study[]> {
    return this.studyModel.find(condition).exec();
  }
  async findExercisesByCourse(courseId: string): Promise<Study[]> {
    return this.studyModel.find({ courseId }).select('_id title difficulty tags score type').exec();
  }


  async findAllByUserAndCourse(userId: string, courseId: string): Promise<{
    exercisesStatus: any[];
    exercisesByCourse: Study[];
    courseTitle: string;
  }> {
    const exercisesStatus = await this.exerciseStatusService.findAllByUserAndCourse(userId, courseId);
    const exercisesByCourse = await this.findExercisesByCourse(courseId);
    const courseTitle = await this.courseModel.findById(courseId).select("title").lean();
    return { exercisesStatus, exercisesByCourse, courseTitle: courseTitle.title };
  }
}

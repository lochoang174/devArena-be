import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Study, StudyDocument } from "../schemas/study.schema";
import { Model, Types } from "mongoose";
import { CreateStudyDto } from "./dto/createStudy.dto";

@Injectable()
export class StudyService {
  constructor(
    @InjectModel(Study.name) private studyModel: Model<StudyDocument>,
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
    return this.studyModel.findByIdAndDelete(new Types.ObjectId(id)).exec();
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
    return this.studyModel.find({ courseId }).exec();
  }
}

import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Study, StudyDocument } from "../schemas/study.schema";
import { Model } from "mongoose";
import { CreateStudyDto } from "./dto/createStudy.dto";

@Injectable()
export class StudyService {
  constructor(@InjectModel(Study.name) private studyModel: Model<StudyDocument>) {}
  async create(createStudyDto: CreateStudyDto): Promise<Study> {
    const study = new this.studyModel({});
    return study.save();
  }

  //   async findAll(): Promise<Study[]> {
  //     return this.studyModel.find().exec();
  //   }
}

import { Injectable } from "@nestjs/common";
import { CreateCourseDto } from "./dto/create-course.dto";
import { UpdateCourseDto } from "./dto/update-course.dto";
import { CourseDocument } from "../schemas/course.schema";
import { Course } from "../schemas/course.schema";
import { COURSE_MODEL } from "../schemas/mongoose.model";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

@Injectable()
export class CourseService {
  constructor(
    @InjectModel("Course") private courseModel: Model<CourseDocument>,
  ) {}
  create(createCourseDto: CreateCourseDto) {
    const createdCourse = new this.courseModel(createCourseDto);
    return createdCourse.save();
  }
  findAll() {
    return `This action returns all course`;
  }

  findOne(id: number) {
    return `This action returns a #${id} course`;
  }

  update(id: number, updateCourseDto: UpdateCourseDto) {
    return `This action updates a #${id} course`;
  }

  remove(id: number) {
    return `This action removes a #${id} course`;
  }

  async onModuleInit() {
    // Kiểm tra số lượng khóa học hiện có
    const courseCount = await this.courseModel.countDocuments();

    // Chỉ thêm các khóa học mặc định nếu chưa có khóa học nào
    if (courseCount === 0) {
      const defaultCourses = [
        {
          language: "Java",
          title: "Learn Java programming language",
        },
        {
          language: "C++",
          title: "Learn C++ programming language",
        },
        {
          language: "C",
          title: "Learn C programming language",
        },
      ];

      for (const course of defaultCourses) {
        await this.courseModel.create(course);
      }
      return "Initialized default courses: Java, C++, C";
    }

    return "Courses already exist, skipping initialization";
  }
}

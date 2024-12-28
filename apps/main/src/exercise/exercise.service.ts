import { Injectable, NotFoundException, UseGuards } from "@nestjs/common";
import { CreateExerciseDto } from "./dto/create-exercise.dto";
import { UpdateExerciseDto } from "./dto/update-exercise.dto";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { StudyDocument } from "../schemas/study.schema";
import { Exercise } from "../schemas/exercise.schema";
import { RolesGuard } from "../auth/guards/role.guard";
import { Roles } from "@app/common";
import { CourseService } from "../course/course.service";

@Injectable()
export class ExerciseService {
  constructor(
    @InjectModel("Study") private exerciseModel: Model<StudyDocument>,
    private readonly courseService: CourseService,
    
  ) {}

  async findAllByCourseId(courseId: string) {
    return this.exerciseModel.find({ courseId });
  }

  async create(createExerciseDto: CreateExerciseDto): Promise<Exercise> {
    const newExercise = new this.exerciseModel({});
    return newExercise.save();
  }

  // /**
  //  * Find all exercises
  //  */
 
  async findAll() {
    return "Success";
  }

  // /**
  //  * Find an exercise by ID
  //  */
  // async findOne(id: string): Promise<Exercise> {
  //   const exercise = await this.exerciseModel.findById(id).exec();
  //   if (!exercise) {
  //     throw new NotFoundException(`Exercise with ID ${id} not found`);
  //   }
  //   return exercise;
  // }

  // /**
  //  * Update an exercise by ID
  //  */
  // async update(
  //   id: string,
  //   updateExerciseDto: UpdateExerciseDto,
  // ): Promise<Exercise> {
  //   const updatedExercise = await this.exerciseModel
  //     .findByIdAndUpdate(id, updateExerciseDto, { new: true, runValidators: true })
  //     .exec();
  //   if (!updatedExercise) {
  //     throw new NotFoundException(`Exercise with ID ${id} not found`);
  //   }
  //   return updatedExercise;
  // }

  // /**
  //  * Remove an exercise by ID
  //  */
  // async remove(id: string): Promise<{ message: string }> {
  //   const deletedExercise = await this.exerciseModel.findByIdAndDelete(id).exec();
  //   if (!deletedExercise) {
  //     throw new NotFoundException(`Exercise with ID ${id} not found`);
  //   }
  //   return { message: `Exercise with ID ${id} successfully deleted` };
  // }
  // async findByLanguage(language: string): Promise<Exercise[]> {
  //   const exercises = await this.exerciseModel.find({ language }).exec();
  //   if (!exercises.length) {
  //     throw new NotFoundException(`No exercises found for language: ${language}`);
  //   }
  //   return exercises;
  // }
}

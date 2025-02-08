import { Injectable, NotFoundException, UseGuards } from "@nestjs/common";
import { CreateExerciseDto } from "./dto/create-exercise.dto";
import { UpdateExerciseDto } from "./dto/update-exercise.dto";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { StudyDocument } from "../schemas/study.schema";
import { Exercise, ExerciseDocument } from "../schemas/exercise.schema";
import { RolesGuard } from "../auth/guards/role.guard";
import { Roles } from "@app/common";
import { CourseService } from "../course/course.service";
import { Testcase } from "../schemas/testcase.schema";

@Injectable()
export class ExerciseService {

  constructor(
    @InjectModel("Exercise") private exerciseModel: Model<ExerciseDocument>,
    private readonly courseService: CourseService,

  ) { }

  async findAllByCourseId(courseId: string) {
    return this.exerciseModel.find({ courseId });
  }

  async findAllByType(type: string) {
    return this.exerciseModel.find({ type });
  }

  async create(createExerciseDto: CreateExerciseDto): Promise<Exercise> {
    const newExercise = new this.exerciseModel({});

    return newExercise.save();
  }
  async findTestcaseById(exerciseId: string): Promise<Testcase[]> {
    // Tìm tài liệu theo exerciseId
    const objectId = new Types.ObjectId(exerciseId);

    const exercise = await this.exerciseModel.findById(objectId).select("testcases").lean();
    if (!exercise || !exercise.testcases) {
      // Trả về mảng rỗng nếu không tìm thấy hoặc không có testcases
      return [];
    }


    return exercise.testcases;
  }

  async countEachDifficulty(exerciseIds: Exercise[]): Promise<{ easy: number, medium: number, hard: number }> {
    // Fetch exercises by their IDs
    const exercises = await this.exerciseModel.find({ _id: { $in: exerciseIds } }).exec();

    // Initialize counters for each difficulty
    const difficultyCounts = {
      easy: 0,
      medium: 0,
      hard: 0,
    };

    // Iterate through each exercise and increment the corresponding difficulty count
    exercises.forEach(exercise => {
      switch (exercise.difficulty) {
        case 'easy':
          difficultyCounts.easy++;
          break;
        case 'medium':
          difficultyCounts.medium++;
          break;
        case 'hard':
          difficultyCounts.hard++;
          break;
      }
    });

    return difficultyCounts;
  }

  // count each tag
  async countEachTag(exerciseIds: Exercise[]): Promise<{ [key: string]: number }> {
    // Fetch exercises by their IDs
    const exercises = await this.exerciseModel.find({ _id: { $in: exerciseIds } }).exec();

    // Initialize a tag counter object
    const tagCounts = {};

    // Iterate through each exercise and increment the corresponding tag count
    exercises.forEach(exercise => {
      exercise.tags.forEach(tag => {
        tagCounts[tag] = tagCounts[tag] ? tagCounts[tag] + 1 : 1;
      });
    });

    return tagCounts;
  }


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

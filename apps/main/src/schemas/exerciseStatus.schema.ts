import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Document, Model, Types } from "mongoose";
import { Submission, SubmissionSchema } from "./submission.schema";
import { User } from "./user.schema";
import { Exercise, ExerciseDocument } from "./exercise.schema";
import { CourseStatusDocument } from "./courseStatus.schema";
import { StudyDocument } from "./study.schema";
import { CourseDocument } from "./course.schema";

export type ExerciseStatusDocument = ExerciseStatus & Document;

@Schema({ timestamps: true })
export class ExerciseStatus {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "UserModel", required: true })
  userId: User;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "ExerciseModel", required: true })
  exerciseId: Exercise;

  @Prop({
    type: String,
    enum: ["in-progress", "completed"],
    default: "in-progress"
  })
  status: string;

  @Prop({ type: [SubmissionSchema], default: [] })
  submission: Submission[];

}

export const ExerciseStatusSchema =
  SchemaFactory.createForClass(ExerciseStatus);


ExerciseStatusSchema.index({ userId: 1, exerciseId: 1 }, { unique: true });


ExerciseStatusSchema.post("save", async function (doc: ExerciseStatusDocument,next) {
  if (doc.status === "completed") {
    // Import the models dynamically to avoid circular dependency
    const CourseStatusModel = this.model('CourseStatusModel') as Model<CourseStatusDocument>;
    const StudyModel = this.model('StudyModel') as Model<StudyDocument>;

    const ExerciseStatusModel = this.model('ExerciseStatusModel') as Model<ExerciseStatusDocument>;

    const exercise = await StudyModel.findOne({_id:doc.exerciseId._id}).populate("courseId");
    if (!exercise) {
      console.error("Unable to find exercise or associated course.");
      return;
    }
    //@ts-ignore
    const courseId = exercise.courseId._id;

    // // Retrieve all exercises in the same course
    const exercisesInCourse = await StudyModel.find({ courseId:courseId.toString() }).exec()
    console.log(courseId)
    // Retrieve statuses for the user's exercises in the course
    const exerciseStatuses = await ExerciseStatusModel.find({
      userId: doc.userId,
      exerciseId: { $in: exercisesInCourse.map((e) => e._id) },
    });
    // Count completed and total exercises
    const totalExercises = exercisesInCourse.length;
    const completedExercises = exerciseStatuses.filter((status) => status.status === "completed").length;

    // Calculate progress as a percentage
    const progress = (completedExercises / totalExercises) * 100;

    // Update the progress in the related CourseStatus
    await CourseStatusModel.findOneAndUpdate(
      { userId: doc.userId, courseId },
      { progress },
      { new: true, upsert: true }
    );
    next();
  }
});

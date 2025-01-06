import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Document, Types } from "mongoose";
import { Submission, SubmissionSchema } from "./submission.schema";
import { User } from "./user.schema";
import { Exercise } from "./exercise.schema";

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

import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { Submission, SubmissionSchema } from "./submission.schema";

export type ExerciseStatusDocument = ExerciseStatus & Document;




@Schema({ timestamps: true })
export class ExerciseStatus {
  @Prop({ type: Types.ObjectId, ref: "Exercise", required: true })
  exerciseId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  userId: Types.ObjectId;

  @Prop({
    type: String,
    enum: ["NOT_STARTED", "IN_PROGRESS", "COMPLETED"],
    default: "NOT_STARTED",
  })
  status: string;

  @Prop({ type: Number, min: 0, max: 100 })
  score?: number;

  @Prop({ type: [SubmissionSchema], default: [] })
  submission: Submission[]; // Array of submissions
}

export const ExerciseStatusSchema =
  SchemaFactory.createForClass(ExerciseStatus);

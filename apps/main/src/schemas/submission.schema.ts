import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type SubmissionDocument = Submission & Document;

@Schema({ timestamps: true })
export class Submission {
  @Prop({ required: true })
  code: string;

  @Prop({
    required: true,
    enum: ["pending", "processing", "accepted", "wrong answer", "compile error"],
    default: "pending",
  })
  status: string;

  @Prop({
    required: false,
    type: Number,
  })
  score?: number;


  @Prop()
  result?: string;

  @Prop({
    type: Boolean,
    default: false,
  })
  isPublic: boolean;

  @Prop({
    default: false,

  })
  totalTime?: number
}

export const SubmissionSchema = SchemaFactory.createForClass(Submission);

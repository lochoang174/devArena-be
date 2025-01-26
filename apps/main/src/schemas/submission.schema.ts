import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { TestCase } from "@app/common";
import { TestcaseSchema } from "./testcase.schema";
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
    default: 0,

  })
  totalTime?: number

  @Prop()
  compareTime?: number

  @Prop({
    type: TestcaseSchema,
    required: false,
  })
  testcase?: {
    output: string;
    outputExpected: any;
    input: [any];
    hidden: boolean;
  }

  @Prop()
  errorCode?: string;

  _id?: Types.ObjectId;
}

export const SubmissionSchema = SchemaFactory.createForClass(Submission);

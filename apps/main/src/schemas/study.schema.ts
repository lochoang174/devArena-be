import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Exercise } from "./exercise.schema";
import { Types } from "mongoose";

@Schema()
export class Study extends Exercise {


  @Prop()
  defaultCode: string;

  @Prop()
  solution: string;
  
  @Prop({ type: Types.ObjectId, ref: "Course", required: true })
  courseId: Types.ObjectId;
}
export type StudyDocument = Study & Document;

export const StudySchema = SchemaFactory.createForClass(Study);

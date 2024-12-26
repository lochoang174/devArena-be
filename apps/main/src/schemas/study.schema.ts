import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Exercise } from "./exercise.schema";

@Schema()
export class Study extends Exercise {
  @Prop({ required: true })
  language: string;

  @Prop()
  sampleCode: string;

  @Prop()
  solution: string;
}
export type StudyDocument = Study & Document;

export const StudySchema = SchemaFactory.createForClass(Study);

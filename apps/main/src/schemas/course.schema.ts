import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { User } from "./user.schema";

export type CourseDocument = Course & Document;

@Schema({
  timestamps: true, // Adds createdAt and updatedAt fields
})
export class Course {
  @Prop({ required: true })
  title: string; // Course title

  @Prop({ required: true })
  language: string; // Programming language of the course (e.g., C, Java)

  @Prop({ required: true, default: 0 })
  totalExercises: number; // Total number of exercises in the course

  @Prop()
  description?: string; // Optional course description
}

export const CourseSchema = SchemaFactory.createForClass(Course);

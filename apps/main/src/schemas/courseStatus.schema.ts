import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import { Course } from "./course.schema";
import { User } from "./user.schema";

export type CourseStatusDocument = HydratedDocument<CourseStatus>;

@Schema({
  timestamps: true,
})
export class CourseStatus {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true })
  userId: User;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true })
  courseId: Course;

  @Prop({
    type: String,
    enum: ["completed", "in-progress"],
  })
  status: string;

  @Prop({ type: Number, default: 0 })
  progress: number;

  @Prop({ type: Date })
  enrolledAt: Date;

  @Prop({ type: Date })
  completedAt: Date;
}

export const CourseStatusSchema = SchemaFactory.createForClass(CourseStatus);

// Tạo compound index để đảm bảo một user chỉ có một status cho mỗi course
CourseStatusSchema.index({ userId: 1, courseId: 1 }, { unique: true });

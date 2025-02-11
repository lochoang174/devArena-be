import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import { Course } from "./course.schema";
import { User } from "./user.schema";

export type CourseStatusDocument = CourseStatus & Document;

@Schema({
  timestamps: true,
})
export class CourseStatus {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "UserModel", required: true })
  userId: User;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "CourseModel", required: true })
  courseId: Course;

  @Prop({
    type: String,
    enum: ["completed", "in-progress"],
  })
  status: string;

  @Prop({ type: Date })
  enrolledAt: Date;

  @Prop({ type: Date })
  completedAt: Date;
  //  @Prop([{
  //   exerciseId: { type: mongoose.Schema.Types.ObjectId, ref: 'ExerciseModel', required: true },

  // }])
  // exerciseStatuses: ExerciseStatus[];
}

export const CourseStatusSchema = SchemaFactory.createForClass(CourseStatus);

// Tạo compound index để đảm bảo một user chỉ có một status cho mỗi course
CourseStatusSchema.index({ userId: 1, courseId: 1 }, { unique: true });

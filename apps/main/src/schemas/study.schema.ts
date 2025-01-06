import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Exercise } from './exercise.schema';
import { Types, Document, Model } from 'mongoose';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { CourseDocument } from './course.schema';
import { Course } from './course.schema';

// GraphQL ObjectType for Study
@ObjectType()
@Schema()
export class Study extends Exercise {
  @Field() // String type for GraphQL
  @Prop()
  defaultCode: string;

  @Field() // String type for GraphQL
  @Prop()
  solution: string;

  @Field(() => ID) // ObjectId type for GraphQL
  @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
  courseId: Types.ObjectId;
}

export type StudyDocument = Study & Document;

export const StudySchema = SchemaFactory.createForClass(Study);


// Middleware to update totalExercises in the Course
StudySchema.post<StudyDocument>('save', async function (doc, next) {
  const CourseModel = this.model('CourseModel') as Model<CourseDocument>;
  const StudyModel = this.model('StudyModel') as Model<StudyDocument>;
  const totalExercises = await StudyModel.countDocuments({ courseId: doc.courseId });
  await CourseModel.findByIdAndUpdate(doc.courseId, {
    totalExercises,
  });
  next();
});

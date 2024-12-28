import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Exercise } from './exercise.schema';
import { Types } from 'mongoose';
import { ObjectType, Field, ID } from '@nestjs/graphql'; // Import GraphQL decorators

@ObjectType() // GraphQL ObjectType for Study
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

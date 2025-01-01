import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { Testcase, TestcaseSchema } from './testcase.schema';

// Register enums with GraphQL
export enum LanguageEnum {
  Java = 'java',
  C = 'c',
  Cpp = 'cpp',
}

export enum DifficultyEnum {
  Easy = 'Easy',
  Medium = 'Medium',
  Hard = 'Hard',
}

registerEnumType(DifficultyEnum, {
  name: 'DifficultyEnum',
  description: 'The difficulty levels for exercises',
});

export const PredefinedTags = [
  'Array',
  'Function',
  'Loop',
  'String',
  'Recursion',
  'Algorithm',
];

@ObjectType() // GraphQL ObjectType for Exercise
@Schema({
  timestamps: true, // Adds createdAt and updatedAt fields
  discriminatorKey: 'type',
})
export class Exercise {
  @Field(() => ID) // ID type for GraphQL
  @Prop({ required: true })
  _id: Types.ObjectId;

  @Field() // String type for GraphQL
  @Prop({ required: true })
  title: string;

  @Field(() => DifficultyEnum) // Enum type for GraphQL
  @Prop({ enum: DifficultyEnum, required: true })
  difficulty: DifficultyEnum;

  @Field() // String type for GraphQL
  @Prop({ required: true })
  content: string;

  @Field(() => [String]) // Array of strings for GraphQL
  @Prop({
    type: [String],
    validate: {
      validator: (tags: string[]) =>
        tags.every((tag) => PredefinedTags.includes(tag)),
      message: 'Tags must be one of the predefined values',
    },
  })
  tags: string[];


  @Field(() => [Testcase]) // Array of Testcase type for GraphQL
  @Prop({
    type: [TestcaseSchema], // Use TestCase schema as a subdocument
    required: true,
  })
  testcases: Testcase[];

  //score 
  @Field(() => Number)
  @Prop({ required: true })
  score: number;

}

export type ExerciseDocument = Exercise & Document;

export const ExerciseSchema = SchemaFactory.createForClass(Exercise);

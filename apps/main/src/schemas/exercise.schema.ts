import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
// import { Testcase, TestcaseSchema } from '../../testcase/schema/testcase.schema';

export type ExerciseDocument = Exercise & Document;

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

export const PredefinedTags = [
  "Array",
  "Function",
  "Loop",
  "String",
  "Recursion",
  "Algorithm",
];

@Schema({
  timestamps: true, // Adds createdAt and updatedAt fields
})
export class Exercise {
  @Prop()
  title: string;



  @Prop({ enum: DifficultyEnum, required: true })
  difficulty: DifficultyEnum;

  @Prop()
  content: string;

  @Prop({
    type: [String],
    validate: {
      validator: (tags: string[]) =>
        tags.every((tag) => PredefinedTags.includes(tag)),
      message: 'Tags must be one of the predefined values',
    },
  })
  tags: string[];


  // @Prop({
  //   type: [TestcaseSchema], // Embed the Testcase schema as an array
  // })
  // testcases: Types.Array<Testcase>;
}

export const ExerciseSchema = SchemaFactory.createForClass(Exercise);

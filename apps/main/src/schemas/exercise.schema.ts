import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';

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
  @Prop({ required: true })
  title: string;

  @Prop({ enum: DifficultyEnum, required: true })
  difficulty: DifficultyEnum;

  @Prop({ required: true })
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

  @Prop({
    type: Map,
    of: { type: String }, // Specifies the data type for variable types
    required: true,
  })
  variableTypes: Map<string, 'string' | 'number' | 'array'>; // Defines a hashmap for variable types
  @Prop({
    type: String,
    required: true,
    enum: ['string', 'number', 'array'],
  })
  outputType: 'string' | 'number' | 'array'; // Defines the expected type for the output
  @Prop({
    type: [SchemaTypes.ObjectId],
    ref: 'Testcase', // Links to the Testcase model
  })
  testcases: Types.Array<Types.ObjectId>;
}

export const ExerciseSchema = SchemaFactory.createForClass(Exercise);


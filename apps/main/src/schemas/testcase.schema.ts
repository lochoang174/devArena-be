import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';
export type TestcaseDocument = Testcase & Document;

@Schema({
  timestamps: true, // Adds createdAt and updatedAt fields
})
export class Testcase {
  @Prop({
    type: [SchemaTypes.Mixed],
    required: true,
  })
  input: any[]; // Array to store variable values based on Exercise.variableTypes

  @Prop({
    type: SchemaTypes.Mixed,
    required: true,
  })
  output: any; // Flexible data type for the expected output

  @Prop({
    type: Boolean,
    default: false,
  })
  status: boolean; // Indicates if the testcase passed or not
}

export const TestcaseSchema = SchemaFactory.createForClass(Testcase);

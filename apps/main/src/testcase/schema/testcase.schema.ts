import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes,  } from 'mongoose';

export type TestcaseDocument = Testcase & Document;

@Schema({
  timestamps: true, // Adds createdAt and updatedAt fields
})
export class Testcase {
  @Prop({
    type: Map,
    of: SchemaTypes.Mixed,
    required: true,
  })
  input: Map<string, any>; // Map to store key-value pairs with dynamic data types

  @Prop({
    type: SchemaTypes.Mixed,
    required: true,
  })
  output: any; // Flexible data type for the output

  @Prop({
    type: Boolean,
    default: false,
  })
  hidden: boolean; // Boolean field for hidden status
}

export const TestcaseSchema = SchemaFactory.createForClass(Testcase);

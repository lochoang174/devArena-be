import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';


export type TestcaseDocument = Testcase & Document;

@Schema()
export class Testcase {
  @Prop({
    type: SchemaTypes.Mixed,
    required: true,
  })
  input: [any];

  @Prop({
    type: SchemaTypes.Mixed,
    required: true,
  })
  output: any;

  @Prop({ type: String || Number || Object, required: false })
  outputExpected?: any; // Explicitly define a type here (string, number, etc.).

  @Prop({
    type: Boolean,
    default: false,
  })
  hidden: boolean;
}

export const TestcaseSchema = SchemaFactory.createForClass(Testcase);

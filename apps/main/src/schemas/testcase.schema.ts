import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';
import { ObjectType, Field } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';

export type TestcaseDocument = Testcase & Document;

@ObjectType()
@Schema()
export class Testcase {
  @Field(() => GraphQLJSON, { description: 'Array to store variable values based on Exercise.variableTypes' })
  @Prop({
    type: SchemaTypes.Mixed,
    required: true,
  })
  input: any;

  @Field(() => GraphQLJSON, { description: 'Flexible data type for the expected output' })
  @Prop({
    type: SchemaTypes.Mixed,
    required: true,
  })
  output: any;

  @Field(() => Boolean, { description: 'Indicates if the testcase passed or not' })
  @Prop({
    type: Boolean,
    default: false,
  })
  status: boolean;
}

export const TestcaseSchema = SchemaFactory.createForClass(Testcase);

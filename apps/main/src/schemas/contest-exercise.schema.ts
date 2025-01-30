import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Exercise } from './exercise.schema';
import { Types } from 'mongoose';

@Schema()
export class ContestExercise extends Exercise {
  @Prop([
    {
      language: String,
      code: String,
    },
  ])
  solutions: { language: string; code: string }[];
  
  @Prop([
    {
      language: String,
      code: String,
    },
  ])
  defaultCode: { language: string; code: string }[];

  @Prop({ required: true, type: Types.ObjectId, ref: 'ContestDescription' })
  contestId: Types.ObjectId;
}
export type ContestExerciseDocument = ContestExercise & Document;
export const ContestExerciseSchema = SchemaFactory.createForClass(ContestExercise);

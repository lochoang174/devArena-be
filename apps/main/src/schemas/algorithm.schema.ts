import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Exercise } from './exercise.schema';

@Schema()
export class Algorithm extends Exercise {
  @Prop([
    {
      language: String,
      code: String,
    },
  ])
  solutions: { language: string; code: string }[];
}

export const AlgorithmSchema = SchemaFactory.createForClass(Algorithm);

import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class GraphExercise {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}

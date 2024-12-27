import { ObjectType, Field, Int } from "@nestjs/graphql";

@ObjectType()
export class TestCaseInput {
  @Field(() => [Int])
  array: number[];

  @Field(() => Int)
  size: number;
}

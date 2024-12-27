import { ObjectType, Field, Int } from "@nestjs/graphql";
import { TestCaseInput } from "./test-case-input.entity";

@ObjectType()
export class TestCase {
  @Field(() => [TestCaseInput])
  input: TestCaseInput[];

  @Field(() => [Int])
  output: number[];

  @Field()
  status: boolean;

  @Field()
  _id: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

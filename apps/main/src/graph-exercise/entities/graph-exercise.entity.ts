import { ObjectType, Field, Int } from "@nestjs/graphql";
import { VariableTypes } from "./variable-types.entity";
import { TestCase } from "./test-case.entity";


@ObjectType()
export class GraphExercise {
  @Field()
  title: string;

  @Field()
  difficulty: string;

  @Field()
  content: string;

  @Field(() => [String])
  tags: string[];

  @Field(() => VariableTypes)
  variableTypes: VariableTypes;

  @Field()
  outputType: string;

  @Field(() => [TestCase])
  testcases: TestCase[];

  @Field()
  _id: string;

  @Field()
  "type": string;

  @Field()
  solution: string;

  @Field()
  courseId: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

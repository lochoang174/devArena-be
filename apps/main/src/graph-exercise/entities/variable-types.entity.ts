import { ObjectType, Field } from "@nestjs/graphql";

@ObjectType()
export class VariableTypes {
  @Field()
  input: string;

  @Field()
  size: string;
}

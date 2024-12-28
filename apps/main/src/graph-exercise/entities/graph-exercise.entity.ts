import { ObjectType, Field } from "@nestjs/graphql";


@ObjectType()
export class GraphExercise {
  @Field() // Đảm bảo trường title có kiểu String
  title: string;


}

import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";

export type ContestDescriptionDocument = ContestDescription & Document;

@Schema({
  timestamps: true,
})
export class ContestDescription {
  @Prop({ required: true })
  contestName: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ default: 0 })
  participantsCount: number;

  @Prop({ required: true })
  image: string;


  @Prop({ default: "draft", enum: ["draft", "published", "completed"] })
  status: string;


}

export const ContestDescriptionSchema =
  SchemaFactory.createForClass(ContestDescription);

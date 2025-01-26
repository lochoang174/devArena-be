import { Schema, SchemaFactory } from "@nestjs/mongoose";

import { Prop } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";

@Schema()
export class ContestStatus {
    @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'ContestDescription' })
    contestId: MongooseSchema.Types.ObjectId;

    
    @Prop({ required: true })
    status: string;

    @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'User' })
    participant: MongooseSchema.Types.ObjectId;

    @Prop({ required: true })
    score: number;

    @Prop({ required: true })
    rank?: number;

    @Prop({ required: true })
    executionTime?: number;
    @Prop({ required: true })
    startDate: Date;

    @Prop({ required: true })
    endDate: Date;
}

export type ContestStatusDocument = ContestStatus & Document;
export const ContestStatusSchema = SchemaFactory.createForClass(ContestStatus);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { truncate } from 'fs';
import { Types, Document } from 'mongoose';

@Schema({ timestamps: true })
export class Achievement {
    @Prop({ required: true, trim: true })
    title: string;

    @Prop({
        type: Number,
        enum: [25, 50, 75, 100, 125, 150], // Mongoose will validate against these values
        required: true,
        default: 25, // Default value
    })
    requiredScore: number;


    @Prop({
        type: Types.ObjectId,
        required: true,
    })
    refId: Types.ObjectId;

    @Prop({ type: String, required: true })
    image: string;

    _id: string;
}

export type AchievementDocument = Achievement & Document;

export const AchievementSchema = SchemaFactory.createForClass(Achievement);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';

@Schema({ timestamps: true })
export class Achievement {
    @Prop({ required: true, trim: true })
    title: string;

    @Prop({
        type: Number,
        enum: [25, 50, 75, 100, 125, 150],
        default: 25,
    })
    requiredScore: number;

    @Prop({
        type: Types.ObjectId,
        ref: 'CourseModel',
        required: true,
    })
    courseId: Types.ObjectId;

    @Prop({ type: String, required: false })
    image?: string;
}

export type AchievementDocument = Achievement & Document;

export const AchievementSchema = SchemaFactory.createForClass(Achievement);

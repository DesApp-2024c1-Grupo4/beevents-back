/* eslint-disable prettier/prettier */
// user.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: true })
    password: string;

    @Prop({ required: true })
    role: string;

    @Prop({ required: true })
    names: string;

    @Prop({ required: true })
    surname: string;

    @Prop({ default: Date.now })
    createdAt: Date; // Timestamp de la creación de la cuenta.
}

export const UserSchema = SchemaFactory.createForClass(User);
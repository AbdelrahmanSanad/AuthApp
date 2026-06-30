import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, lowercase: true, trim: true, index: true })
  email!: string;

  @Prop({ required: true, trim: true })
  name!: string;

  /**
   * Argon2 hash. `select: false` keeps it out of every query result by default,
   * so it can never leak through a controller response by accident.
   */
  @Prop({ required: true, select: false })
  password!: string;

  /**
   * Argon2 hash of the user's current refresh token. Enables rotation and
   * revocation: a presented token only validates if it matches this hash.
   * Null once the user logs out. Never selected by default.
   */
  @Prop({ type: String, default: null, select: false })
  hashedRefreshToken!: string | null;
}

export const UserSchema = SchemaFactory.createForClass(User);

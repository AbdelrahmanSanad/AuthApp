import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

export interface CreateUserInput {
  email: string;
  name: string;
  password: string;
}

/**
 * Owns all access to the User collection. The auth module depends on this
 * service rather than touching the model directly (separation of concerns).
 */
@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {}

  create(input: CreateUserInput): Promise<UserDocument> {
    return this.userModel.create(input);
  }

  findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase() }).exec();
  }

  /** Includes the password hash, needed only for credential verification. */
  findByEmailWithPassword(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase() }).select('+password').exec();
  }

  findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  /** Includes the refresh-token hash, needed only to validate a refresh request. */
  findByIdWithRefreshToken(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).select('+hashedRefreshToken').exec();
  }

  /** Stores (or clears, with null) the hash of the user's current refresh token. */
  async setRefreshTokenHash(id: string, hashedRefreshToken: string | null): Promise<void> {
    await this.userModel.updateOne({ _id: id }, { hashedRefreshToken }).exec();
  }
}

import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';

/**
 * Thin wrapper around argon2 so hashing details live in one place and can be
 * swapped or mocked in tests without touching business logic.
 */
@Injectable()
export class HashingService {
  hash(plain: string): Promise<string> {
    return argon2.hash(plain, { type: argon2.argon2id });
  }

  verify(hash: string, plain: string): Promise<boolean> {
    return argon2.verify(hash, plain);
  }
}

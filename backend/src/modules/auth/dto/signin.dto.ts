import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class SigninDto {
  @ApiProperty({ example: 'jane@example.com' })
  @IsEmail({}, { message: 'A valid email address is required' })
  email!: string;

  @ApiProperty({ example: 'Str0ng!Pass' })
  @IsString()
  @MinLength(1, { message: 'Password is required' })
  password!: string;
}

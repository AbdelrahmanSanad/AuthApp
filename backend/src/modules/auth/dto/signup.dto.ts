import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class SignupDto {
  @ApiProperty({ example: 'jane@example.com' })
  @IsEmail({}, { message: 'A valid email address is required' })
  email!: string;

  @ApiProperty({ example: 'Jane Doe', minLength: 3 })
  @IsString()
  @MinLength(3, { message: 'Name must be at least 3 characters long' })
  @MaxLength(80)
  name!: string;

  @ApiProperty({
    example: 'Str0ng!Pass',
    description:
      'At least 8 characters and must contain a letter, a number and a special character',
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(128)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/, {
    message: 'Password must contain a letter, a number and a special character',
  })
  password!: string;
}

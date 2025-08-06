import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @ApiProperty()
  name?: string;

  @IsOptional() 
  @ApiProperty()
  first_name?: string;

  @IsOptional() 
  @ApiProperty()
  last_name?: string;


  @IsNotEmpty()
  @MinLength(8, { message: 'Password should be minimum 8' })
  @ApiProperty()
  password: string;

  @IsEmail()
  @ApiProperty()
  email: string;

  @ApiProperty({ required: false })
  token?: string;

  @IsOptional()
  @ApiProperty({
    type: String,
    example: 'user',
  })
  type?: string;
}

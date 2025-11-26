import { IsEmail, IsString, MinLength } from 'class-validator';

export class AuthDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6, { message: 'Şifre en az 6 karakter olmalı' })
  password: string;
}

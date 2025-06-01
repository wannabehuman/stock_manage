import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsNotEmpty({ message: '사용자 이름은 필수입니다.' })
  @IsString()
  username: string;

  @IsNotEmpty({ message: '비밀번호는 필수입니다.' })
  @IsString()
  password: string;
}

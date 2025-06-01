import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { UserStatus } from '../../users/entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET || 'jwt_secret_key',
    });
  }

  async validate(payload: any) {
    const user = await this.authService.validateUser(payload);
    if (!user || user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('접근 권한이 없습니다.');
    }
    
    return {
      id: payload.sub,
      username: payload.username,
      role: payload.role,
    };
  }
}

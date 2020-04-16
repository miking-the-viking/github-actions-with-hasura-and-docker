import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { authConstants } from './constants';
import { UserService } from '../user/user.service';
import { JwtDto } from './dto/jwt.dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: authConstants.jwtSecret
    });
  }

  async validate(payload: JwtDto) {
    const user = await this.userService.userById(payload.userId);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}

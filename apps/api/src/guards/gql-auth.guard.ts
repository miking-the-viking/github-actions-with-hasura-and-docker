import {
  ExecutionContext,
  Injectable,
  UnauthorizedException
} from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class GqlAuthGuard extends AuthGuard('jwt') {
  constructor(
    private readonly moduleRef: ModuleRef,
    private readonly authService: AuthService
  ) {
    super();
  }
  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    const req = ctx.getContext().req;
    return req;
  }

  async canActivate(context: ExecutionContext) {
    const request = this.getRequest(context);
    const authString =
      request.headers.authorization || request.headers.Authorization;
    if (!authString) throw new UnauthorizedException();
    const bearerToken = authString.replace('Bearer ', '');
    const authService =
      this.authService ??
      (await this.moduleRef.resolve(AuthService)) ??
      (await this.moduleRef.resolve(AuthService));
    const user = await authService.getUserFromToken(bearerToken);
    request.user = user;
    if (!user) {
      return false;
    }
    // If you want to allow the request even if auth fails, always return true
    return !!user;
  }
}

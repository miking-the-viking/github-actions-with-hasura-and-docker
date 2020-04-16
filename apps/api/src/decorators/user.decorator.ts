import { createParamDecorator } from '@nestjs/common';
import { User } from '../user/types';

export const CurrentUser = createParamDecorator(
  (data, [root, args, ctx, info]) => {
    return ctx.req.user;
  }
);

import { Module, forwardRef } from '@nestjs/common';
import { UserService } from './user.service';
import { GraphqlModule } from '../graphql/graphql.module';
import { UserResolver } from './user.resolver';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [GraphqlModule, forwardRef(() => AuthModule)],
  providers: [UserService, UserResolver],
  exports: [UserService, UserResolver]
})
export class UserModule {}

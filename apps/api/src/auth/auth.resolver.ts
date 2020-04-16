import {
  Args,
  Mutation,
  Parent,
  Resolver,
  ResolveField
} from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { LoginInput } from './dto/login.input';
import { SignupInput } from './dto/signup.input';
import { Auth } from './types';

@Resolver(of => Auth)
export class AuthResolver {
  constructor(private readonly auth: AuthService) {}

  @Mutation(returns => Auth)
  async signup(@Args('data') data: SignupInput) {
    data.email = data.email.toLowerCase();
    const token = await this.auth.createUser(data);
    return {
      token
    };
  }

  @Mutation(returns => Auth)
  async login(@Args('data') { email, password }: LoginInput) {
    const token = await this.auth.login(email.toLowerCase(), password);
    return {
      token
    };
  }

  @ResolveField('user')
  async user(@Parent() auth: Auth) {
    return await this.auth.getUserFromToken(auth.token);
  }
}

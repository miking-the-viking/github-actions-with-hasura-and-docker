import { Injectable } from '@nestjs/common';
import { GraphqlService } from '../graphql/graphql.service';

@Injectable()
export class UserService {
  constructor(private readonly gqlService: GraphqlService) {}

  public async getMe(userId: string) {
    return (await this.gqlService.sdk.User({ userId })).users_by_pk;
  }

  public userById(userId: string) {
    return this.getMe(userId);
  }

  public async getUserByEmail(email: string) {
    return (
      await this.gqlService.sdk.UserByEmail({
        email
      })
    ).users[0];
  }

  public async createUser(createUserData) {
    const createdUser = (await this.gqlService.sdk.CreateUser(createUserData))
      .insert_users.returning[0];

    return createdUser;
  }
}

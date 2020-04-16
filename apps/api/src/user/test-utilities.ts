import { CreateUserMutationVariables } from '../../hasura-graphql';
import * as faker from 'faker';
import { GraphqlService } from '../graphql/graphql.service';
import { PasswordService } from '../auth/password.service';

export const createUserMutationVariableFactory = (
  userData: Partial<CreateUserMutationVariables> = {}
) => ({
  email: userData.email || (faker.internet.email() as string),
  password: userData.password || (faker.random.word() as string)
  // role: userData.role || 'ADMIN'
});

/**
 * Seeds a User in the `users` table and returns the result
 *
 * @param service
 * @param userData
 */
export const seedUser = async (
  service: GraphqlService,
  users: { id?: string; email?: string }[],
  userData: CreateUserMutationVariables = createUserMutationVariableFactory()
) => {
  const pwService = new PasswordService();
  const hashedPassword = await pwService.hashPassword(userData.password);
  const userDataToStore = {
    ...userData,
    password: hashedPassword
  };
  const user = (await service.sdk.CreateUser(userDataToStore)).insert_users
    .returning[0];
  users.push(user);
  return { ...user, password: userData.password };
};

/**
 * Removes a User from the `users` table by id or email
 *
 * @param service
 * @param userId
 */
export const clearUser = async (
  service: GraphqlService,
  userId: { id: string }
) => {
  return await service.sdk.DeleteUserById({
    id: userId.id
  });
};

/**
 * Purge all users from an array of users
 * @param service
 * @param users
 */
export const purgeUsers = async (
  service: GraphqlService,
  users: { id: string }[]
) => {
  while (users.length > 0) {
    await clearUser(service, users.pop());
  }
};

export const signupMutationFactory = ({
  email,
  password
}: {
  email?: string;
  password?: string;
}) => `mutation {
        signup(
          data: {
            ${email ? `email: "${email}"` : ''}
            ${password ? `password: "${password}"` : ''}
          }
        ) 
        { token }
      }`;

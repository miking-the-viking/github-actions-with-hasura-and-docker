import { Test, TestingModule } from '@nestjs/testing';
import { GraphqlModule } from '../graphql/graphql.module';
import { GraphqlService } from '../graphql/graphql.service';
import {
  createUserMutationVariableFactory,
  purgeUsers,
  seedUser
} from './test-utilities';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let gqlService: GraphqlService;

  const createdUserPurgeArray = [];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [GraphqlModule],
      providers: [UserService]
    }).compile();

    service = module.get<UserService>(UserService);
    gqlService = module.get<GraphqlService>(GraphqlService);
  });

  afterAll(async () => {
    await purgeUsers(gqlService, createdUserPurgeArray);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUser', () => {
    it('Throws when the email already exists', async () => {
      const existing = await seedUser(gqlService, createdUserPurgeArray);

      await expect(
        service.createUser(
          createUserMutationVariableFactory({ email: existing.email })
        )
      ).rejects.toThrow(
        `Uniqueness violation. duplicate key value violates unique constraint "users_email_key"`
      );
    });

    it('Creates the user', async () => {
      const userData = createUserMutationVariableFactory();

      const createUserResult = await service.createUser(userData);

      // include in the userPurgeArray
      createdUserPurgeArray.push(createUserResult);

      // validate the user exists
      const userRecord = (
        await gqlService.sdk.UserByEmail({
          email: createUserResult.email
        })
      ).users[0];

      expect(userRecord).toMatchObject(createUserResult);
    });
  });
});

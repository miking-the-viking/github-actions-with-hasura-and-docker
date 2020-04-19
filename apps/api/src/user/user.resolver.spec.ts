import { Test, TestingModule } from '@nestjs/testing';
import * as faker from 'faker';
import { AuthModule } from '../auth/auth.module';
import { User } from './types';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';

const userServiceMock = jest.genMockFromModule<UserService>('./user.service');

const fakeUserResult: User & { password: string } = {
  id: faker.random.uuid(),
  email: faker.internet.email(),
  password: faker.random.word(),
  // role: faker.random.arrayElement([Role.ADMIN, Role.USER]),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

describe('UserResolver', () => {
  let resolver: UserResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AuthModule],
      providers: [UserResolver, UserService]
    })
      .overrideProvider(UserService)
      .useValue(userServiceMock)
      .compile();

    resolver = module.get<UserResolver>(UserResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('METHOD: me', () => {
    let matchingScenarios;

    it('Returns the corresponding user', async () => {
      const userData = fakeUserResult as User;

      userServiceMock.createUser = jest.fn(async () => fakeUserResult as any);

      userServiceMock.getMe = jest.fn(async () => fakeUserResult as any);

      const userReturned = await resolver.me(userData);

      expect(userReturned).toMatchObject(fakeUserResult);
    });
  });
});

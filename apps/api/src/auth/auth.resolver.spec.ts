import { TestingModule, Test } from '@nestjs/testing';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
import * as faker from 'faker';
const authServiceMock = jest.genMockFromModule<AuthService>('./auth.service');

const fakeToken = faker.random.uuid();
const fakeLogin = {
  email: faker.internet.email(),
  password: faker.random.word()
};
const fakeSignup = {
  ...fakeLogin,
  name: faker.name.firstName()
};
const fakeUserResult = {
  id: faker.random.uuid(),
  name: faker.name.firstName(),
  created_at: faker.date.past(),
  updated_at: faker.date.past(),
  email: faker.internet.email(),
  password: faker.random.word(),
  role: faker.random.arrayElement(['ADMIN', 'USER'])
  //   github_keys: [],
  //   games: []
};

describe('Auth Resolver', () => {
  let resolver: AuthResolver;
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [AuthResolver, AuthService]
    })
      .overrideProvider(AuthService)
      .useValue(authServiceMock)
      .compile();
    resolver = moduleFixture.get<AuthResolver>(AuthResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('Signup', () => {
    it('creates a user and returns a token', async () => {
      authServiceMock.createUser = jest.fn(async () => fakeToken);

      await expect(resolver.signup(fakeSignup)).resolves.toEqual({
        token: fakeToken
      });
    });
  });

  describe('Login', () => {
    it('resolves to return a token', async () => {
      authServiceMock.login = jest.fn(async () => fakeToken);

      await expect(resolver.login(fakeLogin)).resolves.toEqual({
        token: fakeToken
      });
    });
  });

  describe('User', () => {
    it('resolves to a user result', async () => {
      authServiceMock.getUserFromToken = jest.fn(
        async () => fakeUserResult as any
      );

      await expect(resolver.user({ token: 'test' } as any)).resolves.toEqual(
        fakeUserResult
      );
    });
  });
});

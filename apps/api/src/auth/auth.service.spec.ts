import { JwtModule } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { decode, sign } from 'jsonwebtoken';
import {
  createUserMutationVariableFactory,
  purgeUsers,
  seedUser
} from '../user/test-utilities';
import { authConstants } from './constants';
import { GraphqlModule } from '../graphql/graphql.module';
import { GraphqlService } from '../graphql/graphql.service';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { PasswordService } from './password.service';
import { UserModule } from '../user/user.module';

describe('Auth Service', () => {
  let service: AuthService;
  let gqlService: GraphqlService;
  let passwordService: PasswordService;

  const createdUserPurgeArray = [];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService, PasswordService, JwtStrategy],
      imports: [
        GraphqlModule,
        JwtModule.register({
          secret: authConstants.jwtSecret
        }),
        UserModule
      ]
    }).compile();

    service = module.get<AuthService>(AuthService);
    gqlService = module.get<GraphqlService>(GraphqlService);
    passwordService = module.get<PasswordService>(PasswordService);
  });

  afterAll(async () => {
    await purgeUsers(gqlService, createdUserPurgeArray);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('gqlService should be defined', () => {
    expect(gqlService).toBeDefined();
  });

  describe('createUser', () => {
    it('Throws when the email already exists', async () => {
      const existing = await seedUser(gqlService, createdUserPurgeArray);

      await expect(
        service.createUser(
          createUserMutationVariableFactory({ email: existing.email })
        )
      ).rejects.toThrow(`User already exists ${existing.email}`);
    });

    it('Creates the user, returning a jwt and hashes the password successfully', async () => {
      const userData = createUserMutationVariableFactory();
      const userDataSuccess = await service.createUser(userData);

      // jwt should be signed with userId
      expect(decode(userDataSuccess)).toHaveProperty('userId');

      // validate the user exists
      const userRecord = (
        await gqlService.sdk.UserByEmail({
          email: userData.email
        })
      ).users[0];

      // include in the userPurgeArray
      createdUserPurgeArray.push(userRecord);

      // validate the password
      expect(
        passwordService.validatePassword(userData.password, userRecord.password)
      ).resolves.toBeTruthy();
    });
  });

  describe('login', () => {
    it('Throws a "Invalid Login" if the user does not exist', async () => {
      const userData = createUserMutationVariableFactory();
      expect(service.login(userData.email, userData.password)).rejects.toThrow(
        'Invalid Login'
      );
    });

    it('Throws a "Invalid Login" if the password is invalid', async () => {
      const userData = createUserMutationVariableFactory();
      await seedUser(gqlService, createdUserPurgeArray, userData);

      expect(
        service.login(userData.email, userData.password + 'xxxx')
      ).rejects.toThrow('Invalid Login');
    });

    it('Returns a valid jwt containing `userId` on successful login', async () => {
      const userData = createUserMutationVariableFactory();
      await service.createUser(userData);

      const user = (
        await gqlService.sdk.UserByEmail({
          email: userData.email
        })
      ).users[0];
      createdUserPurgeArray.push(user);

      const loginSuccess = await service.login(
        userData.email,
        userData.password
      );

      const jwtObject = decode(loginSuccess);
      // validate the existence and value of these keys
      expect(jwtObject['userId']).toEqual(user.id);
    });
  });

  describe('getUserFromToken', () => {
    it('returns null if the id does not exist', async () => {
      const jwt = sign(
        { userId: 'fa564b3d-7735-41e0-801d-4b00605f60ff' },
        authConstants.jwtSecret
      );

      expect(service.getUserFromToken(jwt)).resolves.toBeNull();
    });

    it('Returns the valid user entity when the user exists', async () => {
      const userData = createUserMutationVariableFactory();
      const jwt = await service.createUser(userData);
      const decoded = decode(jwt);
      const user = (
        await gqlService.sdk.User({
          userId: decoded['userId']
        })
      ).users_by_pk;
      createdUserPurgeArray.push(user);

      await expect(service.getUserFromToken(jwt)).resolves.toEqual(user);
    });
  });
});

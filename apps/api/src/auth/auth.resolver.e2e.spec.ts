import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { decode } from 'jsonwebtoken';
import * as request from 'supertest';
import { purgeUsers, signupMutationFactory } from '../user/test-utilities';
import { AppModule } from '../app/app.module';
import { GraphqlService } from '../graphql/graphql.service';

const USER_BASE = {
  name: 'test',
  password: 'test',
  email: 'test@test.com'
};

const INVALID_VALIDATION_SCENARIOS = [
  {
    it: `email is missing`,
    mutation: signupMutationFactory({
      ...USER_BASE,
      email: undefined
    }),
    errorTextContains: `Field SignupInput.email of required type String! was not provided.`
  },
  {
    it: `password is missing`,
    mutation: signupMutationFactory({
      ...USER_BASE,
      password: undefined
    }),
    errorTextContains: `Field SignupInput.password of required type String! was not provided.`
  }
];

describe('Auth Resolver (E2E)', () => {
  let app: INestApplication;
  let gqlService: GraphqlService;
  const usersCreatedToPurge = [];

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();
    gqlService = await moduleFixture.resolve<GraphqlService>(GraphqlService);
    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await purgeUsers(gqlService, usersCreatedToPurge);
  });

  describe('signup (Mutation)', () => {
    describe('Validation', () => {
      INVALID_VALIDATION_SCENARIOS.map(scenario => {
        it(`Throws 400 when ${scenario.it}`, async () => {
          const req = request(app.getHttpServer())
            .post('/graphql')
            .send({
              query: scenario.mutation
            });
          const res = await req;

          expect(res.status).toEqual(400);
          expect(
            res.error.text.indexOf(scenario.errorTextContains) >= 0
          ).toBeTruthy();
        });
      });
    });
    it('Successfully registers a user and returns an auth token', async () => {
      const userData = signupMutationFactory({
        email: 'test@test.com',
        password: 'test'
      });
      const req = request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: userData
        });
      const res = await req;

      expect(res.status).toEqual(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body.data).toHaveProperty('signup');
      expect(res.body.data.signup).toHaveProperty('token');

      const parsed = decode(res.body.data.signup.token);
      const data = { id: (parsed as any).userId };
      usersCreatedToPurge.push({ id: (parsed as any).userId });
    });
    it('Throws a 422 in the GraphQL Response when the user already exists', async () => {
      const dupUserData = signupMutationFactory({
        email: 'test2@test.com',
        password: 'test2'
      });
      const req1 = request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: dupUserData
        });
      const res1 = await req1;
      expect(res1.status).toEqual(200);
      const parsed = decode(res1.body.data.signup.token);
      usersCreatedToPurge.push({ id: (parsed as any).userId });

      const req2 = request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: dupUserData
        });
      const res2 = await req2;
      expect(res2.status).toEqual(200);
      // GQL Response Errors
      expect(res2.body.errors[0].message).toEqual({
        statusCode: 422,
        error: 'Unprocessable Entity',
        message: 'User already exists test2@test.com'
      });
    });
  });
});

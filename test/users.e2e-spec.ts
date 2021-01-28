import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getConnection, Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

const GRAPHQL_ENDPOINT = '/graphql';
const EMAIL = 'leyetest@test.com';

jest.mock('got', () => {
  return {
    post: jest.fn(),
  };
});

describe('UserModule  (e2e)', () => {
  let app: INestApplication;
  let jwtToken: string;
  let usersRepository: Repository<User>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
    await app.init();
  });

  afterAll(async () => {
    //drop database after test completed
    await getConnection().dropDatabase();
    app.close();
  });

  //it.todo('createAccount');
  describe('createAccount', () => {
    it('should create account', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
            mutation {
              createAccount(input: {
                email: "${EMAIL}",
                password: "1234",
                role: Owner
              }) {
                ok
                error
              }
            }
          `,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                createAccount: { ok, error },
              },
            },
          } = res;
          expect(ok).toBe(true);
          expect(error).toBe(null);
        });
    });

    it('should fail if account already exist', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
            mutation {
              createAccount(input: {
                email: "${EMAIL}",
                password: "1234",
                role: Owner
              }) {
                ok
                error
              }
            }`,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                createAccount: { ok, error },
              },
            },
          } = res;
          console.log(res.body);
          expect(ok).toBe(false);
          expect(error).toBe('There is a user with that email already');
        });
    });
  });
  //it.todo('login');
  describe('login', () => {
    it('should return token', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
           mutation {
            login(input:{
              email: "${EMAIL}",
              password: "1234"
            }){
              ok
              error
              token
            }
          }   
        `,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                login: { ok, error, token },
              },
            },
          } = res;
          expect(ok).toBe(true);
          expect(error).toBe(null);
          expect(token).toEqual(expect.any(String));
          jwtToken = token;
        });
    });

    it('should fail if user does not exist', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
            mutation {
              login(input:{
                email: "${EMAIL}.com",
                password: "1234"
              }){
                ok
                error
                token
              }
            }   
          `,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                login: { ok, error, token },
              },
            },
          } = res;
          expect(ok).toBe(false);
          expect(error).toBe('User not found');
          expect(token).toEqual(null);
        });
    });

    it('should fail with wrong password', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
            mutation {
              login(input:{
                email: "${EMAIL}",
                password: "123"
              }){
                ok
                error
                token
              }
            }   
          `,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                login: { ok, error, token },
              },
            },
          } = res;
          expect(ok).toBe(false);
          expect(error).toBe('Wrong Password');
          expect(token).toEqual(null);
        });
    });
  });

  //it.todo('userProfile');
  describe('userProfile', () => {
    let userId: number;
    beforeAll(async () => {
      const { id } = await usersRepository.findOne({ email: EMAIL });
      userId = id;
    });

    it('should find a user profile by userId', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set('x-token', jwtToken)
        .send({
          query: `
            {
              userProfile(userId: ${userId}){
                ok
                error
                user {
                  id
                  email
                }
              }
            }
          `,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                userProfile: {
                  ok,
                  error,
                  user: { id, email },
                },
              },
            },
          } = res;
          expect(ok).toBe(true);
          expect(error).toBe(null);
          expect(id).toBe(userId);
          expect(email).toBe(EMAIL);
        });
    });

    it('should not find a user profile', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set('x-token', jwtToken) //set header
        .send({
          query: `
            {
              userProfile(userId: ${userId}1){
                ok
                error
                user {
                  id
                  email
                }
              }
            }
          `,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                userProfile: { ok, error, user },
              },
            },
          } = res;
          expect(ok).toBe(false);
          expect(error).toBe('User Not Found');
          expect(user).toBe(null);
        });
    });
  });

  it.todo('me');
  it.todo('verifyEmail');
  it.todo('editProfile');
  it.todo('deleteProfile');
});

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { User } from '../src/user/user.entity';
import { getConnection } from 'typeorm';
import { UserRole } from '../src/user/user.entity';
import * as bcrypt from 'bcrypt';
import { UserService } from '../src/user/user.service';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let userService: UserService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
    userService = moduleFixture.get<UserService>(UserService);
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(async () => {
    const connection = getConnection();
    await connection.getRepository(User).clear();
  });

  it('/auth/register (POST) - should register a user', async () => {
    return request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'test@test.com', password: 'password' })
      .expect(201)
      .then((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body.email).toEqual('test@test.com');
      });
  });

  describe('with a created user', () => {
    let user;
    beforeEach(async () => {
      const hashedPassword = await bcrypt.hash('password', 10);
      user = await userService.create({
        email: 'test@test.com',
        password: hashedPassword,
      });
    });

    it('/auth/login (POST) - should login a user and return a token', async () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'test@test.com', password: 'password' })
        .expect(201)
        .then((res) => {
          expect(res.body).toHaveProperty('access_token');
        });
    });

    it('/profile (GET) - should not get profile for unauthenticated user', async () => {
      return request(app.getHttpServer()).get('/profile').expect(401);
    });

    it('/profile (GET) - should not get profile for user with wrong role', async () => {
      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'test@test.com', password: 'password' });

      return request(app.getHttpServer())
        .get('/profile')
        .set('Authorization', `Bearer ${loginRes.body.access_token}`)
        .expect(403);
    });

    it('/profile (GET) - should get profile for admin user', async () => {
      user.role = UserRole.ADMIN;
      await getConnection().getRepository(User).save(user);

      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'test@test.com', password: 'password' });

      return request(app.getHttpServer())
        .get('/profile')
        .set('Authorization', `Bearer ${loginRes.body.access_token}`)
        .expect(200)
        .then((res) => {
          expect(res.body.email).toEqual('test@test.com');
        });
    });
  });
});

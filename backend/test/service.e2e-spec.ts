import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getConnection } from 'typeorm';
import { User, UserRole } from '../src/user/user.entity';
import { Service } from '../src/service/service.entity';
import { AuthService } from '../src/auth/auth.service';

describe('ServiceController (e2e)', () => {
  let app: INestApplication;
  let authService: AuthService;
  let adminToken: string;
  let instructorToken: string;
  let studentToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
    authService = moduleFixture.get<AuthService>(AuthService);

    // Create users and tokens
    const connection = getConnection();
    const userRepository = connection.getRepository(User);
    const admin = await userRepository.save({ email: 'admin@test.com', password: 'password', role: UserRole.ADMIN });
    const instructor = await userRepository.save({ email: 'instructor@test.com', password: 'password', role: UserRole.INSTRUCTOR });
    const student = await userRepository.save({ email: 'student@test.com', password: 'password', role: UserRole.STUDENT });

    adminToken = (await authService.login(admin)).access_token;
    instructorToken = (await authService.login(instructor)).access_token;
    studentToken = (await authService.login(student)).access_token;
  });

  afterEach(async () => {
    const connection = getConnection();
    await connection.getRepository(User).clear();
    await connection.getRepository(Service).clear();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/service (POST) - admin should create a service', () => {
    return request(app.getHttpServer())
      .post('/service')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Tajweed Lesson', description: 'A lesson in Tajweed', price: 50 })
      .expect(201);
  });

  it('/service (POST) - instructor should create a service', () => {
    return request(app.getHttpServer())
      .post('/service')
      .set('Authorization', `Bearer ${instructorToken}`)
      .send({ name: 'Quran Recitation', description: 'A lesson in Quran recitation', price: 40 })
      .expect(201);
  });

  it('/service (POST) - student should not create a service', () => {
    return request(app.getHttpServer())
      .post('/service')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ name: 'Invalid Service', description: 'This should not be created', price: 10 })
      .expect(403);
  });

  it('/service (GET) - should get all services', async () => {
    await request(app.getHttpServer())
      .post('/service')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Service 1', description: 'Desc 1', price: 10 });
    await request(app.getHttpServer())
      .post('/service')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Service 2', description: 'Desc 2', price: 20 });

    return request(app.getHttpServer())
      .get('/service')
      .expect(200)
      .then((res) => {
        expect(res.body.length).toBe(2);
      });
  });
});

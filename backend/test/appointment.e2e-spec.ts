import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getConnection } from 'typeorm';
import { User, UserRole } from '../src/user/user.entity';
import { Service } from '../src/service/service.entity';
import { Appointment } from '../src/appointment/appointment.entity';
import { AuthService } from '../src/auth/auth.service';

describe('AppointmentController (e2e)', () => {
  let app: INestApplication;
  let authService: AuthService;
  let adminToken: string;
  let instructorToken: string;
  let studentToken: string;
  let student2Token: string;
  let service: Service;
  let instructor: User;
  let student: User;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
    authService = moduleFixture.get<AuthService>(AuthService);

    const connection = getConnection();
    const userRepository = connection.getRepository(User);
    const serviceRepository = connection.getRepository(Service);

    const admin = await userRepository.save({ email: 'admin@test.com', password: 'password', role: UserRole.ADMIN });
    instructor = await userRepository.save({ email: 'instructor@test.com', password: 'password', role: UserRole.INSTRUCTOR });
    student = await userRepository.save({ email: 'student@test.com', password: 'password', role: UserRole.STUDENT });
    const student2 = await userRepository.save({ email: 'student2@test.com', password: 'password', role: UserRole.STUDENT });

    adminToken = (await authService.login(admin)).access_token;
    instructorToken = (await authService.login(instructor)).access_token;
    studentToken = (await authService.login(student)).access_token;
    student2Token = (await authService.login(student2)).access_token;

    service = await serviceRepository.save({ name: 'Tajweed Lesson', description: 'A lesson in Tajweed', price: 50 });
  });

  afterEach(async () => {
    const connection = getConnection();
    await connection.getRepository(User).clear();
    await connection.getRepository(Service).clear();
    await connection.getRepository(Appointment).clear();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/appointment (POST) - student should book an appointment', () => {
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + 30 * 60000); // 30 minutes later
    return request(app.getHttpServer())
      .post('/appointment')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        instructorId: instructor.id,
        serviceId: service.id,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      })
      .expect(201);
  });

  it('/appointment (GET) - admin should get all appointments', async () => {
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + 30 * 60000);
    await request(app.getHttpServer())
      .post('/appointment')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        studentId: student.id,
        instructorId: instructor.id,
        serviceId: service.id,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      });

    return request(app.getHttpServer())
      .get('/appointment')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)
      .then((res) => {
        expect(res.body.length).toBe(1);
      });
  });

  describe('with a created appointment', () => {
    let appointment: Appointment;

    beforeEach(async () => {
      const startTime = new Date();
      const endTime = new Date(startTime.getTime() + 30 * 60000);
      const res = await request(app.getHttpServer())
        .post('/appointment')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          instructorId: instructor.id,
          serviceId: service.id,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
        });
      appointment = res.body;
    });

    it('/appointment/:id (GET) - student should get their own appointment', () => {
      return request(app.getHttpServer())
        .get(`/appointment/${appointment.id}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);
    });

    it('/appointment/:id (GET) - student should not get another student\'s appointment', () => {
      return request(app.getHttpServer())
        .get(`/appointment/${appointment.id}`)
        .set('Authorization', `Bearer ${student2Token}`)
        .expect(403);
    });

    it('/appointment/:id (DELETE) - student should delete their own appointment', () => {
      return request(app.getHttpServer())
        .delete(`/appointment/${appointment.id}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);
    });

    it('/appointment/:id (DELETE) - student should not delete another student\'s appointment', () => {
      return request(app.getHttpServer())
        .delete(`/appointment/${appointment.id}`)
        .set('Authorization', `Bearer ${student2Token}`)
        .expect(403);
    });
  });
});

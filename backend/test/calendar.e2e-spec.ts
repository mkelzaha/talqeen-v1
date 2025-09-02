import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getConnection } from 'typeorm';
import { User, UserRole } from '../src/user/user.entity';
import { Service } from '../src/service/service.entity';
import { Appointment } from '../src/appointment/appointment.entity';
import { Availability } from '../src/calendar/availability.entity';
import { AuthService } from '../src/auth/auth.service';

describe('CalendarController (e2e)', () => {
  let app: INestApplication;
  let authService: AuthService;
  let studentToken: string;
  let instructor: User;

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
    const availabilityRepository = connection.getRepository(Availability);
    const appointmentRepository = connection.getRepository(Appointment);
    const serviceRepository = connection.getRepository(Service);

    instructor = await userRepository.save({ email: 'instructor@test.com', password: 'password', role: UserRole.INSTRUCTOR });
    const student = await userRepository.save({ email: 'student@test.com', password: 'password', role: UserRole.STUDENT });

    studentToken = (await authService.login(student)).access_token;

    const service = await serviceRepository.save({ name: 'Tajweed Lesson', description: 'A lesson in Tajweed', price: 50 });

    // Add availability for the instructor
    const availabilityStartTime = new Date();
    availabilityStartTime.setHours(9, 0, 0, 0);
    const availabilityEndTime = new Date();
    availabilityEndTime.setHours(17, 0, 0, 0);
    await availabilityRepository.save({
      instructor,
      startTime: availabilityStartTime,
      endTime: availabilityEndTime,
    });

    // Add an appointment to block a slot
    const appointmentStartTime = new Date();
    appointmentStartTime.setHours(10, 0, 0, 0);
    const appointmentEndTime = new Date();
    appointmentEndTime.setHours(10, 30, 0, 0);
    await appointmentRepository.save({
      student,
      instructor,
      service,
      startTime: appointmentStartTime,
      endTime: appointmentEndTime,
    });
  });

  afterAll(async () => {
    const connection = getConnection();
    await connection.getRepository(User).clear();
    await connection.getRepository(Service).clear();
    await connection.getRepository(Appointment).clear();
    await connection.getRepository(Availability).clear();
    await app.close();
  });

  it('/calendar/instructor/:id/availability (GET) - should get instructor availability', () => {
    return request(app.getHttpServer())
      .get(`/calendar/instructor/${instructor.id}/availability`)
      .set('Authorization', `Bearer ${studentToken}`)
      .expect(200)
      .then((res) => {
        expect(Array.isArray(res.body)).toBe(true);
        // A more detailed test would check the actual time slots
      });
  });
});

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment } from './appointment.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentsRepository: Repository<Appointment>,
  ) {}

  findAll(): Promise<Appointment[]> {
    return this.appointmentsRepository.find({ relations: ['student', 'instructor', 'service'] });
  }

  findOne(id: number): Promise<Appointment> {
    return this.appointmentsRepository.findOne({ where: { id }, relations: ['student', 'instructor', 'service'] });
  }

  create(createAppointmentDto: CreateAppointmentDto): Promise<Appointment> {
    const appointment = this.appointmentsRepository.create(createAppointmentDto);
    return this.appointmentsRepository.save(appointment);
  }

  async remove(id: number): Promise<void> {
    await this.appointmentsRepository.delete(id);
  }
}

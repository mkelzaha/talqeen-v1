import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Availability } from './availability.entity';
import { Appointment } from '../appointment/appointment.entity';
import {
  addMinutes,
  isWithinInterval,
  eachMinuteOfInterval,
} from 'date-fns';

const SLOT_DURATION_MINUTES = 30;

@Injectable()
export class CalendarService {
  constructor(
    @InjectRepository(Availability)
    private availabilityRepository: Repository<Availability>,
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
  ) {}

  async getInstructorAvailability(instructorId: number): Promise<any> {
    const availabilities = await this.availabilityRepository.find({
      where: { instructorId },
    });
    const appointments = await this.appointmentRepository.find({
      where: { instructorId },
    });

    const availableSlots: { startTime: Date; endTime: Date }[] = [];

    availabilities.forEach((availability) => {
      const potentialSlots = eachMinuteOfInterval(
        {
          start: new Date(availability.startTime),
          end: new Date(availability.endTime),
        },
        { step: SLOT_DURATION_MINUTES },
      );

      potentialSlots.forEach((slotStartTime) => {
        const slotEndTime = addMinutes(slotStartTime, SLOT_DURATION_MINUTES);

        if (slotEndTime > new Date(availability.endTime)) {
          return;
        }

        const isBooked = appointments.some((appointment) => {
          const appointmentStartTime = new Date(appointment.startTime);
          const appointmentEndTime = new Date(appointment.endTime);
          return (
            isWithinInterval(slotStartTime, {
              start: appointmentStartTime,
              end: appointmentEndTime,
            }) ||
            isWithinInterval(slotEndTime, {
              start: appointmentStartTime,
              end: appointmentEndTime,
            })
          );
        });

        if (!isBooked) {
          availableSlots.push({
            startTime: slotStartTime,
            endTime: slotEndTime,
          });
        }
      });
    });

    return availableSlots;
  }
}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Availability } from './availability.entity';
import { CalendarService } from './calendar.service';
import { CalendarController } from './calendar.controller';
import { Appointment } from '../appointment/appointment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Availability, Appointment])],
  providers: [CalendarService],
  controllers: [CalendarController],
})
export class CalendarModule {}

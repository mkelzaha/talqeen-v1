import { IsInt, IsDateString } from 'class-validator';

export class CreateAppointmentDto {
  @IsInt()
  studentId: number;

  @IsInt()
  instructorId: number;

  @IsInt()
  serviceId: number;

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;
}

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../user/user.entity';

@Controller('appointment')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Post()
  @Roles(UserRole.STUDENT)
  create(@Body() createAppointmentDto: CreateAppointmentDto, @Request() req) {
    // Make sure the student can only book for themselves
    return this.appointmentService.create({
      ...createAppointmentDto,
      studentId: req.user.id,
    });
  }

  @Get()
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.appointmentService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    const appointment = await this.appointmentService.findOne(+id);
    const user = req.user;

    if (
      user.role !== UserRole.ADMIN &&
      appointment.studentId !== user.id &&
      appointment.instructorId !== user.id
    ) {
      throw new UnauthorizedException();
    }
    return appointment;
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    const appointment = await this.appointmentService.findOne(+id);
    const user = req.user;

    if (
      user.role !== UserRole.ADMIN &&
      appointment.studentId !== user.id &&
      appointment.instructorId !== user.id
    ) {
      throw new UnauthorizedException();
    }
    return this.appointmentService.remove(+id);
  }
}

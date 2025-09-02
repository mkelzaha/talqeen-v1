import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('calendar')
@UseGuards(JwtAuthGuard)
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Get('instructor/:id/availability')
  getInstructorAvailability(@Param('id') id: string) {
    return this.calendarService.getInstructorAvailability(+id);
  }
}

import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../user/user.entity';
import { RolesGuard } from '../common/guards/roles.guard';

@Controller('profile')
export class ProfileController {
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get()
  getProfile(@Request() req) {
    return req.user;
  }
}

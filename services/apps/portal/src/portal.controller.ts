import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from './common/authorization/auth-guard.service';
import { PortalService } from './portal.service';

@Controller()
@UseGuards(AuthGuard)
export class PortalController {
  constructor(private readonly portalService: PortalService) {}

  @Get('/token')
  checkTokenValid() {
    return 'Token Valid';
  }
}

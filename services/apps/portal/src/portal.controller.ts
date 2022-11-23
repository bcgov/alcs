import { Controller, Get, UseGuards } from '@nestjs/common';
import { RoleGuard } from 'nest-keycloak-connect';
import { PortalService } from './portal.service';

@Controller()
export class PortalController {
  constructor(private readonly portalService: PortalService) {}

  @Get('/token')
  @UseGuards(RoleGuard)
  checkTokenValid() {
    return 'Token Valid';
  }
}

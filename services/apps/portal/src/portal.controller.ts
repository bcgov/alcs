import { Controller, Get } from '@nestjs/common';
import { PortalService } from './portal.service';

@Controller()
export class PortalController {
  constructor(private readonly portalService: PortalService) {}

  @Get()
  getHello(): string {
    return this.portalService.getHello();
  }
}

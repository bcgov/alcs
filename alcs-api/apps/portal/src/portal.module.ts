import { Module } from '@nestjs/common';
import { PortalController } from './portal.controller';
import { PortalService } from './portal.service';

@Module({
  imports: [],
  controllers: [PortalController],
  providers: [PortalService],
})
export class PortalModule {}

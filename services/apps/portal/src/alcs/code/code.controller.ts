import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApplicationTypeService } from '../application-type/application-type.service';
import { AuthGuard } from '../../common/authorization/auth-guard.service';
import { LocalGovernmentService } from '../local-government/local-government.service';

@Controller('code')
@UseGuards(AuthGuard)
export class CodeController {
  constructor(
    private localGovernmentService: LocalGovernmentService,
    private applicationTypeService: ApplicationTypeService,
  ) {}

  @Get()
  async loadCodes() {
    const localGovernments = await this.localGovernmentService.get();
    const applicationTypes = await this.applicationTypeService.list();
    return {
      localGovernments,
      applicationTypes,
    };
  }
}

import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../common/authorization/auth-guard.service';
import { LocalGovernmentService } from '../local-government/local-government.service';

@Controller('code')
@UseGuards(AuthGuard)
export class CodeController {
  constructor(private localGovernmentService: LocalGovernmentService) {}

  @Get()
  async loadCodes() {
    const localGovernments = await this.localGovernmentService.get();
    return {
      localGovernments,
    };
  }
}

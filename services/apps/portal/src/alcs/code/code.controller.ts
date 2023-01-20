import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../common/authorization/auth-guard.service';
import { ApplicationTypeService } from '../application-type/application-type.service';
import {
  LocalGovernment,
  LocalGovernmentService,
} from '../local-government/local-government.service';
import { SubmissionTypeService } from '../submission-type/submission-type.service';

export interface LocalGovernmentDto {
  uuid: string;
  name: string;
  hasGuid: boolean;
}

@Controller('code')
@UseGuards(AuthGuard)
export class CodeController {
  constructor(
    private localGovernmentService: LocalGovernmentService,
    private applicationTypeService: ApplicationTypeService,
    private submissionTypeService: SubmissionTypeService,
  ) {}

  @Get()
  async loadCodes() {
    const localGovernments = await this.localGovernmentService.get();
    const applicationTypes = await this.applicationTypeService.list();
    const submissionTypes = await this.submissionTypeService.list();
    return {
      localGovernments: this.mapLocalGovernments(localGovernments),
      applicationTypes,
      submissionTypes,
    };
  }

  private mapLocalGovernments(
    governments: LocalGovernment[],
  ): LocalGovernmentDto[] {
    return governments.map((government) => ({
      name: government.name,
      uuid: government.uuid,
      hasGuid: government.bceidBusinessGuid !== null,
    }));
  }
}

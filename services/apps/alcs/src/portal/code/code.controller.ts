import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApplicationLocalGovernment } from '../../alcs/application/application-code/application-local-government/application-local-government.entity';
import { ApplicationLocalGovernmentService } from '../../alcs/application/application-code/application-local-government/application-local-government.service';
import { ApplicationService } from '../../alcs/application/application.service';
import { CardService } from '../../alcs/card/card.service';
import { PortalAuthGuard } from '../../common/authorization/portal-auth-guard.service';

export interface LocalGovernmentDto {
  uuid: string;
  name: string;
  hasGuid: boolean;
}

@Controller('/portal/code')
@UseGuards(PortalAuthGuard)
export class CodeController {
  constructor(
    private localGovernmentService: ApplicationLocalGovernmentService,
    private applicationService: ApplicationService,
    private cardService: CardService,
  ) {}

  @Get()
  async loadCodes() {
    const localGovernments = await this.localGovernmentService.list();
    const applicationTypes =
      await this.applicationService.fetchApplicationTypes();
    const submissionTypes = await this.cardService.getCardTypes(); //Card Types?
    return {
      localGovernments: this.mapLocalGovernments(localGovernments),
      applicationTypes,
      submissionTypes,
    };
  }

  private mapLocalGovernments(
    governments: ApplicationLocalGovernment[],
  ): LocalGovernmentDto[] {
    return governments.map((government) => ({
      name: government.name,
      uuid: government.uuid,
      hasGuid: government.bceidBusinessGuid !== null,
    }));
  }
}

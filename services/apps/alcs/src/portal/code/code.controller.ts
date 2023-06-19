import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApplicationLocalGovernment } from '../../alcs/application/application-code/application-local-government/application-local-government.entity';
import { ApplicationLocalGovernmentService } from '../../alcs/application/application-code/application-local-government/application-local-government.service';
import { ApplicationDocumentCode } from '../../alcs/application/application-document/application-document-code.entity';
import { ApplicationDocumentTypeDto } from '../../alcs/application/application-document/application-document.dto';
import { ApplicationDocumentService } from '../../alcs/application/application-document/application-document.service';
import { ApplicationService } from '../../alcs/application/application.service';
import { CardService } from '../../alcs/card/card.service';
import { PortalAuthGuard } from '../../common/authorization/portal-auth-guard.service';
import { ApplicationSubmissionService } from '../application-submission/application-submission.service';

export interface LocalGovernmentDto {
  uuid: string;
  name: string;
  hasGuid: boolean;
}

@Controller('/portal/code')
@UseGuards(PortalAuthGuard)
export class CodeController {
  constructor(
    @InjectMapper() private mapper: Mapper,
    private localGovernmentService: ApplicationLocalGovernmentService,
    private applicationService: ApplicationService,
    private applicationDocumentService: ApplicationDocumentService,
    private cardService: CardService,
    private applicationSubmissionService: ApplicationSubmissionService,
  ) {}

  @Get()
  async loadCodes() {
    const localGovernments = await this.localGovernmentService.listActive();
    const applicationTypes =
      await this.applicationService.fetchApplicationTypes();
    const applicationDocumentTypes =
      await this.applicationDocumentService.fetchTypes();
    const submissionTypes = await this.cardService.getCardTypes();
    const naruSubtypes =
      await this.applicationSubmissionService.listNaruSubtypes();

    const mappedDocTypes = applicationDocumentTypes.map((docType) => {
      if (docType.portalLabel) {
        docType.label = docType.portalLabel;
      }
      return this.mapper.map(
        docType,
        ApplicationDocumentCode,
        ApplicationDocumentTypeDto,
      );
    });
    return {
      localGovernments: this.mapLocalGovernments(localGovernments),
      applicationTypes,
      submissionTypes,
      applicationDocumentTypes: mappedDocTypes,
      naruSubtypes,
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

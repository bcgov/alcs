import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { LocalGovernment } from '../../alcs/local-government/local-government.entity';
import { LocalGovernmentService } from '../../alcs/local-government/local-government.service';
import { NoticeOfIntentService } from '../../alcs/notice-of-intent/notice-of-intent.service';
import { DocumentCode } from '../../document/document-code.entity';
import { ApplicationDocumentService } from '../../alcs/application/application-document/application-document.service';
import { ApplicationService } from '../../alcs/application/application.service';
import { CardService } from '../../alcs/card/card.service';
import { PortalAuthGuard } from '../../common/authorization/portal-auth-guard.service';
import { DocumentTypeDto } from '../../document/document.dto';
import { User } from '../../user/user.entity';
import { ApplicationSubmissionService } from '../application-submission/application-submission.service';
import { NoticeOfIntentSubmissionService } from '../notice-of-intent-submission/notice-of-intent-submission.service';

export interface LocalGovernmentDto {
  uuid: string;
  name: string;
  hasGuid: boolean;
  matchesUserGuid: boolean;
}

@Controller('/portal/code')
@UseGuards(PortalAuthGuard)
export class CodeController {
  constructor(
    @InjectMapper() private mapper: Mapper,
    private localGovernmentService: LocalGovernmentService,
    private applicationService: ApplicationService,
    private applicationDocumentService: ApplicationDocumentService,
    private cardService: CardService,
    private applicationSubmissionService: ApplicationSubmissionService,
    private noticeOfIntentService: NoticeOfIntentService,
  ) {}

  @Get()
  async loadCodes(@Req() req) {
    const localGovernments = await this.localGovernmentService.listActive();
    const applicationTypes =
      await this.applicationService.fetchApplicationTypes();
    const applicationDocumentTypes =
      await this.applicationDocumentService.fetchTypes();
    const submissionTypes = await this.cardService.getPortalCardTypes();
    const noticeOfIntentTypes = await this.noticeOfIntentService.listTypes();
    const naruSubtypes =
      await this.applicationSubmissionService.listNaruSubtypes();

    const mappedDocTypes = applicationDocumentTypes.map((docType) => {
      if (docType.portalLabel) {
        docType.label = docType.portalLabel;
      }
      return this.mapper.map(docType, DocumentCode, DocumentTypeDto);
    });
    return {
      localGovernments: this.mapLocalGovernments(
        localGovernments,
        req.user.entity,
      ),
      applicationTypes,
      noticeOfIntentTypes,
      submissionTypes,
      applicationDocumentTypes: mappedDocTypes,
      naruSubtypes,
    };
  }

  private mapLocalGovernments(
    governments: LocalGovernment[],
    user: User,
  ): LocalGovernmentDto[] {
    return governments.map((government) => ({
      name: government.name,
      uuid: government.uuid,
      hasGuid: government.bceidBusinessGuid !== null,
      matchesUserGuid:
        !!government.bceidBusinessGuid &&
        government.bceidBusinessGuid === user.bceidBusinessGuid,
    }));
  }
}

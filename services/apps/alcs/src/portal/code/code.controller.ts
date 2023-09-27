import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Public } from 'nest-keycloak-connect';
import { ApplicationDecisionMakerCode } from '../../alcs/application-decision/application-decision-maker/application-decision-maker.entity';
import { ApplicationDecisionMakerCodeDto } from '../../alcs/application-decision/application-decision-maker/decision-maker.dto';
import { ApplicationSubmissionStatusService } from '../../alcs/application/application-submission-status/application-submission-status.service';
import { ApplicationRegionDto } from '../../alcs/code/application-code/application-region/application-region.dto';
import { ApplicationRegion } from '../../alcs/code/application-code/application-region/application-region.entity';
import { CodeService } from '../../alcs/code/code.service';
import { LocalGovernment } from '../../alcs/local-government/local-government.entity';
import { LocalGovernmentService } from '../../alcs/local-government/local-government.service';
import { NoticeOfIntentService } from '../../alcs/notice-of-intent/notice-of-intent.service';
import { DocumentCode } from '../../document/document-code.entity';
import { ApplicationDocumentService } from '../../alcs/application/application-document/application-document.service';
import { ApplicationService } from '../../alcs/application/application.service';
import { CardService } from '../../alcs/card/card.service';
import { DocumentTypeDto } from '../../document/document.dto';
import { User } from '../../user/user.entity';
import { ApplicationSubmissionService } from '../application-submission/application-submission.service';

export interface LocalGovernmentDto {
  uuid: string;
  name: string;
  hasGuid: boolean;
  matchesUserGuid?: boolean;
}

@Public()
@Controller('/portal/code')
export class CodeController {
  constructor(
    @InjectMapper() private mapper: Mapper,
    private localGovernmentService: LocalGovernmentService,
    private applicationService: ApplicationService,
    private applicationDocumentService: ApplicationDocumentService,
    private cardService: CardService,
    private applicationSubmissionService: ApplicationSubmissionService,
    private noticeOfIntentService: NoticeOfIntentService,
    private codeService: CodeService,
  ) {}

  @Get()
  async loadCodes(@Req() req) {
    const localGovernments = await this.localGovernmentService.listActive();
    const applicationTypes =
      await this.applicationService.fetchApplicationTypes();
    const documentTypes = await this.applicationDocumentService.fetchTypes();
    const submissionTypes = await this.cardService.getPortalCardTypes();
    const noticeOfIntentTypes = await this.noticeOfIntentService.listTypes();
    const naruSubtypes =
      await this.applicationSubmissionService.listNaruSubtypes();
    const codes = await this.codeService.getAll();

    const mappedDocTypes = documentTypes.map((docType) => {
      if (docType.portalLabel) {
        docType.label = docType.portalLabel;
      }
      return this.mapper.map(docType, DocumentCode, DocumentTypeDto);
    });

    const mappedRegions = this.mapper.mapArray(
      codes.region,
      ApplicationRegion,
      ApplicationRegionDto,
    );

    const mappedDecisionMakers = this.mapper.mapArray(
      codes.decisionMakers,
      ApplicationDecisionMakerCode,
      ApplicationDecisionMakerCodeDto,
    );

    return {
      localGovernments: this.mapLocalGovernments(
        localGovernments,
        req.user?.entity,
      ),
      applicationTypes,
      noticeOfIntentTypes,
      submissionTypes,
      documentTypes: mappedDocTypes,
      naruSubtypes,
      regions: mappedRegions,
      decisionMakers: mappedDecisionMakers,
    };
  }

  private mapLocalGovernments(
    governments: LocalGovernment[],
    user?: User,
  ): LocalGovernmentDto[] {
    return governments.map((government) => ({
      name: government.name,
      uuid: government.uuid,
      hasGuid: government.bceidBusinessGuid !== null,
      matchesUserGuid:
        user &&
        !!government.bceidBusinessGuid &&
        government.bceidBusinessGuid === user.bceidBusinessGuid,
    }));
  }
}

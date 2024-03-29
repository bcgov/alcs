import { Mapper } from 'automapper-core';
import { InjectMapper } from 'automapper-nestjs';
import { Controller, Get, Req } from '@nestjs/common';
import { Public } from 'nest-keycloak-connect';
import { ApplicationDecisionMakerCode } from '../../alcs/application-decision/application-decision-maker/application-decision-maker.entity';
import { ApplicationDecisionMakerCodeDto } from '../../alcs/application-decision/application-decision-maker/decision-maker.dto';
import { ApplicationDocumentService } from '../../alcs/application/application-document/application-document.service';
import { ApplicationService } from '../../alcs/application/application.service';
import { CardService } from '../../alcs/card/card.service';
import { ApplicationRegionDto } from '../../alcs/code/application-code/application-region/application-region.dto';
import { ApplicationRegion } from '../../alcs/code/application-code/application-region/application-region.entity';
import { CodeService } from '../../alcs/code/code.service';
import { LocalGovernment } from '../../alcs/local-government/local-government.entity';
import { LocalGovernmentService } from '../../alcs/local-government/local-government.service';
import { NoticeOfIntentService } from '../../alcs/notice-of-intent/notice-of-intent.service';
import { AuthorizationService } from '../../common/authorization/authorization.service';
import { DocumentCode } from '../../document/document-code.entity';
import { DocumentTypeDto } from '../../document/document.dto';
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
    private authorizationService: AuthorizationService,
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
      localGovernments: await this.mapLocalGovernments(localGovernments, req),
      applicationTypes,
      noticeOfIntentTypes,
      submissionTypes,
      documentTypes: mappedDocTypes,
      naruSubtypes,
      regions: mappedRegions,
      decisionMakers: mappedDecisionMakers,
    };
  }

  private async mapLocalGovernments(
    governments: LocalGovernment[],
    req: any,
  ): Promise<LocalGovernmentDto[]> {
    //No auth guard, so we can't use req.user.entity
    const tokenHeader = req.headers['authorization'] as string | undefined;

    let bceidGuid;
    if (tokenHeader) {
      const token =
        await this.authorizationService.decodeHeaderToken(tokenHeader);
      bceidGuid = token ? token['bceid_business_guid'] : false;
    }

    return governments.map((government) => ({
      name: government.name,
      uuid: government.uuid,
      hasGuid: government.bceidBusinessGuid !== null,
      matchesUserGuid:
        !!bceidGuid &&
        !!government.bceidBusinessGuid &&
        government.bceidBusinessGuid === bceidGuid,
    }));
  }
}

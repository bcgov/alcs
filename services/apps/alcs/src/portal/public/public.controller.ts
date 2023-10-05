import { ServiceNotFoundException } from '@app/common/exceptions/base.exception';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Controller, Get, Param } from '@nestjs/common';
import { Public } from 'nest-keycloak-connect';
import { ApplicationDecisionV2Service } from '../../alcs/application-decision/application-decision-v2/application-decision/application-decision-v2.service';
import { ApplicationDecision } from '../../alcs/application-decision/application-decision.entity';
import { ApplicationDocumentDto } from '../../alcs/application/application-document/application-document.dto';
import {
  ApplicationDocument,
  VISIBILITY_FLAG,
} from '../../alcs/application/application-document/application-document.entity';
import { ApplicationDocumentService } from '../../alcs/application/application-document/application-document.service';
import { ApplicationService } from '../../alcs/application/application.service';
import { ApplicationPortalDecisionDto } from '../application-decision/application-decision.dto';
import { ApplicationSubmissionReviewDto } from '../application-submission-review/application-submission-review.dto';
import { ApplicationSubmissionReview } from '../application-submission-review/application-submission-review.entity';
import { ApplicationSubmissionReviewService } from '../application-submission-review/application-submission-review.service';
import { ApplicationParcelDto } from '../application-submission/application-parcel/application-parcel.dto';
import { ApplicationParcel } from '../application-submission/application-parcel/application-parcel.entity';
import { ApplicationParcelService } from '../application-submission/application-parcel/application-parcel.service';
import { ApplicationSubmission } from '../application-submission/application-submission.entity';
import { ApplicationSubmissionService } from '../application-submission/application-submission.service';
import {
  PublicApplicationParcelDto,
  PublicApplicationSubmissionDto,
  PublicApplicationSubmissionReviewDto,
  PublicDocumentDto,
} from './public.dto';

@Public()
@Controller('/public')
export class PublicController {
  constructor(
    @InjectMapper() private mapper: Mapper,
    private applicationService: ApplicationService,
    private applicationSubmissionService: ApplicationSubmissionService,
    private applicationParcelService: ApplicationParcelService,
    private applicationDocumentService: ApplicationDocumentService,
    private applicationSubmissionReviewService: ApplicationSubmissionReviewService,
    private applicationDecisionService: ApplicationDecisionV2Service,
  ) {}

  @Get('/application/:fileId')
  async getApplication(@Param('fileId') fileNumber: string) {
    const application = await this.applicationService.get(fileNumber);
    if (!application?.dateReceivedAllItems) {
      throw new ServiceNotFoundException(
        `Failed to find application with File ID ${fileNumber}`,
      );
    }

    const submission =
      await this.applicationSubmissionService.getOrFailByFileNumber(fileNumber);

    const parcels =
      await this.applicationParcelService.fetchByApplicationFileId(fileNumber);

    const mappedParcels = this.mapper.mapArray(
      parcels,
      ApplicationParcel,
      PublicApplicationParcelDto,
    );

    const mappedSubmission = this.mapper.map(
      submission,
      ApplicationSubmission,
      PublicApplicationSubmissionDto,
    );

    const documents = await this.applicationDocumentService.list(fileNumber, [
      VISIBILITY_FLAG.PUBLIC,
    ]);

    const mappedDocuments = this.mapper.mapArray(
      documents,
      ApplicationDocument,
      PublicDocumentDto,
    );

    const review =
      await this.applicationSubmissionReviewService.getForPublicReview(
        fileNumber,
      );

    let mappedReview;
    if (review) {
      mappedReview = this.mapper.map(
        review,
        ApplicationSubmissionReview,
        PublicApplicationSubmissionReviewDto,
      );
    }

    const decisions = await this.applicationDecisionService.getByAppFileNumber(
      fileNumber,
    );
    const mappedDecisions = this.mapper.mapArray(
      decisions,
      ApplicationDecision,
      ApplicationPortalDecisionDto,
    );

    return {
      submission: mappedSubmission,
      parcels: mappedParcels,
      documents: mappedDocuments,
      review: mappedReview,
      decisions: mappedDecisions,
    };
  }

  @Get('/application/:fileId/:uuid/download')
  async getApplicationDocumentDownload(
    @Param('fileId') fileId: string,
    @Param('uuid') documentUuid: string,
  ) {
    const document = await this.applicationDocumentService.get(documentUuid);

    if (!document.visibilityFlags.includes(VISIBILITY_FLAG.PUBLIC)) {
      throw new ServiceNotFoundException('Failed to find document');
    }

    const url = await this.applicationDocumentService.getDownloadUrl(document);

    return {
      url,
    };
  }

  @Get('/application/:fileId/:uuid/open')
  async getApplicationDocumentOpen(
    @Param('fileId') fileId: string,
    @Param('uuid') documentUuid: string,
  ) {
    const document = await this.applicationDocumentService.get(documentUuid);

    if (!document.visibilityFlags.includes(VISIBILITY_FLAG.PUBLIC)) {
      throw new ServiceNotFoundException('Failed to find document');
    }

    const url = await this.applicationDocumentService.getInlineUrl(document);

    return {
      url,
    };
  }
}

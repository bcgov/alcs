import { ServiceNotFoundException } from '@app/common/exceptions/base.exception';
import { Mapper } from 'automapper-core';
import { InjectMapper } from 'automapper-nestjs';
import { Injectable } from '@nestjs/common';
import { ApplicationDecisionV2Service } from '../../../alcs/application-decision/application-decision-v2/application-decision/application-decision-v2.service';
import { ApplicationDecision } from '../../../alcs/application-decision/application-decision.entity';
import {
  ApplicationDocument,
  VISIBILITY_FLAG,
} from '../../../alcs/application/application-document/application-document.entity';
import { ApplicationDocumentService } from '../../../alcs/application/application-document/application-document.service';
import { ApplicationService } from '../../../alcs/application/application.service';
import { ApplicationSubmissionReview } from '../../application-submission-review/application-submission-review.entity';
import { ApplicationSubmissionReviewService } from '../../application-submission-review/application-submission-review.service';
import { ApplicationParcel } from '../../application-submission/application-parcel/application-parcel.entity';
import { ApplicationParcelService } from '../../application-submission/application-parcel/application-parcel.service';
import { ApplicationSubmission } from '../../application-submission/application-submission.entity';
import { ApplicationSubmissionService } from '../../application-submission/application-submission.service';
import { CovenantTransferee } from '../../application-submission/covenant-transferee/covenant-transferee.entity';
import { CovenantTransfereeService } from '../../application-submission/covenant-transferee/covenant-transferee.service';
import { APPLICATION_SUBMISSION_TYPES } from '../../pdf-generation/generate-submission-document.service';
import {
  PublicDocumentDto,
  PublicOwnerDto,
  PublicParcelDto,
} from '../public.dto';
import { ApplicationPortalDecisionDto } from './application-decision.dto';
import {
  PublicApplicationSubmissionDto,
  PublicApplicationSubmissionReviewDto,
} from './public-application.dto';

@Injectable()
export class PublicApplicationService {
  constructor(
    private applicationService: ApplicationService,
    private applicationSubmissionService: ApplicationSubmissionService,
    private applicationParcelService: ApplicationParcelService,
    private applicationDocumentService: ApplicationDocumentService,
    private applicationSubmissionReviewService: ApplicationSubmissionReviewService,
    private applicationDecisionService: ApplicationDecisionV2Service,
    private covenantTransfereeService: CovenantTransfereeService,
    @InjectMapper() private mapper: Mapper,
  ) {}

  async getPublicData(fileNumber: string) {
    const application = await this.applicationService.get(fileNumber);

    //Easy way to check if its public
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
      PublicParcelDto,
    );

    const mappedSubmission = this.mapper.map(
      submission,
      ApplicationSubmission,
      PublicApplicationSubmissionDto,
    );
    mappedSubmission.type = application.type.label;

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

    const decisions =
      await this.applicationDecisionService.getForPortal(fileNumber);
    const mappedDecisions = this.mapper.mapArray(
      decisions,
      ApplicationDecision,
      ApplicationPortalDecisionDto,
    );

    let transferees: CovenantTransferee[] = [];
    if (application.typeCode === APPLICATION_SUBMISSION_TYPES.COVE) {
      transferees = await this.covenantTransfereeService.fetchBySubmissionUuid(
        submission.uuid,
      );
    }
    const mappedTransferees = this.mapper.mapArray(
      transferees,
      CovenantTransferee,
      PublicOwnerDto,
    );

    return {
      submission: mappedSubmission,
      parcels: mappedParcels,
      documents: mappedDocuments,
      review: mappedReview,
      decisions: mappedDecisions,
      transferees: mappedTransferees,
    };
  }

  async getDownloadUrl(documentUuid: string) {
    const document = await this.applicationDocumentService.get(documentUuid);

    if (!document.visibilityFlags.includes(VISIBILITY_FLAG.PUBLIC)) {
      throw new ServiceNotFoundException('Failed to find document');
    }

    const url = await this.applicationDocumentService.getDownloadUrl(document);

    return {
      url,
    };
  }

  async getInlineUrl(documentUuid: string) {
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

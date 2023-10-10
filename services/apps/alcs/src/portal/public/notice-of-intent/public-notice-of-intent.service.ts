import { ServiceNotFoundException } from '@app/common/exceptions/base.exception';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { VISIBILITY_FLAG } from '../../../alcs/application/application-document/application-document.entity';
import { NoticeOfIntentDecisionV2Service } from '../../../alcs/notice-of-intent-decision/notice-of-intent-decision-v2/notice-of-intent-decision-v2.service';
import { NoticeOfIntentDecision } from '../../../alcs/notice-of-intent-decision/notice-of-intent-decision.entity';
import { NoticeOfIntentDocument } from '../../../alcs/notice-of-intent/notice-of-intent-document/notice-of-intent-document.entity';
import { NoticeOfIntentDocumentService } from '../../../alcs/notice-of-intent/notice-of-intent-document/notice-of-intent-document.service';
import { NoticeOfIntentService } from '../../../alcs/notice-of-intent/notice-of-intent.service';
import { NoticeOfIntentPortalDecisionDto } from './notice-of-intent-decision.dto';
import { NoticeOfIntentParcel } from '../../notice-of-intent-submission/notice-of-intent-parcel/notice-of-intent-parcel.entity';
import { NoticeOfIntentParcelService } from '../../notice-of-intent-submission/notice-of-intent-parcel/notice-of-intent-parcel.service';
import { NoticeOfIntentSubmission } from '../../notice-of-intent-submission/notice-of-intent-submission.entity';
import { NoticeOfIntentSubmissionService } from '../../notice-of-intent-submission/notice-of-intent-submission.service';
import {
  PublicDocumentDto,
  PublicParcelDto,
} from '../application/public-application.dto';
import { PublicNoticeOfIntentSubmissionDto } from './public-notice-of-intent.dto';

@Injectable()
export class PublicNoticeOfIntentService {
  constructor(
    private noticeOfIntentService: NoticeOfIntentService,
    private noticeOfIntentSubmissionService: NoticeOfIntentSubmissionService,
    private noticeOfIntentParcelService: NoticeOfIntentParcelService,
    private noticeOfIntentDocumentService: NoticeOfIntentDocumentService,
    private noticeOfIntentDecisionV2Service: NoticeOfIntentDecisionV2Service,
    @InjectMapper() private mapper: Mapper,
  ) {}

  async getPublicData(fileNumber: string) {
    const noticeOfIntent = await this.noticeOfIntentService.getByFileNumber(
      fileNumber,
    );

    //Easy way to check if its public
    if (!noticeOfIntent?.dateReceivedAllItems) {
      throw new ServiceNotFoundException(
        `Failed to find application with File ID ${fileNumber}`,
      );
    }

    const submission =
      await this.noticeOfIntentSubmissionService.getOrFailByFileNumber(
        fileNumber,
      );

    const parcels = await this.noticeOfIntentParcelService.fetchByFileId(
      fileNumber,
    );

    const mappedParcels = this.mapper.mapArray(
      parcels,
      NoticeOfIntentParcel,
      PublicParcelDto,
    );

    const mappedSubmission = this.mapper.map(
      submission,
      NoticeOfIntentSubmission,
      PublicNoticeOfIntentSubmissionDto,
    );
    mappedSubmission.type = noticeOfIntent.type.label;

    const documents = await this.noticeOfIntentDocumentService.list(
      fileNumber,
      [VISIBILITY_FLAG.PUBLIC],
    );

    const mappedDocuments = this.mapper.mapArray(
      documents,
      NoticeOfIntentDocument,
      PublicDocumentDto,
    );

    const decisions = await this.noticeOfIntentDecisionV2Service.getForPortal(
      fileNumber,
    );
    const mappedDecisions = this.mapper.mapArray(
      decisions,
      NoticeOfIntentDecision,
      NoticeOfIntentPortalDecisionDto,
    );

    return {
      submission: mappedSubmission,
      parcels: mappedParcels,
      documents: mappedDocuments,
      decisions: mappedDecisions,
    };
  }

  async getDownloadUrl(documentUuid: string) {
    const document = await this.noticeOfIntentDocumentService.get(documentUuid);

    if (!document.visibilityFlags.includes(VISIBILITY_FLAG.PUBLIC)) {
      throw new ServiceNotFoundException('Failed to find document');
    }

    const url = await this.noticeOfIntentDocumentService.getDownloadUrl(
      document,
    );

    return {
      url,
    };
  }

  async getInlineUrl(documentUuid: string) {
    const document = await this.noticeOfIntentDocumentService.get(documentUuid);

    if (!document.visibilityFlags.includes(VISIBILITY_FLAG.PUBLIC)) {
      throw new ServiceNotFoundException('Failed to find document');
    }

    const url = await this.noticeOfIntentDocumentService.getInlineUrl(document);

    return {
      url,
    };
  }
}

import { CdogsService } from '@app/common/cdogs/cdogs.service';
import { Mapper } from 'automapper-core';
import { InjectMapper } from 'automapper-nestjs';
import { forwardRef, HttpStatus, Inject, Injectable } from '@nestjs/common';
import * as config from 'config';
import * as dayjs from 'dayjs';
import * as timezone from 'dayjs/plugin/timezone';
import * as utc from 'dayjs/plugin/utc';
import { LocalGovernmentService } from '../../alcs/local-government/local-government.service';
import { DOCUMENT_TYPE } from '../../document/document-code.entity';
import {
  ApplicationDocument,
  VISIBILITY_FLAG,
} from '../../alcs/application/application-document/application-document.entity';
import { ApplicationDocumentService } from '../../alcs/application/application-document/application-document.service';
import { ApplicationService } from '../../alcs/application/application.service';
import { DOCUMENT_SOURCE, DOCUMENT_SYSTEM } from '../../document/document.dto';
import { User } from '../../user/user.entity';
import { formatBooleanToYesNoString } from '../../utils/boolean-formatter';
import { ApplicationSubmissionReviewDto } from '../application-submission-review/application-submission-review.dto';
import { ApplicationSubmissionReview } from '../application-submission-review/application-submission-review.entity';
import { ApplicationSubmissionReviewService } from '../application-submission-review/application-submission-review.service';
import { ApplicationSubmission } from '../application-submission/application-submission.entity';
import { ApplicationSubmissionService } from '../application-submission/application-submission.service';

const LG_TEMPLATE_FILENAME = 'submission-lg-review-template.docx';
const FNG_TEMPLATE_FILENAME = 'submission-fng-review-template.docx';
const NOT_SUBJECT_TO_AUTHORIZATION = 'Not Subject to Authorization';
const NO_DATA = 'No Data';

dayjs.extend(utc);
dayjs.extend(timezone);

@Injectable()
export class GenerateReviewDocumentService {
  constructor(
    private documentGenerationService: CdogsService,
    @Inject(forwardRef(() => ApplicationSubmissionService))
    private applicationSubmissionService: ApplicationSubmissionService,
    private applicationDocumentService: ApplicationDocumentService,
    @Inject(forwardRef(() => ApplicationSubmissionReviewService))
    private applicationSubmissionReviewService: ApplicationSubmissionReviewService,
    private applicationService: ApplicationService,
    private localGovernmentService: LocalGovernmentService,
    @InjectMapper() private mapper: Mapper,
  ) {}

  async generate(fileNumber: string, user: User) {
    const submission =
      await this.applicationSubmissionService.verifyAccessByFileId(
        fileNumber,
        user,
      );

    const review =
      await this.applicationSubmissionReviewService.getByFileNumber(fileNumber);
    const documents = await this.applicationDocumentService.list(fileNumber);

    const payload = await this.preparePdfPayload(submission, review, documents);

    const template = payload.isFirstNationGovernment
      ? FNG_TEMPLATE_FILENAME
      : LG_TEMPLATE_FILENAME;

    return await this.documentGenerationService.generateDocument(
      `${fileNumber}_submission_Date_Time`,
      `${config.get<string>('CDOGS.TEMPLATE_FOLDER')}/${template}`,
      payload,
    );
  }

  async generateAndAttach(fileNumber: string, user: User) {
    const reviewRes = await this.generate(fileNumber, user);

    if (reviewRes.status === HttpStatus.OK) {
      await this.applicationDocumentService.attachDocumentAsBuffer({
        fileNumber: fileNumber,
        fileName: `${fileNumber}_LFNG_Review.pdf`,
        user: user,
        file: reviewRes.data,
        mimeType: 'application/pdf',
        fileSize: reviewRes.data.length,
        documentType: DOCUMENT_TYPE.ORIGINAL_SUBMISSION,
        source: DOCUMENT_SOURCE.LFNG,
        system: DOCUMENT_SYSTEM.PORTAL,
        visibilityFlags: [
          VISIBILITY_FLAG.APPLICANT,
          VISIBILITY_FLAG.COMMISSIONER,
          VISIBILITY_FLAG.GOVERNMENT,
        ],
      });
    }
  }

  private async preparePdfPayload(
    submission: ApplicationSubmission,
    review: ApplicationSubmissionReview,
    documents: ApplicationDocument[],
  ) {
    const dto = this.mapper.map(
      review,
      ApplicationSubmissionReview,
      ApplicationSubmissionReviewDto,
    );

    const application = await this.applicationService.getOrFail(
      submission.fileNumber,
    );

    const localGovernment = submission?.localGovernmentUuid
      ? await this.localGovernmentService.getByUuid(
          submission.localGovernmentUuid,
        )
      : undefined;
    dto.isFirstNationGovernment = localGovernment
      ? localGovernment.isFirstNation
      : false;

    const attachments = documents
      .filter((document) => document.document.source === DOCUMENT_SOURCE.LFNG)
      .filter((document) => document.type?.code === DOCUMENT_TYPE.OTHER);

    const resolutionDocument = documents.find(
      (document) => document.type?.code === DOCUMENT_TYPE.RESOLUTION_DOCUMENT,
    );
    if (resolutionDocument) {
      attachments.push(resolutionDocument);
    }

    const staffReports = documents.filter((document) => document.type?.code === DOCUMENT_TYPE.STAFF_REPORT);
    if (staffReports.length > 0) {
      attachments.push(...staffReports);
    }

    const isAuthorized = this.setAuthorization(dto);

    return {
      ...dto,
      generatedDateTime: dayjs
        .tz(new Date(), 'Canada/Pacific')
        .format('MMM DD, YYYY hh:mm:ss Z'),
      isOCPDesignation: formatBooleanToYesNoString(dto.isOCPDesignation),
      OCPConsistent: formatBooleanToYesNoString(dto.OCPConsistent),
      isSubjectToZoning: formatBooleanToYesNoString(dto.isSubjectToZoning),
      isZoningConsistent: formatBooleanToYesNoString(dto.isZoningConsistent),
      isAuthorized: isAuthorized,
      fileNumber: submission.fileNumber,
      status: submission.status.statusType,
      applicationTypePortalLabel: application.type.portalLabel,
      applicant: submission.applicant,
      localGovernment: localGovernment ? localGovernment.name : NO_DATA,
      isFirstNationGovernment: localGovernment?.isFirstNation ?? false,
      attachments,
      noData: NO_DATA,
      notSubjectToAuthorization: NOT_SUBJECT_TO_AUTHORIZATION,
    };
  }

  private mapAuthorizationValueToStr(isAuthorized: boolean | null) {
    switch (isAuthorized) {
      case true:
        return 'Forward for ALC decision';
      case false:
        return 'Refuse to forward to ALC';
      default:
        return NO_DATA;
    }
  }

  private setAuthorization(dto: ApplicationSubmissionReviewDto) {
    let authorizedStr = NO_DATA;

    if (dto.isFirstNationGovernment) {
      return this.mapAuthorizationValueToStr(dto.isAuthorized);
    } else {
      if (dto.isSubjectToZoning === false && dto.isOCPDesignation === false) {
        authorizedStr = NOT_SUBJECT_TO_AUTHORIZATION;
      } else if (dto.isSubjectToZoning || dto.isOCPDesignation) {
        return this.mapAuthorizationValueToStr(dto.isAuthorized);
      }

      return authorizedStr;
    }
  }
}

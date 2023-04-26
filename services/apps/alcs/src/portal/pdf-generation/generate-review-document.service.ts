import { CdogsService } from '@app/common/cdogs/cdogs.service';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { forwardRef, HttpStatus, Inject, Injectable } from '@nestjs/common';
import * as config from 'config';
import * as dayjs from 'dayjs';
import * as timezone from 'dayjs/plugin/timezone';
import * as utc from 'dayjs/plugin/utc';
import { ApplicationLocalGovernmentService } from '../../alcs/application/application-code/application-local-government/application-local-government.service';
import { DOCUMENT_TYPE } from '../../alcs/application/application-document/application-document-code.entity';
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

const TEMPLATE_FILENAME = 'submission-review-template.docx';

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
    private localGovernmentService: ApplicationLocalGovernmentService,
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

    return await this.documentGenerationService.generateDocument(
      `${fileNumber}_submission_Date_Time`,
      `${config.get<string>('CDOGS.TEMPLATE_FOLDER')}/${TEMPLATE_FILENAME}`,
      payload,
    );
  }

  async generateAndAttach(fileNumber: string, user: User) {
    const reviewRes = await this.generate(fileNumber, user);

    if (reviewRes.status === HttpStatus.OK) {
      await this.applicationDocumentService.attachDocumentAsBuffer({
        fileNumber: fileNumber,
        fileName: `${fileNumber}_Submission`,
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

    const localGovernment = application.localGovernmentUuid
      ? await this.localGovernmentService.getByUuid(
          application.localGovernmentUuid,
        )
      : undefined;

    const attachments = documents
      .filter((document) => document.document.source === DOCUMENT_SOURCE.LFNG)
      .filter((document) => document.type?.code === DOCUMENT_TYPE.OTHER);

    const resolutionDocument = documents.find(
      (document) => document.type?.code === DOCUMENT_TYPE.RESOLUTION_DOCUMENT,
    );
    if (resolutionDocument) {
      attachments.push(resolutionDocument);
    }
    const staffReport = documents.find(
      (document) => document.type?.code === DOCUMENT_TYPE.STAFF_REPORT,
    );
    if (staffReport) {
      attachments.push(staffReport);
    }

    return {
      ...dto,
      generatedDateTime: dayjs
        .tz(new Date(), 'Canada/Pacific')
        .format('MMM DD, YYYY hh:mm:ss Z'),
      isOCPDesignation: formatBooleanToYesNoString(dto.isOCPDesignation),
      OCPConsistent: formatBooleanToYesNoString(dto.OCPConsistent),
      isSubjectToZoning: formatBooleanToYesNoString(dto.isSubjectToZoning),
      isZoningConsistent: formatBooleanToYesNoString(dto.isZoningConsistent),
      isAuthorized: formatBooleanToYesNoString(dto.isAuthorized),
      fileNumber: submission.fileNumber,
      status: submission.status,
      applicationTypePortalLabel: application.type.portalLabel,
      applicant: submission.applicant,
      localGovernment: localGovernment ? localGovernment.name : 'No Data',
      attachments,
      noData: 'No Data',
      notSubjectToAuthorization: 'Not Subject to Authorization',
    };
  }
}

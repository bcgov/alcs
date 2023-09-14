import { CdogsService } from '@app/common/cdogs/cdogs.service';
import { HttpStatus, Injectable } from '@nestjs/common';
import * as config from 'config';
import * as dayjs from 'dayjs';
import * as timezone from 'dayjs/plugin/timezone';
import * as utc from 'dayjs/plugin/utc';
import { VISIBILITY_FLAG } from '../../alcs/application/application-document/application-document.entity';
import { LocalGovernmentService } from '../../alcs/local-government/local-government.service';
import { NotificationDocument } from '../../alcs/notification/notification-document/notification-document.entity';
import { NotificationDocumentService } from '../../alcs/notification/notification-document/notification-document.service';
import { NotificationService } from '../../alcs/notification/notification.service';
import { DOCUMENT_TYPE } from '../../document/document-code.entity';
import { DOCUMENT_SOURCE, DOCUMENT_SYSTEM } from '../../document/document.dto';
import { User } from '../../user/user.entity';
import { formatPid } from '../../utils/pid-formatter';
import { NotificationParcelService } from '../notification-submission/notification-parcel/notification-parcel.service';
import { NotificationSubmission } from '../notification-submission/notification-submission.entity';
import { NotificationSubmissionService } from '../notification-submission/notification-submission.service';

const SRW_TEMPLATE_FILENAME = 'srw-response-template.docx';
const NO_DATA = 'No Data';

dayjs.extend(utc);
dayjs.extend(timezone);

@Injectable()
export class GenerateSrwDocumentService {
  constructor(
    private documentGenerationService: CdogsService,
    private notificationSubmissionService: NotificationSubmissionService,
    private notificationDocumentService: NotificationDocumentService,
    private localGovernmentService: LocalGovernmentService,
    private notificationParcelService: NotificationParcelService,
    private notificationService: NotificationService,
  ) {}

  async generate(fileNumber: string, user: User) {
    const submission = await this.notificationSubmissionService.getByFileNumber(
      fileNumber,
      user,
    );

    const documents = await this.notificationDocumentService.list(fileNumber);

    const payload = await this.preparePdfPayload(submission, documents);

    return await this.documentGenerationService.generateDocument(
      `${fileNumber}_SRW_Date_Time`,
      `${config.get<string>('CDOGS.TEMPLATE_FOLDER')}/${SRW_TEMPLATE_FILENAME}`,
      payload,
    );
  }

  async generateAndAttach(fileNumber: string, user: User) {
    const reviewRes = await this.generate(fileNumber, user);

    if (reviewRes.status === HttpStatus.OK) {
      await this.notificationDocumentService.attachDocumentAsBuffer({
        fileNumber: fileNumber,
        fileName: `SRW${fileNumber}m1.pdf`,
        user: user,
        file: reviewRes.data,
        mimeType: 'application/pdf',
        fileSize: reviewRes.data.length,
        documentType: DOCUMENT_TYPE.LTSA_LETTER,
        source: DOCUMENT_SOURCE.ALC,
        system: DOCUMENT_SYSTEM.PORTAL,
        visibilityFlags: [VISIBILITY_FLAG.APPLICANT, VISIBILITY_FLAG.PUBLIC],
      });
    }
  }

  private async preparePdfPayload(
    submission: NotificationSubmission,
    documents: NotificationDocument[],
  ) {
    const notification = await this.notificationService.getByFileNumber(
      submission.fileNumber,
    );

    const localGovernment = submission.localGovernmentUuid
      ? await this.localGovernmentService.getByUuid(
          submission.localGovernmentUuid,
        )
      : undefined;

    const termsDocuments = documents.filter(
      (document) => document.type?.code === DOCUMENT_TYPE.SRW_TERMS,
    );

    const surveyPlans = documents
      .filter((document) => document.type?.code === DOCUMENT_TYPE.SURVEY_PLAN)
      .map((document) => ({
        planNumber: document.surveyPlanNumber,
        controlNumber: document.controlNumber,
      }));

    if (surveyPlans.length === 0) {
      surveyPlans.push({
        planNumber: 'N/A',
        controlNumber: 'N/A',
      });
    }

    const parcels = await this.fetchAndMapParcels(submission.fileNumber);

    const transfereeNames = submission.transferees
      .map((transferee) =>
        transferee.organizationName
          ? transferee.organizationName
          : transferee.lastName,
      )
      .join(', ');

    return {
      generatedDateTime: dayjs
        .tz(new Date(), 'Canada/Pacific')
        .format('MMM DD, YYYY hh:mm:ss Z'),
      dateSubmitted: dayjs
        .tz(notification.dateSubmittedToAlc, 'Canada/Pacific')
        .format('MMMM DD, YYYY'),
      fileNumber: submission.fileNumber,
      applicant: submission.applicant,
      firstName: submission.contactFirstName,
      lastName: submission.contactLastName,
      email: submission.contactEmail,
      submittersFileNumber: submission.submittersFileNumber,
      totalArea: submission.totalArea,
      purpose: submission.purpose,
      localGovernment: localGovernment ? localGovernment.name : NO_DATA,
      isFirstNationGovernment: localGovernment?.isFirstNation ?? false,
      termsDocument: termsDocuments[0].document.fileName,
      surveyPlans,
      parcels,
      noData: NO_DATA,
      transfereeNames,
    };
  }

  private async fetchAndMapParcels(fileNumber: string) {
    const parcels = await this.notificationParcelService.fetchByFileId(
      fileNumber,
    );

    return parcels.map((parcel) => ({
      pid: parcel.pid ? formatPid(parcel.pid) : 'N/A',
      pin: parcel.pin ?? 'N/A',
      civicAddress: parcel.civicAddress,
      legalDescription: parcel.legalDescription,
    }));
  }
}

import { ServiceNotFoundException } from '@app/common/exceptions/base.exception';
import { Mapper } from 'automapper-core';
import { InjectMapper } from 'automapper-nestjs';
import { Injectable } from '@nestjs/common';
import { VISIBILITY_FLAG } from '../../../alcs/application/application-document/application-document.entity';
import { NotificationDocument } from '../../../alcs/notification/notification-document/notification-document.entity';
import { NotificationDocumentService } from '../../../alcs/notification/notification-document/notification-document.service';
import { NOTIFICATION_STATUS } from '../../../alcs/notification/notification-submission-status/notification-status.dto';
import { NotificationService } from '../../../alcs/notification/notification.service';
import { NotificationParcel } from '../../notification-submission/notification-parcel/notification-parcel.entity';
import { NotificationParcelService } from '../../notification-submission/notification-parcel/notification-parcel.service';
import { NotificationSubmission } from '../../notification-submission/notification-submission.entity';
import { NotificationSubmissionService } from '../../notification-submission/notification-submission.service';
import { PublicDocumentDto, PublicParcelDto } from '../public.dto';
import { PublicNotificationSubmissionDto } from './public-notification.dto';

@Injectable()
export class PublicNotificationService {
  constructor(
    private notificationService: NotificationService,
    private notificationSubmissionService: NotificationSubmissionService,
    private notificationParcelService: NotificationParcelService,
    private notificationDocumentService: NotificationDocumentService,
    @InjectMapper() private mapper: Mapper,
  ) {}

  async getPublicData(fileNumber: string) {
    const notification =
      await this.notificationService.getByFileNumber(fileNumber);

    const submission =
      await this.notificationSubmissionService.getOrFailByFileNumber(
        fileNumber,
      );

    //Check if Response Sent Status
    if (
      (submission.status.statusType.code as NOTIFICATION_STATUS) !==
      NOTIFICATION_STATUS.ALC_RESPONSE_SENT
    ) {
      throw new ServiceNotFoundException(
        `Failed to find notification with File ID ${fileNumber}`,
      );
    }

    const parcels =
      await this.notificationParcelService.fetchByFileId(fileNumber);

    const mappedParcels = this.mapper.mapArray(
      parcels,
      NotificationParcel,
      PublicParcelDto,
    );

    const mappedSubmission = this.mapper.map(
      submission,
      NotificationSubmission,
      PublicNotificationSubmissionDto,
    );
    mappedSubmission.type = notification.type.label;

    const documents = await this.notificationDocumentService.list(fileNumber, [
      VISIBILITY_FLAG.PUBLIC,
    ]);

    const mappedDocuments = this.mapper.mapArray(
      documents,
      NotificationDocument,
      PublicDocumentDto,
    );

    return {
      submission: mappedSubmission,
      parcels: mappedParcels,
      documents: mappedDocuments,
    };
  }

  async getDownloadUrl(documentUuid: string) {
    const document = await this.notificationDocumentService.get(documentUuid);

    if (!document.visibilityFlags.includes(VISIBILITY_FLAG.PUBLIC)) {
      throw new ServiceNotFoundException('Failed to find document');
    }

    const url = await this.notificationDocumentService.getDownloadUrl(document);

    return {
      url,
    };
  }

  async getInlineUrl(documentUuid: string) {
    const document = await this.notificationDocumentService.get(documentUuid);

    if (!document.visibilityFlags.includes(VISIBILITY_FLAG.PUBLIC)) {
      throw new ServiceNotFoundException('Failed to find document');
    }

    const url = await this.notificationDocumentService.getInlineUrl(document);

    return {
      url,
    };
  }
}

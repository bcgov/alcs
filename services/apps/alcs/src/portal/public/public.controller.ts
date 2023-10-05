import { ServiceNotFoundException } from '@app/common/exceptions/base.exception';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Controller, Get, Param } from '@nestjs/common';
import { Public } from 'nest-keycloak-connect';
import { ApplicationDocumentDto } from '../../alcs/application/application-document/application-document.dto';
import {
  ApplicationDocument,
  VISIBILITY_FLAG,
} from '../../alcs/application/application-document/application-document.entity';
import { ApplicationDocumentService } from '../../alcs/application/application-document/application-document.service';
import { ApplicationService } from '../../alcs/application/application.service';
import { ApplicationParcelDto } from '../application-submission/application-parcel/application-parcel.dto';
import { ApplicationParcel } from '../application-submission/application-parcel/application-parcel.entity';
import { ApplicationParcelService } from '../application-submission/application-parcel/application-parcel.service';
import { ApplicationSubmission } from '../application-submission/application-submission.entity';
import { ApplicationSubmissionService } from '../application-submission/application-submission.service';
import { PublicApplicationSubmissionDto } from './public.dto';

@Public()
@Controller('/public')
export class PublicController {
  constructor(
    @InjectMapper() private mapper: Mapper,
    private applicationService: ApplicationService,
    private applicationSubmissionService: ApplicationSubmissionService,
    private applicationParcelService: ApplicationParcelService,
    private applicationDocumentService: ApplicationDocumentService,
  ) {}

  @Get('/application/:fileId')
  async getApplication(@Param('fileId') fileId: string) {
    const application = await this.applicationService.get(fileId);
    if (!application?.dateReceivedAllItems) {
      throw new ServiceNotFoundException(
        `Failed to find application with File ID ${fileId}`,
      );
    }

    const submission =
      await this.applicationSubmissionService.getOrFailByFileNumber(fileId);

    const parcels =
      await this.applicationParcelService.fetchByApplicationFileId(fileId);

    const mappedParcels = this.mapper.mapArray(
      parcels,
      ApplicationParcel,
      ApplicationParcelDto,
    );

    const mappedSubmission = this.mapper.map(
      submission,
      ApplicationSubmission,
      PublicApplicationSubmissionDto,
    );

    const documents = await this.applicationDocumentService.list(fileId, [
      VISIBILITY_FLAG.PUBLIC,
    ]);

    const mappedDocuments = this.mapper.mapArray(
      documents,
      ApplicationDocument,
      ApplicationDocumentDto,
    );

    return {
      submission: mappedSubmission,
      parcels: mappedParcels,
      documents: mappedDocuments,
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

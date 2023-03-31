import { Injectable } from '@nestjs/common';
import * as config from 'config';
import { CdogsService } from '../../../../../../libs/common/src/cdogs/cdogs.service';
import { ServiceNotFoundException } from '../../../../../../libs/common/src/exceptions/base.exception';
import { ApplicationLocalGovernmentService } from '../../../alcs/application/application-code/application-local-government/application-local-government.service';
import { ApplicationService } from '../../../alcs/application/application.service';
import { User } from '../../../user/user.entity';
import { PARCEL_TYPE } from '../application-parcel/application-parcel.dto';
import { ApplicationParcelService } from '../application-parcel/application-parcel.service';
import { ApplicationSubmissionService } from '../application-submission.service';

export enum APPLICATION_SUBMISSION_TYPES {
  'NFUP' = 'NFUP',
  'TURP' = 'TURP',
}

@Injectable()
export class GenerateSubmissionDocumentService {
  constructor(
    private documentGenerationService: CdogsService,
    private applicationSubmissionService: ApplicationSubmissionService,
    private localGovernmentService: ApplicationLocalGovernmentService,
    private applicationService: ApplicationService,
    private parcelService: ApplicationParcelService,
  ) {}

  async generate(fileNumber: string, user: User) {
    console.log('generate', fileNumber);

    const submission = await this.applicationSubmissionService.verifyAccess(
      fileNumber,
      user,
    );

    const application = await this.applicationService.getOrFail(
      submission.fileNumber,
    );

    let localGovernment;
    if (submission.localGovernmentUuid) {
      localGovernment = await this.localGovernmentService.getByUuid(
        submission.localGovernmentUuid,
      );
    }

    const parcels = await this.parcelService.fetchByApplicationFileId(
      submission.fileNumber,
    );

    const payload = {
      ...submission,
      application: application,
      localGovernment: localGovernment,
      parcels: parcels
        .filter((e) => e.parcelType === PARCEL_TYPE.APPLICATION)
        .map((e) => ({
          ...e,
          purchasedDate: e.purchasedDate
            ? e.purchasedDate.toDateString() // TODO this should be of specific format
            : undefined,
          certificateOfTitle: undefined, // TODO get this from data
        })),
      otherParcels: parcels
        .filter((e) => e.parcelType === PARCEL_TYPE.OTHER)
        .map((e) => ({
          ...e,
          purchasedDate: e.purchasedDate
            ? e.purchasedDate.toDateString() // TODO this should be of specific format
            : undefined,
          certificateOfTitle: undefined, // TODO get this from data
        })),
    };

    console.log('payload', payload);
    console.log('parcels', parcels);
    console.log('owners', submission.owners);

    const pdf = await this.documentGenerationService.generateDocument(
      `${fileNumber}_submission_Date_Time`,
      `${config.get<string>(
        'CDOGS.TEMPLATE_FOLDER',
      )}/${this.getTemplateByApplicationType(
        submission.typeCode as APPLICATION_SUBMISSION_TYPES,
      )}`,
      payload,
    );

    return pdf;
  }

  private getTemplateByApplicationType(
    applicationSubmissionType: APPLICATION_SUBMISSION_TYPES,
  ) {
    switch (applicationSubmissionType) {
      case APPLICATION_SUBMISSION_TYPES.NFUP:
        return 'nfu-submission-template.docx';
      case APPLICATION_SUBMISSION_TYPES.TURP:
        return 'tur-submission-template.docx';
      default:
        throw new ServiceNotFoundException(
          `Could not find template for application submission type ${applicationSubmissionType}`,
        );
    }
  }
}

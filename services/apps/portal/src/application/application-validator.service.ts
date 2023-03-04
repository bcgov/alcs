import { ServiceValidationException } from '@app/common/exceptions/base.exception';
import { Injectable, Logger } from '@nestjs/common';
import { LocalGovernmentService } from '../alcs/local-government/local-government.service';
import { DOCUMENT_TYPE } from './application-document/application-document.entity';
import { APPLICATION_OWNER } from './application-owner/application-owner.dto';
import { PARCEL_TYPE } from './application-parcel/application-parcel.dto';
import { ApplicationParcelService } from './application-parcel/application-parcel.service';
import { Application } from './application.entity';

export class ValidatedApplication extends Application {
  applicant: string;
  localGovernmentUuid: string;
}

@Injectable()
export class ApplicationValidatorService {
  private logger: Logger = new Logger(ApplicationValidatorService.name);

  constructor(
    private localGovernmentService: LocalGovernmentService,
    private appParcelService: ApplicationParcelService,
  ) {}

  async validateApplication(application: Application) {
    const errors: Error[] = [];

    if (!application.applicant) {
      errors.push(new ServiceValidationException('Missing applicant'));
    }

    await this.validateParcels(application, errors);
    await this.validatePrimaryContact(application, errors);
    await this.validateLocalGovernment(application, errors);
    await this.validateLandUse(application, errors);
    await this.validateOptionalDocuments(application, errors);
    await this.validateNfuProposal(application, errors);

    return {
      errors,
      application:
        errors.length > 0 ? undefined : (application as ValidatedApplication),
    };
  }

  private async validateParcels(application: Application, errors: Error[]) {
    const parcels = await this.appParcelService.fetchByApplicationFileId(
      application.fileNumber,
    );

    if (parcels.length === 0) {
      errors.push(new ServiceValidationException(`Application has no parcels`));
    }

    if (application.hasOtherParcelsInCommunity === null) {
      errors.push(
        new ServiceValidationException(`Not answered has Other Parcels`),
      );
    }

    for (const parcel of parcels) {
      if (
        parcel.ownershipTypeCode === null ||
        parcel.legalDescription === null ||
        parcel.mapAreaHectares === null ||
        parcel.isFarm === null ||
        !parcel.isConfirmedByApplicant
      ) {
        errors.push(
          new ServiceValidationException(`Invalid Parcel ${parcel.uuid}`),
        );
      }

      if (parcel.ownershipTypeCode === 'SMPL' && !parcel.pid) {
        errors.push(
          new ServiceValidationException(
            `Fee Simple Parcel ${parcel.uuid} has no PID`,
          ),
        );
      }

      if (parcel.pid && parcel.pid.length !== 9) {
        errors.push(
          new ServiceValidationException(
            `Parcel ${parcel.uuid} has invalid PID`,
          ),
        );
      }

      if (parcel.ownershipTypeCode === 'SMPL' && !parcel.purchasedDate) {
        errors.push(
          new ServiceValidationException(
            `Fee Simple Parcel ${parcel.uuid} has no purchase date`,
          ),
        );
      }

      if (parcel.ownershipTypeCode === 'CRWN' && !parcel.crownLandOwnerType) {
        errors.push(
          new ServiceValidationException(
            `Crown Parcel ${parcel.uuid} has no ownership type`,
          ),
        );
      }

      if (parcel.owners.length === 0) {
        errors.push(
          new ServiceValidationException(`Parcel has no Owners ${parcel.uuid}`),
        );
      }

      if (
        parcel.parcelType === PARCEL_TYPE.APPLICATION &&
        parcel.documents.length === 0 &&
        (parcel.ownershipTypeCode === 'SMPL' || parcel.pid)
      ) {
        errors.push(
          new ServiceValidationException(
            `Parcel is missing certificate of title ${parcel.uuid}`,
          ),
        );
      }
    }
  }

  private async validatePrimaryContact(
    application: Application,
    errors: Error[],
  ) {
    const primaryOwner = application.owners.find(
      (owner) => owner.uuid === application.primaryContactOwnerUuid,
    );

    if (!primaryOwner) {
      errors.push(
        new ServiceValidationException(`Application has no primary contact`),
      );
      return;
    }

    const hasCrownLandOwners = application.owners.some(
      (owner) => owner.type.code === APPLICATION_OWNER.CROWN,
    );
    if (application.owners.length > 1 || hasCrownLandOwners) {
      const authorizationLetters = application.documents.filter(
        (document) => document.type === DOCUMENT_TYPE.AUTHORIZATION_LETTER,
      );
      if (authorizationLetters.length === 0) {
        errors.push(
          new ServiceValidationException(
            `Application has no authorization letters`,
          ),
        );
      }
    }

    if (primaryOwner.type.code === APPLICATION_OWNER.AGENT) {
      if (
        !primaryOwner.firstName ||
        !primaryOwner.lastName ||
        !primaryOwner.phoneNumber ||
        !primaryOwner.email
      ) {
        errors.push(
          new ServiceValidationException(
            `Invalid Third Party Agent Information`,
          ),
        );
      }
    }
  }

  private async validateLocalGovernment(
    application: Application,
    errors: Error[],
  ) {
    const localGovernments = await this.localGovernmentService.get();
    const matchingLg = localGovernments.find(
      (lg) => lg.uuid === application.localGovernmentUuid,
    );
    if (!application.localGovernmentUuid) {
      errors.push(
        new ServiceValidationException('Application has no local government'),
      );
    }

    if (!matchingLg) {
      errors.push(
        new ServiceValidationException(
          'Cannot find local government set on Application',
        ),
      );
      return;
    }

    if (!matchingLg.bceidBusinessGuid) {
      errors.push(
        new ServiceValidationException(
          `Selected local government is setup in portal ${matchingLg.name}`,
        ),
      );
    }
  }

  private async validateLandUse(application: Application, errors: Error[]) {
    if (
      !application.parcelsAgricultureDescription ||
      !application.parcelsAgricultureImprovementDescription ||
      !application.parcelsNonAgricultureUseDescription
    ) {
      errors.push(new ServiceValidationException(`Invalid Parcel Description`));
    }

    if (
      !application.northLandUseType ||
      !application.northLandUseTypeDescription ||
      !application.eastLandUseType ||
      !application.eastLandUseTypeDescription ||
      !application.southLandUseType ||
      !application.southLandUseTypeDescription ||
      !application.westLandUseType ||
      !application.westLandUseTypeDescription
    ) {
      errors.push(new ServiceValidationException(`Invalid Adjacent Parcels`));
    }
  }

  private async validateOptionalDocuments(
    application: Application,
    errors: Error[],
  ) {
    const untypedDocuments = application.documents.filter(
      (document) => !document.type,
    );
    for (const document of untypedDocuments) {
      errors.push(
        new ServiceValidationException(
          `Document ${document.uuid} missing type`,
        ),
      );
    }

    const optionalDocuments = application.documents.filter((document) =>
      [
        DOCUMENT_TYPE.OTHER,
        DOCUMENT_TYPE.PHOTOGRAPH,
        DOCUMENT_TYPE.PROFESSIONAL_REPORT,
      ].includes(document.type as DOCUMENT_TYPE),
    );
    for (const document of optionalDocuments) {
      if (!document.description) {
        errors.push(
          new ServiceValidationException(
            `Document ${document.uuid} missing description`,
          ),
        );
      }
    }
  }

  private async validateNfuProposal(application: Application, errors: Error[]) {
    if (
      !application.nfuHectares ||
      !application.nfuPurpose ||
      !application.nfuOutsideLands ||
      !application.nfuAgricultureSupport ||
      application.nfuWillImportFill === null
    ) {
      errors.push(new ServiceValidationException(`NFU Proposal incomplete`));
    }

    if (application.nfuWillImportFill) {
      if (
        !application.nfuFillTypeDescription ||
        !application.nfuFillOriginDescription ||
        application.nfuTotalFillPlacement === null ||
        application.nfuMaxFillDepth === null ||
        application.nfuFillVolume === null ||
        application.nfuProjectDurationAmount === null ||
        !application.nfuProjectDurationUnit
      ) {
        errors.push(
          new ServiceValidationException(`NFU Fill Section incomplete`),
        );
      }
    }
  }
}

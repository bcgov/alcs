import {
  BaseServiceException,
  ServiceNotFoundException,
} from '@app/common/exceptions/base.exception';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LocalGovernment } from '../alcs/local-government/local-government.service';
import { DOCUMENT_TYPE } from '../application-submission/application-document/application-document.entity';
import { ApplicationDocumentService } from '../application-submission/application-document/application-document.service';
import { ApplicationSubmission } from '../application-submission/application-submission.entity';
import { User } from '../user/user.entity';
import {
  ApplicationSubmissionReviewDto,
  UpdateApplicationSubmissionReviewDto,
} from './application-submission-review.dto';
import { ApplicationSubmissionReview } from './application-submission-review.entity';

export type CompletedApplicationSubmissionReview = {
  localGovernmentFileNumber: string;
  firstName: string;
  lastName: string;
  position: string;
  department: string;
  phoneNumber: string;
  email: string;
  isOCPDesignation: boolean | null;
  OCPBylawName: string | null;
  OCPDesignation: string | null;
  OCPConsistent: boolean | null;
  isSubjectToZoning: boolean | null;
  zoningBylawName: string | null;
  zoningDesignation: string | null;
  zoningMinimumLotSize: string | null;
  isZoningConsistent: boolean | null;
  isAuthorized: boolean | null;
};

@Injectable()
export class ApplicationSubmissionReviewService {
  constructor(
    @InjectRepository(ApplicationSubmissionReview)
    private applicationSubmissionReviewRepository: Repository<ApplicationSubmissionReview>,
    private applicationDocumentService: ApplicationDocumentService,
    @InjectMapper('') private mapper: Mapper,
  ) {}

  getForGovernment(fileNumber: string, localGovernment: LocalGovernment) {
    return this.applicationSubmissionReviewRepository.findOne({
      where: {
        application: {
          fileNumber,
          localGovernmentUuid: localGovernment.uuid,
        },
      },
    });
  }

  getForOwner(fileNumber: string, user: User) {
    return this.applicationSubmissionReviewRepository.findOneOrFail({
      where: {
        application: {
          fileNumber,
          createdBy: {
            uuid: user.uuid,
          },
        },
      },
      relations: {
        application: true,
      },
    });
  }

  async startReview(application: ApplicationSubmission) {
    const applicationReview = new ApplicationSubmissionReview({
      application,
    });
    return await this.applicationSubmissionReviewRepository.save(
      applicationReview,
    );
  }

  async update(
    fileNumber: string,
    localGovernment: LocalGovernment,
    updateDto: UpdateApplicationSubmissionReviewDto,
  ) {
    const applicationReview = await this.getForGovernment(
      fileNumber,
      localGovernment,
    );

    if (!applicationReview) {
      throw new ServiceNotFoundException('Failed to load applicaiton review');
    }

    applicationReview.localGovernmentFileNumber =
      updateDto.localGovernmentFileNumber ??
      applicationReview.localGovernmentFileNumber;

    applicationReview.firstName =
      updateDto.firstName !== undefined
        ? updateDto.firstName
        : applicationReview.firstName;
    applicationReview.lastName =
      updateDto.lastName !== undefined
        ? updateDto.lastName
        : applicationReview.lastName;
    applicationReview.position =
      updateDto.position !== undefined
        ? updateDto.position
        : applicationReview.position;
    applicationReview.department =
      updateDto.department !== undefined
        ? updateDto.department
        : applicationReview.department;
    applicationReview.phoneNumber =
      updateDto.phoneNumber !== undefined
        ? updateDto.phoneNumber
        : applicationReview.phoneNumber;
    applicationReview.email =
      updateDto.email !== undefined ? updateDto.email : applicationReview.email;

    applicationReview.isOCPDesignation =
      updateDto.isOCPDesignation !== undefined
        ? updateDto.isOCPDesignation
        : applicationReview.isOCPDesignation;
    applicationReview.OCPBylawName =
      updateDto.OCPBylawName !== undefined
        ? updateDto.OCPBylawName
        : applicationReview.OCPBylawName;
    applicationReview.OCPDesignation =
      updateDto.OCPDesignation !== undefined
        ? updateDto.OCPDesignation
        : applicationReview.OCPDesignation;
    applicationReview.OCPConsistent =
      updateDto.OCPConsistent !== undefined
        ? updateDto.OCPConsistent
        : applicationReview.OCPConsistent;

    applicationReview.isSubjectToZoning =
      updateDto.isSubjectToZoning !== undefined
        ? updateDto.isSubjectToZoning
        : applicationReview.isSubjectToZoning;
    applicationReview.zoningBylawName =
      updateDto.zoningBylawName !== undefined
        ? updateDto.zoningBylawName
        : applicationReview.zoningBylawName;
    applicationReview.zoningDesignation =
      updateDto.zoningDesignation !== undefined
        ? updateDto.zoningDesignation
        : applicationReview.zoningDesignation;
    applicationReview.zoningMinimumLotSize =
      updateDto.zoningMinimumLotSize !== undefined
        ? updateDto.zoningMinimumLotSize
        : applicationReview.zoningMinimumLotSize;
    applicationReview.isZoningConsistent =
      updateDto.isZoningConsistent !== undefined
        ? updateDto.isZoningConsistent
        : applicationReview.isZoningConsistent;

    applicationReview.isAuthorized =
      updateDto.isAuthorized !== undefined
        ? updateDto.isAuthorized
        : applicationReview.isAuthorized;

    if (
      applicationReview.isOCPDesignation == false &&
      applicationReview.isSubjectToZoning == false
    ) {
      applicationReview.isAuthorized = null;
      await this.applicationDocumentService.deleteByType(
        DOCUMENT_TYPE.RESOLUTION_DOCUMENT,
        applicationReview.applicationFileNumber,
      );

      await this.applicationDocumentService.deleteByType(
        DOCUMENT_TYPE.STAFF_REPORT,
        applicationReview.applicationFileNumber,
      );
    }

    return this.applicationSubmissionReviewRepository.save(applicationReview);
  }

  verifyComplete(
    application: ApplicationSubmission,
    applicationReview: ApplicationSubmissionReview,
    isFirstNationGovernment: boolean,
  ): CompletedApplicationSubmissionReview {
    if (
      !applicationReview.localGovernmentFileNumber ||
      !applicationReview.firstName ||
      !applicationReview.lastName ||
      !applicationReview.position ||
      !applicationReview.department ||
      !applicationReview.phoneNumber ||
      !applicationReview.email
    ) {
      throw new BaseServiceException('Contact information not complete');
    }

    if (!isFirstNationGovernment) {
      if (applicationReview.isOCPDesignation === null) {
        throw new BaseServiceException('OCP information not complete');
      }

      if (applicationReview.isOCPDesignation) {
        if (
          !applicationReview.OCPBylawName ||
          !applicationReview.OCPDesignation ||
          applicationReview.OCPConsistent === null
        ) {
          throw new BaseServiceException('OCP information not complete');
        }
      }
    }

    if (!isFirstNationGovernment) {
      if (applicationReview.isSubjectToZoning === null) {
        throw new BaseServiceException('Zoning information not complete');
      }

      if (applicationReview.isSubjectToZoning) {
        if (
          !applicationReview.zoningBylawName ||
          !applicationReview.zoningDesignation ||
          !applicationReview.zoningMinimumLotSize ||
          applicationReview.isZoningConsistent === null
        ) {
          throw new BaseServiceException('Zoning information not complete');
        }
      }
    }

    if (
      (applicationReview.isOCPDesignation ||
        applicationReview.isSubjectToZoning) &&
      applicationReview.isAuthorized === null
    ) {
      throw new BaseServiceException('Review authorization needs to be set');
    }

    //Verify Documents
    if (
      applicationReview.isSubjectToZoning ||
      applicationReview.isOCPDesignation
    ) {
      if (
        !application.documents.some(
          (doc) => doc.type === DOCUMENT_TYPE.RESOLUTION_DOCUMENT,
        )
      ) {
        throw new BaseServiceException('Review missing resolution document');
      }

      if (!isFirstNationGovernment && applicationReview.isAuthorized) {
        if (
          !application.documents.some((doc) => doc.type === 'reviewStaffReport')
        ) {
          throw new BaseServiceException(
            'Review missing staff report document',
          );
        }
      }
    }
    return applicationReview as CompletedApplicationSubmissionReview;
  }

  async mapToDto(
    review: ApplicationSubmissionReview,
    localGovernment: LocalGovernment,
  ): Promise<ApplicationSubmissionReviewDto> {
    const mappedReview = await this.mapper.mapAsync(
      review,
      ApplicationSubmissionReview,
      ApplicationSubmissionReviewDto,
    );
    return {
      ...mappedReview,
      isFirstNationGovernment: localGovernment.isFirstNation,
    };
  }

  async delete(applicationReview: ApplicationSubmissionReview) {
    await this.applicationSubmissionReviewRepository.remove(applicationReview);
  }
}

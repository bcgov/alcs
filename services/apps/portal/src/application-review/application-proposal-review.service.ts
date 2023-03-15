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
import { DOCUMENT_TYPE } from '../application-proposal/application-document/application-document.entity';
import { ApplicationDocumentService } from '../application-proposal/application-document/application-document.service';
import { ApplicationProposal } from '../application-proposal/application-proposal.entity';
import { User } from '../user/user.entity';
import {
  ApplicationProposalReviewDto,
  UpdateApplicationProposalReviewDto,
} from './application-proposal-review.dto';
import { ApplicationProposalReview } from './application-proposal-review.entity';

export type CompletedApplicationProposalReview = {
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
export class ApplicationProposalReviewService {
  constructor(
    @InjectRepository(ApplicationProposalReview)
    private applicationProposalReviewRepository: Repository<ApplicationProposalReview>,
    private applicationDocumentService: ApplicationDocumentService,
    @InjectMapper('') private mapper: Mapper,
  ) {}

  getForGovernment(fileNumber: string, localGovernment: LocalGovernment) {
    return this.applicationProposalReviewRepository.findOne({
      where: {
        application: {
          fileNumber,
          localGovernmentUuid: localGovernment.uuid,
        },
      },
    });
  }

  getForOwner(fileNumber: string, user: User) {
    return this.applicationProposalReviewRepository.findOneOrFail({
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

  async startReview(application: ApplicationProposal) {
    const applicationReview = new ApplicationProposalReview({
      application,
    });
    return await this.applicationProposalReviewRepository.save(
      applicationReview,
    );
  }

  async update(
    fileNumber: string,
    localGovernment: LocalGovernment,
    updateDto: UpdateApplicationProposalReviewDto,
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

    return this.applicationProposalReviewRepository.save(applicationReview);
  }

  verifyComplete(
    application: ApplicationProposal,
    applicationReview: ApplicationProposalReview,
    isFirstNationGovernment: boolean,
  ): CompletedApplicationProposalReview {
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
    return applicationReview as CompletedApplicationProposalReview;
  }

  async mapToDto(
    review: ApplicationProposalReview,
    localGovernment: LocalGovernment,
  ): Promise<ApplicationProposalReviewDto> {
    const mappedReview = await this.mapper.mapAsync(
      review,
      ApplicationProposalReview,
      ApplicationProposalReviewDto,
    );
    return {
      ...mappedReview,
      isFirstNationGovernment: localGovernment.isFirstNation,
    };
  }

  async delete(applicationReview: ApplicationProposalReview) {
    await this.applicationProposalReviewRepository.remove(applicationReview);
  }
}

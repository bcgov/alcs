import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LocalGovernment } from '../alcs/local-government/local-government.service';
import { Application } from '../application/application.entity';
import { UpdateApplicationReviewDto } from './application-review.dto';
import { ApplicationReview } from './application-review.entity';

@Injectable()
export class ApplicationReviewService {
  constructor(
    @InjectRepository(ApplicationReview)
    private applicationReviewRepository: Repository<ApplicationReview>,
  ) {}

  get(fileNumber: string, localGovernment: LocalGovernment) {
    return this.applicationReviewRepository.findOneOrFail({
      where: {
        application: {
          fileNumber,
          localGovernmentUuid: localGovernment.uuid,
        },
      },
    });
  }

  async startReview(application: Application) {
    const applicationReview = new ApplicationReview({
      application,
    });
    return await this.applicationReviewRepository.save(applicationReview);
  }

  async update(
    fileNumber: string,
    localGovernment: LocalGovernment,
    updateDto: UpdateApplicationReviewDto,
  ) {
    const applicationReview = await this.get(fileNumber, localGovernment);

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

    return await this.applicationReviewRepository.save(applicationReview);
  }
}

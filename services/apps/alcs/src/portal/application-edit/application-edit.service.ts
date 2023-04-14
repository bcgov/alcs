import { BaseServiceException } from '@app/common/exceptions/base.exception';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 } from 'uuid';
import { ApplicationOwner } from '../application-submission/application-owner/application-owner.entity';
import { ApplicationParcel } from '../application-submission/application-parcel/application-parcel.entity';
import { ApplicationSubmission } from '../application-submission/application-submission.entity';
import { ApplicationSubmissionService } from '../application-submission/application-submission.service';

@Injectable()
export class ApplicationEditService {
  private logger = new Logger(ApplicationEditService.name);

  constructor(
    @InjectRepository(ApplicationSubmission)
    private applicationSubmissionRepository: Repository<ApplicationSubmission>,
    private applicationSubmissionService: ApplicationSubmissionService,
  ) {}

  async getOrCreateDraft(fileNumber: string) {
    const existingDraft = await this.getDraft(fileNumber);

    if (existingDraft) {
      return existingDraft;
    } else {
      return this.createDraft(fileNumber);
    }
  }

  private async getDraft(fileNumber: string) {
    return await this.applicationSubmissionRepository.findOne({
      where: {
        fileNumber: fileNumber,
        isDraft: true,
      },
      relations: {
        owners: {
          type: true,
          corporateSummary: {
            document: true,
          },
          parcels: true,
        },
      },
    });
  }

  private async createDraft(
    fileNumber: string,
  ): Promise<ApplicationSubmission> {
    const originalSubmission =
      await this.applicationSubmissionRepository.findOne({
        where: {
          fileNumber: fileNumber,
          isDraft: false,
        },
        relations: {
          owners: true,
          parcels: true,
        },
      });

    if (!originalSubmission) {
      throw new BadRequestException(
        "Cannot edit a submission that doesn't exist",
      );
    }

    const newUuid = v4();
    const newReview = new ApplicationSubmission({
      ...originalSubmission,
      createdAt: undefined,
      updatedAt: undefined,
      isDraft: true,
      uuid: newUuid,
      parcels: originalSubmission.parcels.map((parcel) => {
        return new ApplicationParcel({
          ...parcel,
          uuid: undefined,
          auditCreatedAt: undefined,
          auditUpdatedAt: undefined,
          auditUpdatedBy: undefined,
          applicationSubmission: undefined,
          applicationSubmissionUuid: newUuid,
        });
      }),
      owners: originalSubmission.owners.map((owner) => {
        return new ApplicationOwner({
          ...owner,
          uuid: undefined,
          auditCreatedAt: undefined,
          auditUpdatedAt: undefined,
          auditUpdatedBy: undefined,
          applicationSubmission: undefined,
          applicationSubmissionUuid: newUuid,
        });
      }),
    });
    //TODO: Copy linked of Owners <-> Parcels somehow
    await this.applicationSubmissionRepository.save(newReview);

    this.logger.debug(`Draft Created for File Number ${fileNumber}`);

    const submission = await this.getDraft(fileNumber);
    if (submission === null) {
      throw new BaseServiceException('Failed to save/create draft');
    }
    return submission;
  }

  async mapToDetailedDto(applicationSubmission: ApplicationSubmission) {
    const mappedSubmission =
      await this.applicationSubmissionService.mapToDetailedDTO(
        applicationSubmission,
      );
    return {
      ...mappedSubmission,
      canEdit: true,
      canReview: true,
      canView: true,
    };
  }
}

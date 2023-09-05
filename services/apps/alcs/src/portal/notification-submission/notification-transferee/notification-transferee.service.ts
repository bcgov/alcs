import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Any, Repository } from 'typeorm';
import { NotificationService } from '../../../alcs/notification/notification.service';
import { OwnerType } from '../../../common/owner-type/owner-type.entity';
import { User } from '../../../user/user.entity';
import { FALLBACK_APPLICANT_NAME } from '../../../utils/owner.constants';
import { NotificationSubmission } from '../notification-submission.entity';
import { NotificationSubmissionService } from '../notification-submission.service';
import {
  NotificationTransfereeCreateDto,
  NotificationTransfereeUpdateDto,
} from './notification-transferee.dto';
import { NotificationTransferee } from './notification-transferee.entity';

@Injectable()
export class NotificationTransfereeService {
  constructor(
    @InjectRepository(NotificationTransferee)
    private repository: Repository<NotificationTransferee>,
    @InjectRepository(OwnerType)
    private typeRepository: Repository<OwnerType>,
    @Inject(forwardRef(() => NotificationSubmissionService))
    private notificationSubmissionService: NotificationSubmissionService,
    private notificationService: NotificationService,
  ) {}

  async fetchByFileId(fileId: string) {
    return this.repository.find({
      where: {
        notificationSubmission: {
          fileNumber: fileId,
        },
      },
      relations: {
        type: true,
      },
    });
  }

  async create(
    createDto: NotificationTransfereeCreateDto,
    notificationSubmission: NotificationSubmission,
  ) {
    const type = await this.typeRepository.findOneOrFail({
      where: {
        code: createDto.typeCode,
      },
    });

    const newOwner = new NotificationTransferee({
      firstName: createDto.firstName,
      lastName: createDto.lastName,
      organizationName: createDto.organizationName,
      email: createDto.email,
      phoneNumber: createDto.phoneNumber,
      notificationSubmission: notificationSubmission,
      type,
    });

    return await this.repository.save(newOwner);
  }

  async save(owner: NotificationTransferee) {
    await this.repository.save(owner);
  }

  async update(
    uuid: string,
    updateDto: NotificationTransfereeUpdateDto,
    user: User,
  ) {
    const existingOwner = await this.repository.findOneOrFail({
      where: {
        uuid,
      },
    });

    if (updateDto.typeCode) {
      existingOwner.type = await this.typeRepository.findOneOrFail({
        where: {
          code: updateDto.typeCode,
        },
      });
    }
    existingOwner.organizationName =
      updateDto.organizationName !== undefined
        ? updateDto.organizationName
        : existingOwner.organizationName;

    existingOwner.firstName =
      updateDto.firstName !== undefined
        ? updateDto.firstName
        : existingOwner.firstName;

    existingOwner.lastName =
      updateDto.lastName !== undefined
        ? updateDto.lastName
        : existingOwner.lastName;

    existingOwner.phoneNumber =
      updateDto.phoneNumber !== undefined
        ? updateDto.phoneNumber
        : existingOwner.phoneNumber;

    existingOwner.email =
      updateDto.email !== undefined ? updateDto.email : existingOwner.email;

    await this.updateSubmissionApplicant(
      existingOwner.notificationSubmissionUuid,
      user,
    );

    return await this.repository.save(existingOwner);
  }

  async delete(owner: NotificationTransferee, user: User) {
    const res = await this.repository.remove(owner);
    await this.updateSubmissionApplicant(
      owner.notificationSubmissionUuid,
      user,
    );
    return res;
  }

  async getOwner(ownerUuid: string) {
    return await this.repository.findOneOrFail({
      where: {
        uuid: ownerUuid,
      },
      relations: {
        type: true,
      },
    });
  }

  async getMany(ownerUuids: string[]) {
    return await this.repository.find({
      where: {
        uuid: Any(ownerUuids),
      },
    });
  }

  async updateSubmissionApplicant(submissionUuid: string, user: User) {
    const transferees = await this.repository.find({
      where: {
        notificationSubmissionUuid: submissionUuid,
      },
    });

    //Filter to only alphabetic
    const alphabetOwners = transferees.filter((owner) =>
      isNaN(
        parseInt((owner.organizationName ?? owner.lastName ?? '').charAt(0)),
      ),
    );

    //If no alphabetic use them all
    if (alphabetOwners.length === 0) {
      alphabetOwners.push(...transferees);
    }

    const firstOwner = alphabetOwners.sort((a, b) => {
      const mappedA = a.organizationName ?? a.lastName ?? '';
      const mappedB = b.organizationName ?? b.lastName ?? '';
      return mappedA.localeCompare(mappedB);
    })[0];
    if (firstOwner) {
      let applicantName = firstOwner.organizationName
        ? firstOwner.organizationName
        : firstOwner.lastName;
      if (transferees.length > 1) {
        applicantName += ' et al.';
      }

      await this.notificationSubmissionService.update(
        submissionUuid,
        {
          applicant: applicantName || '',
        },
        user,
      );

      const fileNumber = await this.notificationSubmissionService.getFileNumber(
        submissionUuid,
      );
      if (fileNumber) {
        await this.notificationService.updateApplicant(
          fileNumber,
          applicantName || FALLBACK_APPLICANT_NAME,
        );
      }
    }
  }
}

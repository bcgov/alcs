import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Any, Repository } from 'typeorm';
import { OwnerType } from '../../../common/owner-type/owner-type.entity';
import { User } from '../../../user/user.entity';
import { ApplicationSubmission } from '../application-submission.entity';
import { ApplicationSubmissionService } from '../application-submission.service';
import {
  CovenantTransfereeCreateDto,
  CovenantTransfereeUpdateDto,
} from './covenant-transferee.dto';
import { CovenantTransferee } from './covenant-transferee.entity';

@Injectable()
export class CovenantTransfereeService {
  constructor(
    @InjectRepository(CovenantTransferee)
    private repository: Repository<CovenantTransferee>,
    @InjectRepository(OwnerType)
    private typeRepository: Repository<OwnerType>,
    @Inject(forwardRef(() => ApplicationSubmissionService))
    private applicationSubmissionService: ApplicationSubmissionService,
  ) {}

  async fetchBySubmissionUuid(uuid: string) {
    return this.repository.find({
      where: {
        applicationSubmissionUuid: uuid,
      },
      relations: {
        type: true,
      },
    });
  }

  async create(
    createDto: CovenantTransfereeCreateDto,
    applicationSubmission: ApplicationSubmission,
    user: User,
  ) {
    const type = await this.typeRepository.findOneOrFail({
      where: {
        code: createDto.typeCode,
      },
    });

    const newOwner = new CovenantTransferee({
      firstName: createDto.firstName,
      lastName: createDto.lastName,
      organizationName: createDto.organizationName,
      email: createDto.email,
      phoneNumber: createDto.phoneNumber,
      applicationSubmission: applicationSubmission,
      type,
    });

    return await this.repository.save(newOwner);
  }

  async save(owner: CovenantTransferee) {
    await this.repository.save(owner);
  }

  async update(
    uuid: string,
    updateDto: CovenantTransfereeUpdateDto,
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

    return await this.repository.save(existingOwner);
  }

  async delete(owner: CovenantTransferee) {
    return await this.repository.remove(owner);
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
}

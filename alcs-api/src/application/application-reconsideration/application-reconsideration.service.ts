import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Card } from '../../card/card.entity';
import { CodeService } from '../../code/code.service';
import {
  ServiceNotFoundException,
  ServiceValidationException,
} from '../../common/exceptions/base.exception';
import { Application } from '../application.entity';
import { ApplicationReconsideration } from './application-reconsideration.entity';
import {
  ApplicationReconsiderationCreateDto,
  ApplicationReconsiderationUpdateDto,
} from './applicationReconsideration.dto';

@Injectable()
export class ApplicationReconsiderationService {
  constructor(
    @InjectRepository(ApplicationReconsideration)
    private reconsiderationRepository: Repository<ApplicationReconsideration>,
    @InjectMapper() private mapper: Mapper,

    private codeService: CodeService,
  ) {}

  async create(reconsideration: ApplicationReconsiderationCreateDto) {
    const type = await this.fetchAndValidateType(reconsideration.typeCode);

    const mappedReconsideration = this.mapper.map(
      reconsideration,
      ApplicationReconsiderationCreateDto,
      ApplicationReconsideration,
    );

    const newReconsideration = Object.assign(
      new ApplicationReconsideration(),
      mappedReconsideration,
    );
    newReconsideration.card = new Card();
    newReconsideration.type = type;

    if (!newReconsideration.applicationUuid) {
      const applicationType = await this.codeService.fetchApplicationType(
        reconsideration.applicationType,
      );
      if (!applicationType) {
        throw new ServiceNotFoundException(
          `Provided application type does not exist ${reconsideration.applicationType}`,
        );
      }

      // if application does not exist => create it and link to reconsideration.
      // Application card must not be created
      const mappedApplication = this.mapper.map(
        reconsideration,
        ApplicationReconsiderationCreateDto,
        Application,
      );
      newReconsideration.application = Object.assign(
        new Application(),
        mappedApplication,
      );
      newReconsideration.application.type = applicationType;
    }

    return this.reconsiderationRepository.save(newReconsideration);
  }

  async update(
    uuid: string,
    reconsideration: ApplicationReconsiderationUpdateDto,
  ) {
    const existingReconsideration = await this.fetchAndValidateReconsideration(
      uuid,
    );

    const updatedReconsideration = Object.assign(
      existingReconsideration,
      reconsideration,
    );

    const type = await this.fetchAndValidateType(reconsideration.typeCode);
    updatedReconsideration.type = type;
    if (
      (reconsideration.typeCode === '33' &&
        updatedReconsideration.isReviewApproved === null) ||
      updatedReconsideration.isReviewApproved === undefined
    ) {
      throw new ServiceValidationException(
        'Review outcome is required for reconsideration of type 33',
      );
    }

    return this.reconsiderationRepository.save(updatedReconsideration);
  }

  private async fetchAndValidateType(code) {
    const type = await this.codeService.fetchReconsiderationType(code);

    if (!type) {
      throw new ServiceNotFoundException(
        `Provided reconsideration type does not exist ${code}`,
      );
    }

    return type;
  }

  async delete(uuid: string) {
    const reconToDelete = await this.fetchAndValidateReconsideration(uuid);
    return this.reconsiderationRepository.softRemove([reconToDelete]);
  }

  private async fetchAndValidateReconsideration(uuid: string) {
    const recon = await this.reconsiderationRepository.findOneByOrFail({
      uuid,
    });

    if (!recon) {
      throw new ServiceNotFoundException(
        `Reconsideration with uuid ${uuid} not found`,
      );
    }

    return recon;
  }
}

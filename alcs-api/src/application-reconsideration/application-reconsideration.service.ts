import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindOptionsRelations,
  FindOptionsWhere,
  IsNull,
  Repository,
} from 'typeorm';
import { ApplicationService } from '../application/application.service';
import { Board } from '../board/board.entity';
import { CardService } from '../card/card.service';
import { ServiceNotFoundException } from '../common/exceptions/base.exception';
import { formatIncomingDate } from '../utils/incoming-date.formatter';
import {
  ApplicationReconsiderationCreateDto,
  ApplicationReconsiderationDto,
  ApplicationReconsiderationUpdateDto,
  ApplicationReconsiderationWithoutApplicationDto,
  ReconsiderationTypeDto,
} from './application-reconsideration.dto';
import { ApplicationReconsideration } from './application-reconsideration.entity';
import { ApplicationReconsiderationType } from './reconsideration-type/application-reconsideration-type.entity';

@Injectable()
export class ApplicationReconsiderationService {
  constructor(
    @InjectRepository(ApplicationReconsideration)
    private reconsiderationRepository: Repository<ApplicationReconsideration>,
    @InjectMapper() private mapper: Mapper,
    private applicationService: ApplicationService,
    private cardService: CardService,
    @InjectRepository(ApplicationReconsiderationType)
    private reconsiderationTypeRepository: Repository<ApplicationReconsiderationType>,
  ) {}

  private DEFAULT_RECONSIDERATION_RELATIONS: FindOptionsRelations<ApplicationReconsideration> =
    {
      application: {
        type: true,
        region: true,
        localGovernment: true,
        decisionMeetings: true,
      },
      card: {
        board: true,
        type: true,
        status: true,
        assignee: true,
      },
      type: true,
    };

  getByBoardCode(boardCode: string) {
    return this.getBy({ card: { board: { code: boardCode } } });
  }

  getByApplication(applicationFileNumber: string) {
    return this.getBy({ application: { fileNumber: applicationFileNumber } });
  }

  getBy(findOptions: FindOptionsWhere<ApplicationReconsideration>) {
    return this.reconsiderationRepository.find({
      where: findOptions,
      relations: this.DEFAULT_RECONSIDERATION_RELATIONS,
    });
  }

  mapToDtos(
    reconsiderations: ApplicationReconsideration[],
  ): Promise<ApplicationReconsiderationDto[]> {
    return this.mapper.mapArrayAsync(
      reconsiderations,
      ApplicationReconsideration,
      ApplicationReconsiderationDto,
    );
  }

  mapToDtosWithoutApplication(
    reconsiderations: ApplicationReconsideration[],
  ): Promise<ApplicationReconsiderationWithoutApplicationDto[]> {
    return this.mapper.mapArrayAsync(
      reconsiderations,
      ApplicationReconsideration,
      ApplicationReconsiderationWithoutApplicationDto,
    );
  }

  async create(
    reconsideration: ApplicationReconsiderationCreateDto,
    board: Board,
  ) {
    const type = await this.getReconsiderationType(
      reconsideration.reconTypeCode,
    );

    const newReconsideration = new ApplicationReconsideration({
      submittedDate: new Date(reconsideration.submittedDate),
    });

    newReconsideration.card = await this.cardService.create(
      'RECON',
      board,
      false,
    );
    newReconsideration.type = type;

    newReconsideration.application = await this.getOrCreateApplication(
      reconsideration,
    );

    const recon = await this.reconsiderationRepository.save(newReconsideration);
    return this.getByUuid(recon.uuid);
  }

  private async getOrCreateApplication(
    reconsideration: ApplicationReconsiderationCreateDto,
  ) {
    const existingApplication = await this.applicationService.get(
      reconsideration.applicationFileNumber,
    );

    if (existingApplication) {
      return existingApplication;
    } else {
      return await this.applicationService.create(
        {
          fileNumber: reconsideration.applicationFileNumber,
          type: reconsideration.applicationTypeCode,
          region: reconsideration.region,
          localGovernmentUuid: reconsideration.localGovernmentUuid,
          applicant: reconsideration.applicant,
          dateReceived: reconsideration.submittedDate,
        },
        false,
      );
    }
  }

  async update(uuid: string, updates: ApplicationReconsiderationUpdateDto) {
    const existingReconsideration = await this.fetchAndValidateReconsideration(
      uuid,
    );

    existingReconsideration.reviewDate = formatIncomingDate(updates.reviewDate);
    existingReconsideration.submittedDate = formatIncomingDate(
      updates.submittedDate,
    );

    existingReconsideration.type = await this.getReconsiderationType(
      updates.typeCode,
    );

    if (existingReconsideration.type.code === '33.1') {
      existingReconsideration.isReviewApproved = null;
      existingReconsideration.reviewDate = null;
    } else {
      existingReconsideration.isReviewApproved = updates.isReviewApproved;
    }

    const recon = await this.reconsiderationRepository.save(
      existingReconsideration,
    );

    return this.getByUuid(recon.uuid);
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

  getByCardUuid(cardUuid: string) {
    return this.getOneByOrFail({ cardUuid });
  }

  getByUuid(uuid: string) {
    return this.getOneByOrFail({ uuid });
  }

  getOneByOrFail(findOptions: FindOptionsWhere<ApplicationReconsideration>) {
    return this.reconsiderationRepository.findOneOrFail({
      where: findOptions,
      relations: this.DEFAULT_RECONSIDERATION_RELATIONS,
    });
  }

  getSubtasks(subtaskType: string) {
    return this.reconsiderationRepository.find({
      where: {
        card: {
          subtasks: {
            completedAt: IsNull(),
            type: {
              type: subtaskType,
            },
          },
        },
      },
      relations: {
        application: {
          type: true,
          decisionMeetings: true,
          localGovernment: true,
        },
        card: {
          status: true,
          board: true,
          type: true,
          subtasks: { type: true, assignee: true },
        },
      },
    });
  }

  async getCodes() {
    const codes = await this.reconsiderationTypeRepository.find({
      order: { label: 'ASC' },
    });
    return this.mapper.mapArrayAsync(
      codes,
      ApplicationReconsiderationType,
      ReconsiderationTypeDto,
    );
  }

  async getReconsiderationType(
    code: string,
  ): Promise<ApplicationReconsiderationType> {
    return this.reconsiderationTypeRepository.findOneByOrFail({
      code,
    });
  }
}

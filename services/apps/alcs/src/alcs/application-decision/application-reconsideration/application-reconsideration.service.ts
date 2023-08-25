import { ServiceNotFoundException } from '@app/common/exceptions/base.exception';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindOptionsRelations,
  FindOptionsWhere,
  In,
  IsNull,
  Not,
  Repository,
} from 'typeorm';
import { ApplicationService } from '../../application/application.service';
import { Board } from '../../board/board.entity';
import { CARD_TYPE } from '../../card/card-type/card-type.entity';
import { CardService } from '../../card/card.service';
import { ApplicationDecisionV1Service } from '../application-decision-v1/application-decision/application-decision-v1.service';
import {
  ApplicationReconsiderationCreateDto,
  ApplicationReconsiderationDto,
  ApplicationReconsiderationUpdateDto,
  ReconsiderationTypeDto,
} from './application-reconsideration.dto';
import { ApplicationReconsideration } from './application-reconsideration.entity';
import { ApplicationReconsiderationType } from './reconsideration-type/application-reconsideration-type.entity';

export const enum RECONSIDERATION_TYPE {
  T_33 = '33',
  T_33_1 = '33.1',
}

@Injectable()
export class ApplicationReconsiderationService {
  constructor(
    @InjectMapper() private mapper: Mapper,
    @InjectRepository(ApplicationReconsideration)
    private reconsiderationRepository: Repository<ApplicationReconsideration>,
    @InjectRepository(ApplicationReconsiderationType)
    private reconsiderationTypeRepository: Repository<ApplicationReconsiderationType>,
    private applicationService: ApplicationService,
    private cardService: CardService,
    private applicationDecisionService: ApplicationDecisionV1Service,
  ) {}

  private DEFAULT_CARD_RELATIONS = {
    board: true,
    type: true,
    status: true,
    assignee: true,
  };

  private BOARD_RECONSIDERATION_RELATIONS: FindOptionsRelations<ApplicationReconsideration> =
    {
      application: {
        type: true,
        region: true,
        localGovernment: true,
        decisionMeetings: true,
      },
      card: { ...this.DEFAULT_CARD_RELATIONS, board: false },
      type: true,
    };

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
      reconsidersDecisions: true,
      resultingDecision: true,
      reviewOutcome: true,
    };

  getByBoard(boardUuid: string) {
    return this.reconsiderationRepository.find({
      where: { card: { boardUuid } },
      relations: this.BOARD_RECONSIDERATION_RELATIONS,
    });
  }

  getByApplication(applicationFileNumber: string) {
    return this.getBy({ application: { fileNumber: applicationFileNumber } });
  }

  getDeletedCards(applicationFileNumber: string) {
    return this.reconsiderationRepository.find({
      where: {
        application: {
          fileNumber: applicationFileNumber,
        },
        card: {
          auditDeletedDateAt: Not(IsNull()),
        },
      },
      withDeleted: true,
      relations: this.DEFAULT_RECONSIDERATION_RELATIONS,
    });
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

  async create(createDto: ApplicationReconsiderationCreateDto, board: Board) {
    const type = await this.getReconsiderationType(createDto.reconTypeCode);

    const reconsideration = new ApplicationReconsideration({
      submittedDate: new Date(createDto.submittedDate),
      type,
    });

    reconsideration.card = await this.cardService.create(
      CARD_TYPE.RECON,
      board,
      false,
    );

    reconsideration.application = await this.getOrCreateApplication(createDto);

    reconsideration.reconsidersDecisions =
      await this.applicationDecisionService.getMany(
        createDto.reconsideredDecisionUuids,
      );

    if (createDto.reconTypeCode === RECONSIDERATION_TYPE.T_33) {
      reconsideration.reviewOutcomeCode = 'PEN';
    }

    const recon = await this.reconsiderationRepository.save(reconsideration);
    return this.getByUuid(recon.uuid);
  }

  private async getOrCreateApplication(
    createDto: ApplicationReconsiderationCreateDto,
  ) {
    const existingApplication = await this.applicationService.get(
      createDto.applicationFileNumber,
    );

    if (existingApplication) {
      return existingApplication;
    } else {
      return await this.applicationService.create(
        {
          fileNumber: createDto.applicationFileNumber,
          typeCode: createDto.applicationTypeCode,
          regionCode: createDto.regionCode,
          localGovernmentUuid: createDto.localGovernmentUuid,
          applicant: createDto.applicant,
        },
        false,
      );
    }
  }

  async update(uuid: string, updateDto: ApplicationReconsiderationUpdateDto) {
    const reconsideration = await this.fetchAndValidateReconsideration(uuid);

    if (updateDto.reviewDate !== undefined) {
      reconsideration.reviewDate = updateDto.reviewDate
        ? new Date(updateDto.reviewDate)
        : null;
    }

    if (updateDto.submittedDate) {
      reconsideration.submittedDate = new Date(updateDto.submittedDate);
    }

    if (updateDto.typeCode) {
      reconsideration.type = await this.getReconsiderationType(
        updateDto.typeCode,
      );
    }

    reconsideration.reviewOutcomeCode = updateDto.reviewOutcomeCode;

    if (
      reconsideration.type.code === RECONSIDERATION_TYPE.T_33 &&
      updateDto.reviewOutcomeCode === null
    ) {
      reconsideration.reviewOutcomeCode = 'PEN';
    }

    if (reconsideration.type.code === RECONSIDERATION_TYPE.T_33_1) {
      reconsideration.reviewOutcomeCode = null;
      reconsideration.reviewDate = null;
    }

    if (updateDto.reconsideredDecisionUuids) {
      reconsideration.reconsidersDecisions =
        await this.applicationDecisionService.getMany(
          updateDto.reconsideredDecisionUuids,
        );
    }

    const recon = await this.reconsiderationRepository.save(reconsideration);

    return this.getByUuid(recon.uuid);
  }

  async delete(uuid: string) {
    const reconToDelete = await this.fetchAndValidateReconsideration(uuid);
    await this.cardService.archive(reconToDelete.cardUuid);
    return this.reconsiderationRepository.softRemove([reconToDelete]);
  }

  private async fetchAndValidateReconsideration(uuid: string) {
    const recon = await this.reconsiderationRepository.findOne({
      where: { uuid },
      relations: {
        type: true,
      },
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

  getWithIncompleteSubtaskByType(subtaskType: string) {
    return this.reconsiderationRepository.find({
      where: {
        card: {
          subtasks: {
            completedAt: IsNull(),
            type: {
              code: subtaskType,
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

  getMany(reconUuids: string[]) {
    return this.reconsiderationRepository.find({
      where: {
        uuid: In(reconUuids),
      },
      relations: this.DEFAULT_RECONSIDERATION_RELATIONS,
    });
  }
}

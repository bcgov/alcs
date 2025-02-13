import { forwardRef, Inject, Injectable } from '@nestjs/common';
import {
  ApplicationDecisionConditionCardBoardDto,
  CreateApplicationDecisionConditionCardDto,
  UpdateApplicationDecisionConditionCardDto,
} from './application-decision-condition-card.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ApplicationDecisionConditionCard } from './application-decision-condition-card.entity';
import { FindOptionsOrder, FindOptionsWhere, IsNull, Not, Repository } from 'typeorm';
import { CardService } from '../../../card/card.service';
import { ApplicationDecisionConditionService } from '../application-decision-condition.service';
import { BoardService } from '../../../board/board.service';
import {
  ServiceInternalErrorException,
  ServiceNotFoundException,
  ServiceValidationException,
} from '../../../../../../../libs/common/src/exceptions/base.exception';
import { Card } from '../../../card/card.entity';
import { CARD_TYPE } from '../../../card/card-type/card-type.entity';
import { ApplicationDecisionV2Service } from '../../application-decision-v2/application-decision/application-decision-v2.service';
import { Board } from '../../../board/board.entity';
import { InjectMapper } from 'automapper-nestjs';
import { Mapper } from 'automapper-core';
import { ApplicationType } from '../../../code/application-code/application-type/application-type.entity';
import { ApplicationTypeDto } from '../../../code/application-code/application-type/application-type.dto';
import { ApplicationDecision } from '../../application-decision.entity';
import { ApplicationModificationService } from '../../application-modification/application-modification.service';
import { ApplicationReconsiderationService } from '../../application-reconsideration/application-reconsideration.service';

@Injectable()
export class ApplicationDecisionConditionCardService {
  CARD_RELATIONS = {
    board: true,
    type: true,
    status: true,
    assignee: true,
  };

  BOARD_CARD_RELATIONS = {
    card: this.CARD_RELATIONS,
    conditions: true,
    decision: {
      application: {
        type: true,
      },
    },
  };

  DEFAULT_RELATIONS = {
    conditions: true,
    card: this.CARD_RELATIONS,
    decision: {
      application: true,
    },
  };

  constructor(
    @InjectRepository(ApplicationDecisionConditionCard)
    private repository: Repository<ApplicationDecisionConditionCard>,
    private applicationDecisionConditionService: ApplicationDecisionConditionService,
    @Inject(forwardRef(() => ApplicationDecisionV2Service))
    private applicationDecisionService: ApplicationDecisionV2Service,
    private boardService: BoardService,
    @Inject(forwardRef(() => CardService))
    private cardService: CardService,
    private applicationModificationService: ApplicationModificationService,
    private applicationReconsiderationService: ApplicationReconsiderationService,
    @InjectMapper() private mapper: Mapper,
  ) {}

  async create(dto: CreateApplicationDecisionConditionCardDto) {
    let board: Board;
    try {
      board = await this.boardService.getApplicationDecisionConditionBoard();
    } catch (error) {
      throw new ServiceNotFoundException('Failed to fetch Application Decision Condition Board');
    }

    if (!board.statuses.find((status) => status.statusCode === dto.cardStatusCode)) {
      throw new ServiceValidationException(`Invalid card status code: ${dto.cardStatusCode}`);
    }

    let decision: ApplicationDecision;
    try {
      decision = await this.applicationDecisionService.get(dto.decisionUuid);
    } catch (error) {
      throw new ServiceNotFoundException(`Failed to fetch decision with uuid ${dto.decisionUuid}`);
    }

    const card = new Card();
    card.typeCode = CARD_TYPE.APP_CON;
    card.statusCode = dto.cardStatusCode;
    card.boardUuid = board.uuid;
    const newCard = await this.cardService.save(card);

    if (!newCard) {
      throw new ServiceInternalErrorException('Failed to create card');
    }

    const conditions = await this.applicationDecisionConditionService.findByUuids(dto.conditionsUuids);

    if (conditions.length !== dto.conditionsUuids.length) {
      throw new ServiceValidationException('Failed to fetch all conditions');
    }

    const applicationDecisionConditionCard = new ApplicationDecisionConditionCard();
    applicationDecisionConditionCard.cardUuid = newCard.uuid;
    applicationDecisionConditionCard.conditions = conditions;
    applicationDecisionConditionCard.decision = decision;

    return this.repository.save(applicationDecisionConditionCard);
  }

  async get(uuid: string): Promise<ApplicationDecisionConditionCard> {
    const applicationDecisionConditionCard = await this.repository.findOne({
      where: { uuid },
      relations: this.DEFAULT_RELATIONS,
    });

    if (!applicationDecisionConditionCard) {
      throw new ServiceNotFoundException(`ApplicationDecisionConditionCard with uuid ${uuid} not found`);
    }

    return applicationDecisionConditionCard;
  }

  async update(uuid: string, dto: UpdateApplicationDecisionConditionCardDto) {
    const applicationDecisionConditionCard = await this.get(uuid);

    if (dto.conditionsUuids && dto.conditionsUuids.length > 0) {
      const conditions = await this.applicationDecisionConditionService.findByUuids(dto.conditionsUuids);

      if (conditions.length !== dto.conditionsUuids.length) {
        throw new ServiceValidationException('Failed to fetch all conditions');
      }

      applicationDecisionConditionCard.conditions = conditions;
    }

    if (dto.cardStatusCode) {
      let board: Board;
      try {
        board = await this.boardService.getApplicationDecisionConditionBoard();
      } catch (error) {
        throw new ServiceNotFoundException('Failed to fetch Application Decision Condition Board');
      }

      if (!board.statuses.find((status) => status.statusCode === dto.cardStatusCode)) {
        throw new ServiceValidationException(`Invalid card status code: ${dto.cardStatusCode}`);
      }

      applicationDecisionConditionCard.card.statusCode = dto.cardStatusCode;
    }

    return this.repository.save(applicationDecisionConditionCard);
  }

  async softRemove(decisionConditionCard: ApplicationDecisionConditionCard) {
    const card = await this.cardService.get(decisionConditionCard.cardUuid);
    if (!card) {
      throw new ServiceNotFoundException(`Card with uuid ${decisionConditionCard.cardUuid} not found`);
    }

    await this.cardService.softRemoveByUuid(card.uuid);
    return this.repository.softRemove(decisionConditionCard);
  }

  async getByBoard(boardUuid: string): Promise<ApplicationDecisionConditionCard[]> {
    return await this.repository.find({
      where: { card: { boardUuid } },
      relations: this.BOARD_CARD_RELATIONS,
    });
  }

  async getByBoardCard(uuid: string): Promise<ApplicationDecisionConditionCard> {
    const res = await this.repository.findOne({ where: { cardUuid: uuid }, relations: this.BOARD_CARD_RELATIONS });
    if (!res) {
      throw new ServiceNotFoundException(`Could not find card with UUID ${uuid}`);
    }

    return res;
  }

  async mapToBoardDtos(applicationDecisionConditionCards: ApplicationDecisionConditionCard[]) {
    const dtos = applicationDecisionConditionCards.map((card) => {
      const dto = this.mapper.map(card, ApplicationDecisionConditionCard, ApplicationDecisionConditionCardBoardDto);
      dto.applicant = card.decision.application.applicant;
      dto.fileNumber = card.decision.application.fileNumber;
      dto.type = this.mapper.map(card.decision.application.type, ApplicationType, ApplicationTypeDto);
      return dto;
    });

    for (const dto of dtos) {
      const appModifications = await this.applicationModificationService.getByApplicationDecisionUuid(dto.decisionUuid);
      const appReconsiderations = await this.applicationReconsiderationService.getByApplicationDecisionUuid(
        dto.decisionUuid,
      );

      dto.isModification = appModifications.length > 0;
      dto.isReconsideration = appReconsiderations.length > 0;

      for (const condition of dto.conditions) {
        const status = await this.applicationDecisionService.getDecisionConditionStatus(condition.uuid);
        condition.status = status !== '' ? status : undefined;
      }
    }
    return dtos;
  }

  async archiveByBoardCard(boardCardUuid: string) {
    const decisionConditionCard = await this.getByBoardCard(boardCardUuid);

    if (!decisionConditionCard) {
      throw new ServiceNotFoundException(`Card with uuid ${boardCardUuid} not found`);
    }
    decisionConditionCard.conditions = [];
    await this.repository.save(decisionConditionCard);

    await this.repository.softRemove(decisionConditionCard);
  }

  async recoverByBoardCard(boardCardUuid: string) {
    const decisionConditionCard = await this.repository.findOne({
      where: { cardUuid: boardCardUuid },
      withDeleted: true,
      relations: this.DEFAULT_RELATIONS,
    });

    if (!decisionConditionCard) {
      throw new ServiceNotFoundException(`Card with uuid ${boardCardUuid} not found`);
    }

    await this.repository.recover(decisionConditionCard);
  }

  async getDeletedCards(fileNumber: string) {
    return this.repository.find({
      where: {
        decision: {
          application: {
            fileNumber,
          },
          auditDeletedDateAt: IsNull(),
        },
        card: {
          auditDeletedDateAt: Not(IsNull()),
        },
      },
      withDeleted: true,
      relations: {
        decision: {
          application: true,
        },
        card: this.CARD_RELATIONS,
      },
    });
  }

  async getMany(
    findOptions?: FindOptionsWhere<ApplicationDecisionConditionCard>,
    sortOptions?: FindOptionsOrder<ApplicationDecisionConditionCard>,
  ): Promise<ApplicationDecisionConditionCard[]> {
    return await this.repository.find({
      where: findOptions,
      relations: this.DEFAULT_RELATIONS,
      order: sortOptions,
    });
  }
}

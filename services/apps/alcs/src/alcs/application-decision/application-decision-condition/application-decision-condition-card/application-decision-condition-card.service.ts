import { Injectable } from '@nestjs/common';
import {
  ApplicationDecisionConditionCardBoardDto,
  ApplicationDecisionConditionCardDto,
  CreateApplicationDecisionConditionCardDto,
  UpdateApplicationDecisionConditionBoardCardDto,
  UpdateApplicationDecisionConditionCardDto,
} from './application-decision-condition-card.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ApplicationDecisionConditionCard } from './application-decision-condition-card.entity';
import { Repository } from 'typeorm';
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
import { ApplicationDecisionConditionDateService } from '../application-decision-condition-date/application-decision-condition-date.service';
import { Application } from '../../../application/application.entity';
import { ApplicationDto } from '../../../application/application.dto';
import { ApplicationType } from '../../../code/application-code/application-type/application-type.entity';
import { ApplicationTypeDto } from '../../../code/application-code/application-type/application-type.dto';
import { ApplicationDecision } from '../../application-decision.entity';

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

  private DEFAULT_RELATIONS = {
    conditions: true,
    card: true,
    decision: {
      application: true,
    },
  };

  constructor(
    @InjectRepository(ApplicationDecisionConditionCard)
    private repository: Repository<ApplicationDecisionConditionCard>,
    private applicationDecisionConditionService: ApplicationDecisionConditionService,
    private applicationDecisionService: ApplicationDecisionV2Service,
    private boardService: BoardService,
    private cardService: CardService,
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
      relations: ['conditions', 'decision'],
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
      for (const condition of dto.conditions) {
        const status = await this.applicationDecisionService.getDecisionConditionStatus(condition.uuid);
        condition.status = status !== '' ? status : undefined;
      }
    }
    return dtos;
  }
}

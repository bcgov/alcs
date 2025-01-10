import { Injectable } from '@nestjs/common';
import {
  ApplicationDecisionConditionCardBoardDto,
  ApplicationDecisionConditionCardDto,
  CreateApplicationDecisionConditionCardDto,
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

@Injectable()
export class ApplicationDecisionConditionCardService {
  private CARD_RELATIONS = {
    board: true,
    type: true,
    status: true,
    assignee: true,
  };

  private DEFAULT_RELATIONS = {
    card: this.CARD_RELATIONS,
    conditions: true,
    decision: true,
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
    console.log(dto);
    let board: Board;
    try {
      board = await this.boardService.getApplicationDecisionConditionBoard();
    } catch (error) {
      throw new ServiceNotFoundException('Failed to fetch Application Decision Condition Board');
    }

    if (!board.statuses.find((status) => status.statusCode === dto.cardStatusCode)) {
      throw new ServiceValidationException(`Invalid card status code: ${dto.cardStatusCode}`);
    }

    const decision = await this.applicationDecisionService.get(dto.decisionUuid);
    if (!decision) {
      throw new ServiceNotFoundException(`Failed to fetch decision with uuid ${dto.decisionUuid}`);
    }

    const card = new Card();
    card.typeCode = CARD_TYPE.APP;
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

    const conditions = await this.applicationDecisionConditionService.findByUuids(dto.conditionsUuids);

    if (conditions.length !== dto.conditionsUuids.length) {
      throw new ServiceValidationException('Failed to fetch all conditions');
    }

    applicationDecisionConditionCard.conditions = conditions;

    return this.repository.save(applicationDecisionConditionCard);
  }

  async getByBoard(boardUuid: string): Promise<ApplicationDecisionConditionCard[]> {
    return this.repository.find({
      where: { card: { boardUuid } },
      relations: this.DEFAULT_RELATIONS,
    });
  }

  async mapToBoardDtos(applicationDecisionConditionCards: ApplicationDecisionConditionCard[]) {
    return applicationDecisionConditionCards.map((card) =>
      this.mapper.map(card, ApplicationDecisionConditionCard, ApplicationDecisionConditionCardBoardDto),
    );
  }
}

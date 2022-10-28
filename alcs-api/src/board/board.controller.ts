import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { ApplicationAmendmentService } from '../application-amendment/application-amendment.service';
import { ApplicationReconsiderationService } from '../application-reconsideration/application-reconsideration.service';
import { ApplicationService } from '../application/application.service';
import { CardCreateDto } from '../card/card.dto';
import { CardService } from '../card/card.service';
import { RolesGuard } from '../common/authorization/roles-guard.service';
import {
  ANY_AUTH_ROLE,
  ROLES_ALLOWED_BOARDS,
} from '../common/authorization/roles';
import { UserRoles } from '../common/authorization/roles.decorator';
import { ServiceValidationException } from '../common/exceptions/base.exception';
import { PlanningReviewService } from '../planning-review/planning-review.service';
import { BoardDto } from './board.dto';
import { Board } from './board.entity';
import { BoardService } from './board.service';

@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@Controller('board')
@UseGuards(RolesGuard)
export class BoardController {
  constructor(
    private boardService: BoardService,
    private applicationService: ApplicationService,
    private cardService: CardService,
    private reconsiderationService: ApplicationReconsiderationService,
    private planningReviewService: PlanningReviewService,
    private amendmentService: ApplicationAmendmentService,
    @InjectMapper() private autoMapper: Mapper,
  ) {}

  @Get()
  @UserRoles(...ANY_AUTH_ROLE)
  async getBoards() {
    const boards = await this.boardService.list();
    return this.autoMapper.mapArray(boards, Board, BoardDto);
  }

  @Get('/:boardCode')
  @UserRoles(...ROLES_ALLOWED_BOARDS)
  async getCards(@Param('boardCode') boardCode: string) {
    const applications = await this.boardService.getApplicationsByCode(
      boardCode,
    );

    const recons = await this.reconsiderationService.getByBoardCode(boardCode);

    let planningReviews = [];
    if (boardCode === 'exec') {
      planningReviews = await this.planningReviewService.getCards();
    }

    let amendments = [];
    if (boardCode === 'ceo') {
      amendments = await this.amendmentService.getByBoardCode(boardCode);
    }

    return {
      applications: await this.applicationService.mapToDtos(applications),
      reconsiderations: await this.reconsiderationService.mapToDtos(recons),
      planningReviews: await this.planningReviewService.mapToDtos(
        planningReviews,
      ),
      amendments: await this.amendmentService.mapToDtos(amendments),
    };
  }

  @Post('/change')
  @UserRoles(...ROLES_ALLOWED_BOARDS)
  async changeBoard(
    @Body()
    { cardUuid, boardCode }: { cardUuid: string; boardCode: string },
  ) {
    return this.boardService.changeBoard(cardUuid, boardCode);
  }

  @Post('/card')
  @UserRoles(...ROLES_ALLOWED_BOARDS)
  async createCard(
    @Body()
    card: CardCreateDto,
  ): Promise<any> {
    const board = await this.boardService.getOne({
      code: card.boardCode,
    });
    if (!board) {
      throw new ServiceValidationException(
        `Board with code ${card.boardCode} not found`,
      );
    }

    return this.cardService.create(card.typeCode, board);
  }

  @Get('/card/:uuid')
  @UserRoles(...ROLES_ALLOWED_BOARDS)
  async getCard(@Param('uuid') cardUuid: string) {
    const card = await this.cardService.get(cardUuid);

    return this.cardService.mapToDetailedDto(card);
  }
}

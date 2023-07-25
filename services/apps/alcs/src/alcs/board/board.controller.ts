import { ServiceValidationException } from '@app/common/exceptions/base.exception';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import {
  ANY_AUTH_ROLE,
  ROLES_ALLOWED_BOARDS,
} from '../../common/authorization/roles';
import { RolesGuard } from '../../common/authorization/roles-guard.service';
import { UserRoles } from '../../common/authorization/roles.decorator';
import { ApplicationModificationService } from '../application-decision/application-modification/application-modification.service';
import { ApplicationReconsiderationService } from '../application-decision/application-reconsideration/application-reconsideration.service';
import { ApplicationService } from '../application/application.service';
import { CARD_TYPE } from '../card/card-type/card-type.entity';
import { CardCreateDto } from '../card/card.dto';
import { CardService } from '../card/card.service';
import { CovenantService } from '../covenant/covenant.service';
import { NoticeOfIntentModificationService } from '../notice-of-intent-decision/notice-of-intent-modification/notice-of-intent-modification.service';
import { NoticeOfIntentService } from '../notice-of-intent/notice-of-intent.service';
import { PlanningReviewService } from '../planning-review/planning-review.service';
import { BoardDto, MinimalBoardDto } from './board.dto';
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
    private appModificationService: ApplicationModificationService,
    private noiModificationService: NoticeOfIntentModificationService,
    private covenantService: CovenantService,
    private noticeOfIntentService: NoticeOfIntentService,
    @InjectMapper() private autoMapper: Mapper,
  ) {}

  @Get()
  @UserRoles(...ANY_AUTH_ROLE)
  async getBoards() {
    const boards = await this.boardService.list();
    return this.autoMapper.mapArray(boards, Board, MinimalBoardDto);
  }

  @Get('/:boardCode')
  @UserRoles(...ROLES_ALLOWED_BOARDS)
  async getBoardDetail(@Param('boardCode') boardCode: string) {
    const board = await this.boardService.getOneOrFail({
      code: boardCode,
    });

    return await this.autoMapper.mapAsync(board, Board, BoardDto);
  }

  @Get('/:boardCode/cards')
  @UserRoles(...ROLES_ALLOWED_BOARDS)
  async getBoardWithCards(@Param('boardCode') boardCode: string) {
    const board = await this.boardService.getOneOrFail({
      code: boardCode,
    });

    const allowedCodes = board.allowedCardTypes.map((type) => type.code);

    const applications = allowedCodes.includes(CARD_TYPE.APP)
      ? await this.applicationService.getByBoard(board.uuid)
      : [];

    const recons = allowedCodes.includes(CARD_TYPE.RECON)
      ? await this.reconsiderationService.getByBoard(board.uuid)
      : [];

    const modifications = allowedCodes.includes(CARD_TYPE.APP_MODI)
      ? await this.appModificationService.getByBoard(board.uuid)
      : [];

    const covenants = allowedCodes.includes(CARD_TYPE.COV)
      ? await this.covenantService.getByBoard(board.uuid)
      : [];

    const noticeOfIntents = allowedCodes.includes(CARD_TYPE.NOI)
      ? await this.noticeOfIntentService.getByBoard(board.uuid)
      : [];

    const planningReviews = allowedCodes.includes(CARD_TYPE.PLAN)
      ? await this.planningReviewService.getByBoard(board.uuid)
      : [];

    const noiModifications = allowedCodes.includes(CARD_TYPE.NOI_MODI)
      ? await this.noiModificationService.getByBoard(board.uuid)
      : [];

    return {
      board: await this.autoMapper.mapAsync(board, Board, BoardDto),
      applications: await this.applicationService.mapToDtos(applications),
      reconsiderations: await this.reconsiderationService.mapToDtos(recons),
      planningReviews: await this.planningReviewService.mapToDtos(
        planningReviews,
      ),
      modifications: await this.appModificationService.mapToDtos(modifications),
      covenants: await this.covenantService.mapToDtos(covenants),
      noticeOfIntents: await this.noticeOfIntentService.mapToDtos(
        noticeOfIntents,
      ),
      noiModifications: await this.noiModificationService.mapToDtos(
        noiModifications,
      ),
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
    const board = await this.boardService.getOneOrFail({
      code: card.boardCode,
    });
    return this.cardService.create(card.typeCode, board);
  }

  @Get('/card/:uuid')
  @UserRoles(...ROLES_ALLOWED_BOARDS)
  async getCard(@Param('uuid') cardUuid: string) {
    const card = await this.cardService.get(cardUuid);
    if (!card) {
      throw new ServiceValidationException(`Card ${cardUuid} not found`);
    }
    return this.cardService.mapToDetailedDto(card);
  }
}

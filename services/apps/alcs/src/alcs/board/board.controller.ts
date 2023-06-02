import { ServiceValidationException } from '@app/common/exceptions/base.exception';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { ApplicationService } from '../application/application.service';
import { CardCreateDto } from '../card/card.dto';
import { CardService } from '../card/card.service';
import {
  ANY_AUTH_ROLE,
  ROLES_ALLOWED_BOARDS,
} from '../../common/authorization/roles';
import { RolesGuard } from '../../common/authorization/roles-guard.service';
import { UserRoles } from '../../common/authorization/roles.decorator';
import { CovenantService } from '../covenant/covenant.service';
import { ApplicationModification } from '../decision/application-modification/application-modification.entity';
import { ApplicationModificationService } from '../decision/application-modification/application-modification.service';
import { ApplicationReconsiderationService } from '../decision/application-reconsideration/application-reconsideration.service';
import { NoticeOfIntent } from '../notice-of-intent/notice-of-intent.entity';
import { NoticeOfIntentService } from '../notice-of-intent/notice-of-intent.service';
import { PlanningReview } from '../planning-review/planning-review.entity';
import { PlanningReviewService } from '../planning-review/planning-review.service';
import { BOARD_CODES, BoardDto } from './board.dto';
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
    private modificationService: ApplicationModificationService,
    private covenantService: CovenantService,
    private noticeOfIntentService: NoticeOfIntentService,
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
    const covenants = await this.covenantService.getByBoardCode(boardCode);
    const noticeOfIntents = await this.noticeOfIntentService.getByBoardCode(
      boardCode,
    );

    let planningReviews: PlanningReview[] = [];
    if (boardCode === 'exec') {
      planningReviews = await this.planningReviewService.getCards();
    }

    let modifications: ApplicationModification[] = [];
    if (boardCode === BOARD_CODES.CEO) {
      modifications = await this.modificationService.getByBoardCode(boardCode);
    }

    return {
      applications: await this.applicationService.mapToDtos(applications),
      reconsiderations: await this.reconsiderationService.mapToDtos(recons),
      planningReviews: await this.planningReviewService.mapToDtos(
        planningReviews,
      ),
      modifications: await this.modificationService.mapToDtos(modifications),
      covenants: await this.covenantService.mapToDtos(covenants),
      noticeOfIntents: await this.noticeOfIntentService.mapToDtos(
        noticeOfIntents,
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

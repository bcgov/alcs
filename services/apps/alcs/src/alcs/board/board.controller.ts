import { ServiceValidationException } from '@app/common/exceptions/base.exception';
import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import { Mapper } from 'automapper-core';
import { InjectMapper } from 'automapper-nestjs';
import * as config from 'config';
import { ANY_AUTH_ROLE, ROLES_ALLOWED_BOARDS } from '../../common/authorization/roles';
import { RolesGuard } from '../../common/authorization/roles-guard.service';
import { UserRoles } from '../../common/authorization/roles.decorator';
import { ApplicationModificationService } from '../application-decision/application-modification/application-modification.service';
import { ApplicationReconsiderationService } from '../application-decision/application-reconsideration/application-reconsideration.service';
import { ApplicationService } from '../application/application.service';
import { CARD_TYPE } from '../card/card-type/card-type.entity';
import { CardCreateDto } from '../card/card.dto';
import { CardService } from '../card/card.service';
import { InquiryService } from '../inquiry/inquiry.service';
import { NoticeOfIntentModificationService } from '../notice-of-intent-decision/notice-of-intent-modification/notice-of-intent-modification.service';
import { NoticeOfIntentService } from '../notice-of-intent/notice-of-intent.service';
import { NotificationService } from '../notification/notification.service';
import { PlanningReferralService } from '../planning-review/planning-referral/planning-referral.service';
import { BoardDto, MinimalBoardDto } from './board.dto';
import { Board } from './board.entity';
import { BoardService } from './board.service';
import { ApplicationDecisionConditionCardService } from '../application-decision/application-decision-condition/application-decision-condition-card/application-decision-condition-card.service';
import { NoticeOfIntentDecisionConditionCardService } from '../notice-of-intent-decision/notice-of-intent-decision-condition/notice-of-intent-decision-condition-card/notice-of-intent-decision-condition-card.service';

@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@Controller('board')
@UseGuards(RolesGuard)
export class BoardController {
  constructor(
    private boardService: BoardService,
    private applicationService: ApplicationService,
    private cardService: CardService,
    private reconsiderationService: ApplicationReconsiderationService,
    private planningReferralService: PlanningReferralService,
    private appModificationService: ApplicationModificationService,
    private noiModificationService: NoticeOfIntentModificationService,
    private noticeOfIntentService: NoticeOfIntentService,
    private notificationService: NotificationService,
    private inquiryService: InquiryService,
    private applicationDecisionConditionCardService: ApplicationDecisionConditionCardService,
    private noticeOfIntentDecisionConditionCardService: NoticeOfIntentDecisionConditionCardService,
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

    const noticeOfIntents = allowedCodes.includes(CARD_TYPE.NOI)
      ? await this.noticeOfIntentService.getByBoard(board.uuid)
      : [];

    const planningReferrals = allowedCodes.includes(CARD_TYPE.PLAN)
      ? await this.planningReferralService.getByBoard(board.uuid)
      : [];

    const noiModifications = allowedCodes.includes(CARD_TYPE.NOI_MODI)
      ? await this.noiModificationService.getByBoard(board.uuid)
      : [];

    const notifications = allowedCodes.includes(CARD_TYPE.NOTIFICATION)
      ? await this.notificationService.getByBoard(board.uuid)
      : [];

    const inquiries = allowedCodes.includes(CARD_TYPE.INQUIRY) ? await this.inquiryService.getByBoard(board.uuid) : [];

    const applicationDecisionConditions = allowedCodes.includes(CARD_TYPE.APP_CON)
      ? await this.applicationDecisionConditionCardService.getByBoard(board.uuid)
      : [];

    const noticeOfIntentDecisionConditions = allowedCodes.includes(CARD_TYPE.NOI_CON)
      ? await this.noticeOfIntentDecisionConditionCardService.getByBoard(board.uuid)
      : [];

    return {
      board: await this.autoMapper.mapAsync(board, Board, BoardDto),
      applications: await this.applicationService.mapToDtos(applications),
      reconsiderations: await this.reconsiderationService.mapToDtos(recons),
      planningReferrals: await this.planningReferralService.mapToDtos(planningReferrals),
      modifications: await this.appModificationService.mapToDtos(modifications),
      noticeOfIntents: await this.noticeOfIntentService.mapToDtos(noticeOfIntents),
      noiModifications: await this.noiModificationService.mapToDtos(noiModifications),
      notifications: await this.notificationService.mapToDtos(notifications),
      inquiries: await this.inquiryService.mapToDtos(inquiries),
      applicationDecisionConditions:
        await this.applicationDecisionConditionCardService.mapToBoardDtos(applicationDecisionConditions),
      noticeOfIntentDecisionConditions: await this.noticeOfIntentDecisionConditionCardService.mapToBoardDtos(
        noticeOfIntentDecisionConditions,
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

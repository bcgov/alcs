import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { AUTH_ROLE } from '../../../common/authorization/roles';
import { RolesGuard } from '../../../common/authorization/roles-guard.service';
import { UserRoles } from '../../../common/authorization/roles.decorator';
import { BoardService } from '../../board/board.service';
import { CardStatusDto } from '../../card/card-status/card-status.dto';
import { CARD_STATUS } from '../../card/card-status/card-status.entity';
import { CardStatusService } from '../../card/card-status/card-status.service';

@Controller('card-status')
@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@UseGuards(RolesGuard)
export class CardStatusController {
  constructor(
    private cardStatusService: CardStatusService,
    private boardService: BoardService,
  ) {}

  @Get()
  @UserRoles(AUTH_ROLE.ADMIN)
  async fetch() {
    return await this.cardStatusService.fetch();
  }

  @Get('/:code')
  @UserRoles(AUTH_ROLE.ADMIN)
  async canDelete(@Param('code') code: CARD_STATUS) {
    //If its Decision Released, Ready for Review, Cancelled
    if (
      [
        CARD_STATUS.CANCELLED,
        CARD_STATUS.DECISION_RELEASED,
        CARD_STATUS.READY_FOR_REVIEW,
      ].includes(code)
    ) {
      return {
        canDelete: false,
        reason:
          'Column is critical to application functionality and can never be deleted',
      };
    }

    //If it has any cards
    const cardCount = await this.cardStatusService.getCardCountByStatus(code);
    if (cardCount > 0) {
      return {
        canDelete: false,
        reason: 'Column has cards in it, please move cards in order to delete',
      };
    }

    //Is boards only status
    const boardsUsingStatus = await this.boardService.getBoardsWithStatus(code);
    const boardsWithOnlyStatus = boardsUsingStatus.filter(
      (board) => board.statuses.length === 1,
    );
    if (boardsWithOnlyStatus.length > 0) {
      return {
        canDelete: false,
        reason: `Column is only status on board ${boardsWithOnlyStatus[0].title} and cannot be deleted`,
      };
    }
    return {
      canDelete: true,
    };
  }

  @Patch('/:code')
  @UserRoles(AUTH_ROLE.ADMIN)
  async update(@Param('code') code: string, @Body() updateDto: CardStatusDto) {
    return await this.cardStatusService.update(code, updateDto);
  }

  @Post('')
  @UserRoles(AUTH_ROLE.ADMIN)
  async create(@Body() createDto: CardStatusDto) {
    return await this.cardStatusService.create(createDto);
  }
}

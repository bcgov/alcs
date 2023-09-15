import { ServiceValidationException } from '@app/common/exceptions/base.exception';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { AUTH_ROLE } from '../../../common/authorization/roles';
import { RolesGuard } from '../../../common/authorization/roles-guard.service';
import { UserRoles } from '../../../common/authorization/roles.decorator';
import { BoardDto } from '../../board/board.dto';
import { BoardService } from '../../board/board.service';
import { CardService } from '../../card/card.service';

@Controller('board-management')
@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@UseGuards(RolesGuard)
export class BoardManagementController {
  constructor(
    private cardService: CardService,
    private boardService: BoardService,
  ) {}

  @Get('/card-types')
  @UserRoles(AUTH_ROLE.ADMIN)
  async fetchCardTypes() {
    return await this.cardService.getCardTypes();
  }

  @Get('/card-counts/:code')
  @UserRoles(AUTH_ROLE.ADMIN)
  async fetchCardCount(@Param('code') code: string) {
    const cardsOnBoard = await this.cardService.getByBoard(code);
    const finalCount: Record<string, number> = {};
    return cardsOnBoard.reduce((previousValue, currentValue) => {
      const cardCount = previousValue[currentValue.statusCode] ?? 0;
      previousValue[currentValue.statusCode] = cardCount + 1;
      return previousValue;
    }, finalCount);
  }

  @Get('/:code')
  @UserRoles(AUTH_ROLE.ADMIN)
  async canDelete(@Param('code') code: string) {
    //If it's the vetting board
    if (code === 'vett' || code === 'noti') {
      return {
        canDelete: false,
        reason:
          'Board is critical to application functionality and can never be deleted',
      };
    }

    //If it has any cards
    const cardCount = await this.cardService.getByBoard(code);
    if (cardCount.length > 0) {
      return {
        canDelete: false,
        reason: 'Board has cards on it, please move cards in order to delete',
      };
    }

    return {
      canDelete: true,
    };
  }

  @Put('/:code')
  @UserRoles(AUTH_ROLE.ADMIN)
  async update(@Param('code') code: string, @Body() updateDto: BoardDto) {
    return await this.boardService.update(code, updateDto);
  }

  @Delete('/:code')
  @UserRoles(AUTH_ROLE.ADMIN)
  async delete(@Param('code') code: string) {
    const cardCount = await this.cardService.getByBoard(code);
    if (cardCount.length > 0) {
      throw new ServiceValidationException('Cannot delete boards with cards');
    }

    return await this.boardService.delete(code);
  }

  @Post('')
  @UserRoles(AUTH_ROLE.ADMIN)
  async create(@Body() createDto: BoardDto) {
    return await this.boardService.create(createDto);
  }
}

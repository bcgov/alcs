import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { ApplicationService } from '../application/application.service';
import { CardCreateDto } from '../card/card.dto';
import { CardService } from '../card/card.service';
import { RoleGuard } from '../common/authorization/role.guard';
import { ANY_AUTH_ROLE } from '../common/authorization/roles';
import { UserRoles } from '../common/authorization/roles.decorator';
import { ServiceValidationException } from '../common/exceptions/base.exception';
import { BoardDto } from './board.dto';
import { Board } from './board.entity';
import { BoardService } from './board.service';

@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@Controller('board')
@UseGuards(RoleGuard)
export class BoardController {
  constructor(
    private boardService: BoardService,
    private applicationService: ApplicationService,
    private cardService: CardService,
    @InjectMapper() private autoMapper: Mapper,
  ) {}

  @Get()
  @UserRoles(...ANY_AUTH_ROLE)
  async getBoards() {
    const boards = await this.boardService.list();
    return this.autoMapper.mapArray(boards, Board, BoardDto);
  }

  @Get('/:boardCode')
  @UserRoles(...ANY_AUTH_ROLE)
  async getCards(@Param('boardCode') boardCode: string) {
    const applications = await this.boardService.getApplicationsByCode(
      boardCode,
    );
    const cards = await this.cardService.getByBoard(boardCode);

    // TODO implement get recons with cards ones we have the recon entity
    const reconsCards = cards.filter(
      (c) => !applications.some((a) => a.cardUuid === c.uuid),
    );

    return {
      applications: await this.applicationService.mapToDtos(applications),
      reconsiderations: await this.cardService.mapToDtos(reconsCards),
    };
  }

  @Post('/change')
  @UserRoles(...ANY_AUTH_ROLE)
  async changeBoard(
    @Body()
    { cardUuid, boardCode }: { cardUuid: string; boardCode: string },
  ) {
    return this.boardService.changeBoard(cardUuid, boardCode);
  }

  @Post('/card')
  @UserRoles(...ANY_AUTH_ROLE)
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

    return this.cardService.create(card, board);
  }

  @Get('/card/:uuid')
  @UserRoles(...ANY_AUTH_ROLE)
  async getCard(@Param('uuid') cardUuid: string) {
    const card = await this.cardService.get(cardUuid);

    return this.cardService.mapToDetailedDto(card);
  }
}

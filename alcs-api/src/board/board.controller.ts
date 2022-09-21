import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { ApplicationService } from '../application/application.service';
import { RoleGuard } from '../common/authorization/role.guard';
import { ANY_AUTH_ROLE } from '../common/authorization/roles';
import { UserRoles } from '../common/authorization/roles.decorator';
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
    // private cardService: CardService,
    // private codeService: ApplicationCodeService,
    // private notificationService: NotificationService,
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
  async getApplications(@Param('boardCode') boardCode: string) {
    const applications = await this.boardService.getApplicationsByCode(
      boardCode,
    );
    return this.applicationService.mapToDtos(applications);
  }

  @Post('/change')
  @UserRoles(...ANY_AUTH_ROLE)
  async changeApplicationBoard(
    @Body()
    { fileNumber, boardCode }: { fileNumber: string; boardCode: string },
  ) {
    return this.boardService.changeBoard(fileNumber, boardCode);
  }
}

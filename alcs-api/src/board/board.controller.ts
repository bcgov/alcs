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

  // // TODO: move to card controller?
  // @Patch('/updateCard')
  // @UserRoles(...ANY_AUTH_ROLE)
  // async updateCard(@Body() card: CardUpdateDto, @Req() req) {
  //   const existingCard = await this.cardService.get(card);

  //   if (!existingCard) {
  //     throw new ServiceValidationException(`Card ${card.uuid} not found`);
  //   }

  //   let status: CardStatus | undefined;
  //   if (card.status && card.status != existingCard.status.code) {
  //     status = await this.codeService.fetchStatus(card.status);
  //   }

  //   const updatedCard = await this.cardService.update(card.uuid, {
  //     statusUuid: status ? status.uuid : undefined,
  //     assigneeUuid: card.assigneeUuid,
  //     boardUuid: card.boardUuid,
  //   });

  //   // TODO: move to board service as above
  //   if (
  //     updatedCard.assigneeUuid !== existingCard.assigneeUuid &&
  //     updatedCard.assigneeUuid !== req.user.entity.uuid
  //   ) {
  //     const application = await this.applicationService.getByCard(
  //       updatedCard.uuid,
  //     );
  //     this.notificationService.createForApplication(
  //       req.user.entity,
  //       updatedCard.assigneeUuid,
  //       "You've been assigned",
  //       application,
  //     );
  //   }

  //   return;
  // }
}

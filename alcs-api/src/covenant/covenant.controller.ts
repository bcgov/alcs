import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { BoardService } from '../board/board.service';
import { ROLES_ALLOWED_BOARDS } from '../common/authorization/roles';
import { UserRoles } from '../common/authorization/roles.decorator';
import { CreateCovenantDto } from './covenant.dto';
import { CovenantService } from './covenant.service';

@Controller('covenant')
export class CovenantController {
  constructor(
    private covenantService: CovenantService,
    private boardService: BoardService,
  ) {}

  @Post()
  @UserRoles(...ROLES_ALLOWED_BOARDS)
  async create(@Body() createPlanningReviewDto: CreateCovenantDto) {
    const board = await this.boardService.getOne({
      code: 'exec',
    });

    const createdReview = await this.covenantService.create(
      createPlanningReviewDto,
      board,
    );

    const mapped = this.covenantService.mapToDtos([createdReview]);
    return mapped[0];
  }

  @Get('/card/:uuid')
  @UserRoles(...ROLES_ALLOWED_BOARDS)
  async getByCard(@Param('uuid') cardUuid: string) {
    const planningReview = await this.covenantService.getByCardUuid(cardUuid);
    const mapped = await this.covenantService.mapToDtos([planningReview]);
    return mapped[0];
  }
}

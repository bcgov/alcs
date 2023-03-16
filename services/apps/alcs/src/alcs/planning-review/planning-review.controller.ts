import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { BoardService } from '../board/board.service';
import { ROLES_ALLOWED_BOARDS } from '../../common/authorization/roles';
import { RolesGuard } from '../../common/authorization/roles-guard.service';
import { UserRoles } from '../../common/authorization/roles.decorator';
import { CreatePlanningReviewDto } from './planning-review.dto';
import { PlanningReviewService } from './planning-review.service';

@Controller('planning-review')
@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@UseGuards(RolesGuard)
export class PlanningReviewController {
  constructor(
    private planningReviewService: PlanningReviewService,
    private boardService: BoardService,
  ) {}

  @Post()
  @UserRoles(...ROLES_ALLOWED_BOARDS)
  async create(@Body() createPlanningReviewDto: CreatePlanningReviewDto) {
    const board = await this.boardService.getOneOrFail({
      code: 'exec',
    });

    if (!board) {
      throw new Error('Failed to load executive board');
    }

    const createdReview = await this.planningReviewService.create(
      createPlanningReviewDto,
      board,
    );

    const mapped = this.planningReviewService.mapToDtos([createdReview]);
    return mapped[0];
  }

  @Get('/card/:uuid')
  @UserRoles(...ROLES_ALLOWED_BOARDS)
  async getByCard(@Param('uuid') cardUuid: string) {
    const planningReview = await this.planningReviewService.getByCardUuid(
      cardUuid,
    );
    const mapped = await this.planningReviewService.mapToDtos([planningReview]);
    return mapped[0];
  }
}

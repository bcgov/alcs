import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { RoleGuard } from 'nest-keycloak-connect';
import { BoardService } from '../board/board.service';
import { ANY_AUTH_ROLE } from '../common/authorization/roles';
import { UserRoles } from '../common/authorization/roles.decorator';
import { CreatePlanningReviewDto } from './planning-review.dto';
import { PlanningReviewService } from './planning-review.service';

@Controller('planning-review')
@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@UseGuards(RoleGuard)
export class PlanningReviewController {
  constructor(
    private planningReviewService: PlanningReviewService,
    private boardService: BoardService,
  ) {}

  @Post()
  @UserRoles(...ANY_AUTH_ROLE)
  async create(@Body() createPlanningReviewDto: CreatePlanningReviewDto) {
    const board = await this.boardService.getOne({
      code: 'exec',
    });

    const createdReview = await this.planningReviewService.create(
      createPlanningReviewDto,
      board,
    );

    const mapped = this.planningReviewService.mapToDtos([createdReview];
    return mapped[0];
  }

  @Get('/card/:uuid')
  @UserRoles(...ANY_AUTH_ROLE)
  async getByCard(@Param('uuid') cardUuid: string) {
    const planningReview = await this.planningReviewService.getByCardUuid(
      cardUuid,
    );
    const mapped = await this.planningReviewService.mapToDtos([planningReview]);
    return mapped[0];
  }
}

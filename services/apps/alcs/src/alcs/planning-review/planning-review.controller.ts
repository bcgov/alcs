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
import { Mapper } from 'automapper-core';
import { InjectMapper } from 'automapper-nestjs';
import * as config from 'config';
import { ROLES_ALLOWED_BOARDS } from '../../common/authorization/roles';
import { RolesGuard } from '../../common/authorization/roles-guard.service';
import { UserRoles } from '../../common/authorization/roles.decorator';
import { BOARD_CODES } from '../board/board.dto';
import { BoardService } from '../board/board.service';
import { PlanningReferralService } from './planning-referral/planning-referral.service';
import { PlanningReviewType } from './planning-review-type.entity';
import {
  CreatePlanningReviewDto,
  PlanningReviewDetailedDto,
  PlanningReviewTypeDto,
  UpdatePlanningReviewDto,
} from './planning-review.dto';
import { PlanningReview } from './planning-review.entity';
import { PlanningReviewService } from './planning-review.service';

@Controller('planning-review')
@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@UseGuards(RolesGuard)
export class PlanningReviewController {
  constructor(
    private planningReviewService: PlanningReviewService,
    private planningReferralService: PlanningReferralService,
    private boardService: BoardService,
    @InjectMapper()
    private mapper: Mapper,
  ) {}

  @Get('/types')
  @UserRoles(...ROLES_ALLOWED_BOARDS)
  async fetchTypes() {
    const types = await this.planningReviewService.listTypes();

    return this.mapper.mapArray(
      types,
      PlanningReviewType,
      PlanningReviewTypeDto,
    );
  }

  @Post()
  @UserRoles(...ROLES_ALLOWED_BOARDS)
  async create(@Body() createDto: CreatePlanningReviewDto) {
    const board = await this.boardService.getOneOrFail({
      code: BOARD_CODES.REGIONAL_PLANNING,
    });

    const createdReferral = await this.planningReviewService.create(
      createDto,
      board,
    );

    const referral = await this.planningReferralService.get(
      createdReferral.uuid,
    );

    const mapped = await this.planningReferralService.mapToDtos([referral]);
    return mapped[0];
  }

  @Get('/:fileNumber')
  @UserRoles(...ROLES_ALLOWED_BOARDS)
  async fetchByFileNumber(@Param('fileNumber') fileNumber: string) {
    const review =
      await this.planningReviewService.getDetailedReview(fileNumber);

    return this.mapper.map(review, PlanningReview, PlanningReviewDetailedDto);
  }

  @Post('/:fileNumber')
  @UserRoles(...ROLES_ALLOWED_BOARDS)
  async updateByFileNumber(
    @Param('fileNumber') fileNumber: string,
    @Body() updateDto: UpdatePlanningReviewDto,
    @Req() req,
  ) {
    const review = await this.planningReviewService.update(
      fileNumber,
      updateDto,
      req.user.entity,
    );

    return this.mapper.map(review, PlanningReview, PlanningReviewDetailedDto);
  }
}

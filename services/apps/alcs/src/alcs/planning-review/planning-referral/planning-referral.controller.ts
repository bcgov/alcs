import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import { Mapper } from 'automapper-core';
import { InjectMapper } from 'automapper-nestjs';
import * as config from 'config';
import { ROLES_ALLOWED_BOARDS } from '../../../common/authorization/roles';
import { RolesGuard } from '../../../common/authorization/roles-guard.service';
import { UserRoles } from '../../../common/authorization/roles.decorator';
import { BOARD_CODES } from '../../board/board.dto';
import { BoardService } from '../../board/board.service';
import {
  CreatePlanningReferralDto,
  PlanningReferralDto,
  UpdatePlanningReferralDto,
} from '../planning-review.dto';
import { PlanningReferral } from './planning-referral.entity';
import { PlanningReferralService } from './planning-referral.service';

@Controller('planning-referral')
@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@UseGuards(RolesGuard)
export class PlanningReferralController {
  constructor(
    private planningReferralService: PlanningReferralService,
    @InjectMapper()
    private mapper: Mapper,
    private boardService: BoardService,
  ) {}

  @Get('/card/:uuid')
  @UserRoles(...ROLES_ALLOWED_BOARDS)
  async fetchByCardUuid(@Param('uuid') uuid: string) {
    const review = await this.planningReferralService.getByCardUuid(uuid);
    return this.mapper.map(review, PlanningReferral, PlanningReferralDto);
  }

  @Post()
  @UserRoles(...ROLES_ALLOWED_BOARDS)
  async create(@Body() createDto: CreatePlanningReferralDto) {
    const board = await this.boardService.getOneOrFail({
      code: BOARD_CODES.REGIONAL_PLANNING,
    });

    const review = await this.planningReferralService.create(createDto, board);
    return this.mapper.map(review, PlanningReferral, PlanningReferralDto);
  }

  @Patch(':uuid')
  @UserRoles(...ROLES_ALLOWED_BOARDS)
  async update(
    @Param('uuid') uuid: string,
    @Body() updateDto: UpdatePlanningReferralDto,
  ) {
    await this.planningReferralService.update(uuid, updateDto);
    return {
      success: true,
    };
  }

  @Delete(':uuid')
  @UserRoles(...ROLES_ALLOWED_BOARDS)
  async delete(@Param('uuid') uuid: string) {
    await this.planningReferralService.delete(uuid);
    return {
      success: true,
    };
  }
}

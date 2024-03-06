import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import { Mapper } from 'automapper-core';
import { InjectMapper } from 'automapper-nestjs';
import * as config from 'config';
import { ROLES_ALLOWED_BOARDS } from '../../../common/authorization/roles';
import { RolesGuard } from '../../../common/authorization/roles-guard.service';
import { UserRoles } from '../../../common/authorization/roles.decorator';
import { PlanningReferralDto } from '../planning-review.dto';
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
  ) {}

  @Get('/card/:uuid')
  @UserRoles(...ROLES_ALLOWED_BOARDS)
  async fetchByCardUuid(@Param('uuuid') uuid: string) {
    const review = await this.planningReferralService.getByCardUuid(uuid);
    return this.mapper.map(review, PlanningReferral, PlanningReferralDto);
  }
}

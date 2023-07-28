import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Body, Controller, Param, Patch } from '@nestjs/common';
import { ANY_AUTH_ROLE } from '../../../common/authorization/roles';
import { UserRoles } from '../../../common/authorization/roles.decorator';
import {
  ApplicationDecisionComponentLotDto,
  UpdateApplicationDecisionComponentLotDto,
} from './application-decision-component-lot.dto';
import { ApplicationDecisionComponentLot } from './application-decision-component-lot.entity';
import { ApplicationDecisionComponentLotService } from './application-decision-component-lot.service';

@Controller('application-decision-component-lot')
@UserRoles(...ANY_AUTH_ROLE)
export class ApplicationDecisionComponentLotController {
  constructor(
    private componentLotService: ApplicationDecisionComponentLotService,
    @InjectMapper() private mapper: Mapper,
  ) {}

  @Patch('/:uuid')
  async update(
    @Param('uuid') uuid: string,
    @Body() updateDto: UpdateApplicationDecisionComponentLotDto,
  ) {
    const updatedLot = await this.componentLotService.update(uuid, updateDto);
    return this.mapper.mapAsync(
      updatedLot,
      ApplicationDecisionComponentLot,
      ApplicationDecisionComponentLotDto,
    );
  }
}

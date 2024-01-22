import { Mapper } from 'automapper-core';
import { InjectMapper } from 'automapper-nestjs';
import { Body, Controller, Param, Patch } from '@nestjs/common';
import { ANY_AUTH_ROLE } from '../../../../../common/authorization/roles';
import { UserRoles } from '../../../../../common/authorization/roles.decorator';
import {
  ApplicationDecisionComponentDto,
  UpdateApplicationDecisionComponentDto,
} from './application-decision-component.dto';
import { ApplicationDecisionComponent } from './application-decision-component.entity';
import { ApplicationDecisionComponentService } from './application-decision-component.service';

@Controller('application-decision-component')
export class ApplicationDecisionComponentController {
  constructor(
    private appDecisionComponentService: ApplicationDecisionComponentService,
    @InjectMapper() private mapper: Mapper,
  ) {}

  @Patch('/:uuid')
  @UserRoles(...ANY_AUTH_ROLE)
  async update(
    @Param('uuid') uuid: string,
    @Body() updateDto: UpdateApplicationDecisionComponentDto,
  ): Promise<ApplicationDecisionComponentDto> {
    await this.appDecisionComponentService.getOneOrFail(uuid);

    const updatedComponent =
      await this.appDecisionComponentService.createOrUpdate([updateDto]);
    return (
      await this.mapper.mapArrayAsync(
        updatedComponent,
        ApplicationDecisionComponent,
        ApplicationDecisionComponentDto,
      )
    )[0];
  }
}

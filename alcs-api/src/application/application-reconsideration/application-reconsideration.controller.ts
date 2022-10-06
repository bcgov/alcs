import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { RoleGuard } from 'nest-keycloak-connect';
import { ANY_AUTH_ROLE } from '../../common/authorization/roles';
import { UserRoles } from '../../common/authorization/roles.decorator';
import { ApplicationReconsiderationService } from './application-reconsideration.service';
import {
  ApplicationReconsiderationCreateDto,
  ApplicationReconsiderationUpdateDto,
} from './applicationReconsideration.dto';

@Controller('application-reconsideration')
@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@UseGuards(RoleGuard)
export class ApplicationReconsiderationController {
  constructor(
    private reconsiderationService: ApplicationReconsiderationService,
  ) {}

  @Patch('/:uuid')
  @UserRoles(...ANY_AUTH_ROLE)
  async update(
    @Param('uuid') uuid: string,
    @Body() reconsideration: ApplicationReconsiderationUpdateDto,
  ) {
    const updatedRecon = await this.reconsiderationService.update(
      uuid,
      reconsideration,
    );

    return updatedRecon;
  }

  @Post()
  @UserRoles(...ANY_AUTH_ROLE)
  async create(@Body() reconsideration: ApplicationReconsiderationCreateDto) {
    const createdRecon = await this.reconsiderationService.create(
      reconsideration,
    );

    return createdRecon;
  }

  @Delete('/:uuid')
  @UserRoles(...ANY_AUTH_ROLE)
  async delete(@Param('uuid') uuid: string) {
    return await this.reconsiderationService.delete(uuid);
  }
}

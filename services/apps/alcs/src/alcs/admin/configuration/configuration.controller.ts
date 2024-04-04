import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { AUTH_ROLE } from '../../../common/authorization/roles';
import { RolesGuard } from '../../../common/authorization/roles-guard.service';
import { UserRoles } from '../../../common/authorization/roles.decorator';
import { CONFIG_VALUE } from '../../../common/entities/configuration.entity';
import { ConfigurationService } from './configuration.service';

@Controller('configuration')
@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@UseGuards(RolesGuard)
export class ConfigurationController {
  constructor(private configurationService: ConfigurationService) {}

  @Get('')
  @UserRoles(AUTH_ROLE.ADMIN)
  async listConfigs() {
    return await this.configurationService.list();
  }

  @Post('/:name')
  @UserRoles(AUTH_ROLE.ADMIN)
  async setConfiguration(
    @Param('name') name: string,
    @Body() body: { value: string },
  ) {
    const castName = name as CONFIG_VALUE;
    if (Object.values(CONFIG_VALUE).includes(castName)) {
      await this.configurationService.setConfigurationValue(
        castName,
        body.value,
      );
      return {
        success: true,
      };
    }
    throw new BadRequestException(
      'Unable to set config that is not programmed',
    );
  }

  // TODO: Update controller with maintenance status and message retrieval
  // @Get('/maintenance-banner')
  // async getMaintenanceBanner() {
  //   return await this.configurationService.getMaintenaceBanner();
  // }
}

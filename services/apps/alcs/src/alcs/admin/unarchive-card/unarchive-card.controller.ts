import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { AUTH_ROLE } from '../../../common/authorization/roles';
import { RolesGuard } from '../../../common/authorization/roles-guard.service';
import { UserRoles } from '../../../common/authorization/roles.decorator';
import { UnarchiveCardService } from './unarchive-card.service';

@Controller('unarchive-card')
@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@UseGuards(RolesGuard)
export class UnarchiveCardController {
  constructor(private unarchiveCardService: UnarchiveCardService) {}

  @Get('/:fileId')
  @UserRoles(AUTH_ROLE.ADMIN)
  async fetch(@Param('fileId') fileId: string) {
    return await this.unarchiveCardService.fetchByFileId(fileId);
  }
}

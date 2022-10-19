import { Body, Controller, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { RoleGuard } from 'nest-keycloak-connect';
import { ROLES_ALLOWED_BOARDS } from '../common/authorization/roles';
import { UserRoles } from '../common/authorization/roles.decorator';
import { CardUpdateDto } from './card.dto';
import { CardService } from './card.service';

@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@UseGuards(RoleGuard)
@Controller('card')
export class CardController {
  constructor(private cardService: CardService) {}

  @Patch('/:uuid')
  @UserRoles(...ROLES_ALLOWED_BOARDS)
  async updateCard(
    @Param('uuid') uuid: string,
    @Body() cardToUpdate: CardUpdateDto,
  ) {
    return await this.cardService.update(uuid, {
      statusCode: cardToUpdate.statusCode,
      assigneeUuid: cardToUpdate.assigneeUuid,
      highPriority: cardToUpdate.highPriority,
    });
  }
}

import { Body, Controller, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { RoleGuard } from 'nest-keycloak-connect';
import { CodeService } from '../code/code.service';
import { ROLES_ALLOWED_BOARDS } from '../common/authorization/roles';
import { UserRoles } from '../common/authorization/roles.decorator';
import { CardStatus } from './card-status/card-status.entity';
import { CardUpdateDto } from './card.dto';
import { CardService } from './card.service';

@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@UseGuards(RoleGuard)
@Controller('card')
export class CardController {
  constructor(
    private cardService: CardService,
    private codeService: CodeService,
  ) {}

  @Patch('/:uuid')
  @UserRoles(...ROLES_ALLOWED_BOARDS)
  async updateCard(
    @Param('uuid') uuid: string,
    @Body() cardToUpdate: CardUpdateDto,
  ) {
    let status: CardStatus | undefined;
    if (cardToUpdate.statusCode) {
      status = await this.codeService.fetchCardStatus(cardToUpdate.statusCode);
    }

    const updatedCard = await this.cardService.update(uuid, {
      statusUuid: status ? status.uuid : undefined,
      assigneeUuid: cardToUpdate.assigneeUuid,
      highPriority: cardToUpdate.highPriority,
    });

    return updatedCard;
  }
}

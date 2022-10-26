import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { AUTH_ROLE } from '../../common/authorization/roles';
import { RolesGuard } from '../../common/authorization/roles-guard.service';
import { UserRoles } from '../../common/authorization/roles.decorator';
import { CardStatusDto } from './card-status.dto';
import { CardStatusService } from './card-status.service';

@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@Controller('card-status')
@UseGuards(RolesGuard)
export class CardStatusController {
  constructor(private cardStatusService: CardStatusService) {}

  @Post()
  @UserRoles(AUTH_ROLE.ADMIN)
  async add(@Body() card: CardStatusDto): Promise<CardStatusDto> {
    const newCard = await this.cardStatusService.create(card);
    return {
      code: newCard.code,
      description: newCard.description,
      label: newCard.label,
    };
  }
}

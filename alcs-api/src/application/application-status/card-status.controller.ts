import { Body, Controller, Post } from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { CardStatusDto } from './card-status.dto';
import { CardStatusService } from './card-status.service';

@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
// TODO: rename controller and address this on UI side
@Controller('application-status')
export class CardStatusController {
  constructor(private cardStatusService: CardStatusService) {}

  @Post()
  async add(@Body() card: CardStatusDto): Promise<CardStatusDto> {
    const newCard = await this.cardStatusService.create(card);
    return {
      code: newCard.code,
      description: newCard.description,
      label: newCard.label,
    };
  }
}

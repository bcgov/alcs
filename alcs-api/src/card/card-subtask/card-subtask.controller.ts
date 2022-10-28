import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { CardSubtask } from '../../card/card-subtask/card-subtask.entity';
import { CardSubtaskService } from '../../card/card-subtask/card-subtask.service';
import { RolesGuard } from '../../common/authorization/roles-guard.service';
import {
  ANY_AUTH_ROLE,
  ROLES_ALLOWED_BOARDS,
} from '../../common/authorization/roles';
import { UserRoles } from '../../common/authorization/roles.decorator';
import { ServiceNotFoundException } from '../../common/exceptions/base.exception';
import { CardService } from '../card.service';
import { CardSubtaskDto, UpdateCardSubtaskDto } from './card-subtask.dto';

@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@UseGuards(RolesGuard)
@Controller('card-subtask')
export class CardSubtaskController {
  constructor(
    private cardSubtaskService: CardSubtaskService,
    private cardService: CardService,
    @InjectMapper() private mapper: Mapper,
  ) {}

  @Post('/:cardUuid/:subtaskType')
  @UserRoles(...ROLES_ALLOWED_BOARDS)
  async create(
    @Param('cardUuid') cardUuid: string,
    @Param('subtaskType') subtaskType: string,
  ): Promise<CardSubtaskDto> {
    const card = await this.cardService.get(cardUuid);
    if (!card) {
      throw new ServiceNotFoundException(`Card not found ${cardUuid}`);
    }

    const savedTask = await this.cardSubtaskService.create(card, subtaskType);
    return this.mapper.map(savedTask, CardSubtask, CardSubtaskDto);
  }

  @Patch('/:uuid')
  @UserRoles(...ROLES_ALLOWED_BOARDS)
  async update(
    @Param('uuid') subtaskUuid: string,
    @Body() body: Partial<UpdateCardSubtaskDto>,
  ): Promise<CardSubtaskDto> {
    const savedTask = await this.cardSubtaskService.update(subtaskUuid, body);
    return this.mapper.map(savedTask, CardSubtask, CardSubtaskDto);
  }

  @Get('/:uuid')
  @UserRoles(...ROLES_ALLOWED_BOARDS)
  async list(@Param('uuid') uuid: string): Promise<CardSubtaskDto[]> {
    const card = await this.cardService.get(uuid);
    return this.mapper.mapArray(card.subtasks, CardSubtask, CardSubtaskDto);
  }

  @Delete('/:uuid')
  @UserRoles(...ROLES_ALLOWED_BOARDS)
  async delete(@Param('uuid') subtaskUuid: string) {
    await this.cardSubtaskService.delete(subtaskUuid);
    return {};
  }
}

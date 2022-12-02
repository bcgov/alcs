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
import { ROLES_ALLOWED_BOARDS } from '../../common/authorization/roles';
import { RolesGuard } from '../../common/authorization/roles-guard.service';
import { UserRoles } from '../../common/authorization/roles.decorator';
import {
  ServiceNotFoundException,
  ServiceValidationException,
} from '../../common/exceptions/base.exception';
import { CardService } from '../card.service';
import {
  CARD_SUBTASK_TYPE,
  CardSubtaskDto,
  UpdateCardSubtaskDto,
} from './card-subtask.dto';
import { CardSubtask } from './card-subtask.entity';
import { CardSubtaskService } from './card-subtask.service';

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

    if (
      card.subtasks &&
      subtaskType === CARD_SUBTASK_TYPE.AUDIT &&
      card.subtasks.some((s) => s.type.code === CARD_SUBTASK_TYPE.AUDIT)
    ) {
      throw new ServiceValidationException(
        `Card can have only one Audit subtask`,
      );
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
    if (!card) {
      throw new ServiceNotFoundException(
        `Failed to find card with uuid ${uuid}`,
      );
    }

    return this.mapper.mapArray(card.subtasks, CardSubtask, CardSubtaskDto);
  }

  @Delete('/:uuid')
  @UserRoles(...ROLES_ALLOWED_BOARDS)
  async delete(@Param('uuid') subtaskUuid: string) {
    await this.cardSubtaskService.delete(subtaskUuid);
    return {};
  }
}

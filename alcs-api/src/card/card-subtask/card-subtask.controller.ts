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
import { RoleGuard } from '../../common/authorization/role.guard';
import { ANY_AUTH_ROLE } from '../../common/authorization/roles';
import { UserRoles } from '../../common/authorization/roles.decorator';
import { ServiceNotFoundException } from '../../common/exceptions/base.exception';
import { CardService } from '../card.service';
import {
  ApplicationSubtaskDto,
  UpdateApplicationSubtaskDto,
} from './card-subtask.dto';

@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@UseGuards(RoleGuard)
@Controller('card-subtask')
export class CardSubtaskController {
  constructor(
    private cardSubtaskService: CardSubtaskService,
    private cardService: CardService,
    @InjectMapper() private mapper: Mapper,
  ) {}

  @Post('/:cardUuid/:subtaskType')
  @UserRoles(...ANY_AUTH_ROLE)
  async create(
    @Param('cardUuid') cardUuid: string,
    @Param('subtaskType') subtaskType: string,
  ): Promise<ApplicationSubtaskDto> {
    const card = await this.cardService.get(cardUuid);
    if (!card) {
      throw new ServiceNotFoundException(`File number not found ${cardUuid}`);
    }

    const savedTask = await this.cardSubtaskService.create(card, subtaskType);
    return this.mapper.map(savedTask, CardSubtask, ApplicationSubtaskDto);
  }

  @Patch('/:uuid')
  @UserRoles(...ANY_AUTH_ROLE)
  async update(
    @Param('uuid') subtaskUuid: string,
    @Body() body: Partial<UpdateApplicationSubtaskDto>,
  ): Promise<ApplicationSubtaskDto> {
    const savedTask = await this.cardSubtaskService.update(subtaskUuid, body);
    return this.mapper.map(savedTask, CardSubtask, ApplicationSubtaskDto);
  }

  @Get('/:uuid')
  @UserRoles(...ANY_AUTH_ROLE)
  async list(@Param('uuid') uuid: string): Promise<ApplicationSubtaskDto[]> {
    const card = await this.cardService.get(uuid);
    return this.mapper.mapArray(
      card.subtasks,
      CardSubtask,
      ApplicationSubtaskDto,
    );
  }

  @Delete('/:uuid')
  @UserRoles(...ANY_AUTH_ROLE)
  async delete(@Param('uuid') subtaskUuid: string) {
    await this.cardSubtaskService.delete(subtaskUuid);
    return { deleted: true };
  }
}

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
import { ApplicationService } from '../application.service';
import {
  ApplicationSubtaskDto,
  UpdateApplicationSubtaskDto,
} from './application-subtask.dto';

@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@UseGuards(RoleGuard)
@Controller('application-subtask')
export class ApplicationSubtaskController {
  constructor(
    private cardSubtaskService: CardSubtaskService,
    private applicationService: ApplicationService,
    @InjectMapper() private mapper: Mapper,
  ) {}

  @Post('/:fileNumber/:subtaskType')
  @UserRoles(...ANY_AUTH_ROLE)
  async create(
    @Param('fileNumber') fileNumber: string,
    @Param('subtaskType') subtaskType: string,
  ): Promise<ApplicationSubtaskDto> {
    const application = await this.applicationService.get(fileNumber);
    if (!application) {
      throw new ServiceNotFoundException(`File number not found ${fileNumber}`);
    }

    const savedTask = await this.cardSubtaskService.create(
      application.card,
      subtaskType,
    );
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

  @Get('/:fileNumber')
  @UserRoles(...ANY_AUTH_ROLE)
  async list(
    @Param('fileNumber') fileNumber: string,
  ): Promise<ApplicationSubtaskDto[]> {
    const application = await this.applicationService.get(fileNumber);
    return this.mapper.mapArray(
      application.card.subtasks,
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

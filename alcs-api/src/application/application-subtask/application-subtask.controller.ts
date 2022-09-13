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
import { RoleGuard } from '../../common/authorization/role.guard';
import { ANY_AUTH_ROLE } from '../../common/authorization/roles';
import { UserRoles } from '../../common/authorization/roles.decorator';
import {
  ApplicationSubtaskDto,
  UpdateApplicationSubtaskDto,
} from './application-subtask.dto';
import { ApplicationSubtask } from './application-subtask.entity';
import { ApplicationSubtaskService } from './application-subtask.service';

@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@UseGuards(RoleGuard)
@Controller('application-subtask')
export class ApplicationSubtaskController {
  constructor(
    private applicationSubtaskService: ApplicationSubtaskService,
    @InjectMapper() private mapper: Mapper,
  ) {}

  @Post('/:fileNumber/:subtaskType')
  @UserRoles(...ANY_AUTH_ROLE)
  async create(
    @Param('fileNumber') fileNumber: string,
    @Param('subtaskType') subtaskType: string,
  ): Promise<ApplicationSubtaskDto> {
    const savedTask = await this.applicationSubtaskService.create(
      fileNumber,
      subtaskType,
    );
    return this.mapper.map(
      savedTask,
      ApplicationSubtask,
      ApplicationSubtaskDto,
    );
  }

  @Patch('/:uuid')
  @UserRoles(...ANY_AUTH_ROLE)
  async update(
    @Param('uuid') subtaskUuid: string,
    @Body() body: Partial<UpdateApplicationSubtaskDto>,
  ): Promise<ApplicationSubtaskDto> {
    const savedTask = await this.applicationSubtaskService.update(
      subtaskUuid,
      body,
    );
    return this.mapper.map(
      savedTask,
      ApplicationSubtask,
      ApplicationSubtaskDto,
    );
  }

  @Get('/:fileNumber')
  @UserRoles(...ANY_AUTH_ROLE)
  async list(
    @Param('fileNumber') fileNumber: string,
  ): Promise<ApplicationSubtaskDto[]> {
    const documents = await this.applicationSubtaskService.list(fileNumber);
    return this.mapper.mapArray(
      documents,
      ApplicationSubtask,
      ApplicationSubtaskDto,
    );
  }

  @Delete('/:uuid')
  @UserRoles(...ANY_AUTH_ROLE)
  async delete(@Param('uuid') subtaskUuid: string) {
    await this.applicationSubtaskService.delete(subtaskUuid);
    return { deleted: true };
  }
}

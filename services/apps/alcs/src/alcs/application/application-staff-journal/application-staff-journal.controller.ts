import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { ROLES_ALLOWED_BOARDS } from '../../../common/authorization/roles';
import { RolesGuard } from '../../../common/authorization/roles-guard.service';
import { UserRoles } from '../../../common/authorization/roles.decorator';
import {
  ApplicationStaffJournalDto,
  CreateApplicationStaffJournalDto,
  UpdateApplicationStaffJournalDto,
} from './application-staff-journal.dto';
import { ApplicationStaffJournal } from './application-staff-journal.entity';
import { ApplicationStaffJournalService } from './application-staff-journal.service';

@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@UseGuards(RolesGuard)
@Controller('application-staff-journal')
export class ApplicationStaffJournalController {
  constructor(
    private staffJournalService: ApplicationStaffJournalService,
    @InjectMapper() private autoMapper: Mapper,
  ) {}

  @Get('/:applicationUuid')
  @UserRoles(...ROLES_ALLOWED_BOARDS)
  async get(
    @Param('applicationUuid') applicationUuid,
    @Req() req,
  ): Promise<ApplicationStaffJournalDto[]> {
    const records = await this.staffJournalService.fetch(applicationUuid);
    return this.mapToDto(records, req.user.entity.uuid);
  }

  @Post()
  @UserRoles(...ROLES_ALLOWED_BOARDS)
  async create(
    @Body() record: CreateApplicationStaffJournalDto,
    @Req() req,
  ): Promise<ApplicationStaffJournalDto> {
    const newRecord = await this.staffJournalService.create(
      record.applicationUuid,
      record.body,
      req.user.entity,
    );

    return this.autoMapper.map(
      newRecord,
      ApplicationStaffJournal,
      ApplicationStaffJournalDto,
    );
  }

  @Patch()
  @UserRoles(...ROLES_ALLOWED_BOARDS)
  async update(
    @Body() record: UpdateApplicationStaffJournalDto,
    @Req() req,
  ): Promise<ApplicationStaffJournalDto> {
    const existingComment = await this.staffJournalService.get(
      record.applicationUuid,
    );

    if (!existingComment) {
      throw new NotFoundException(`Comment ${record.uuid} not found`);
    }

    if (existingComment.author.uuid === req.user.entity.uuid) {
      const updatedComment = await this.staffJournalService.update(
        record.uuid,
        record.body,
      );
      return this.autoMapper.map(
        updatedComment,
        ApplicationStaffJournal,
        ApplicationStaffJournalDto,
      );
    } else {
      throw new ForbiddenException('Unable to delete others comments');
    }
  }

  @Delete('/:id')
  @UserRoles(...ROLES_ALLOWED_BOARDS)
  async softDelete(@Param('id') id: string, @Req() req): Promise<void> {
    const comment = await this.staffJournalService.get(id);

    if (!comment) {
      throw new NotFoundException(`Comment ${id} not found`);
    }

    if (comment.author.uuid === req.user.entity.uuid) {
      await this.staffJournalService.delete(id);
    } else {
      throw new ForbiddenException('Unable to delete others comments');
    }
  }

  private async mapToDto(
    records: ApplicationStaffJournal[],
    userUuid: string,
  ): Promise<ApplicationStaffJournalDto[]> {
    return records.map((comment) => ({
      ...this.autoMapper.map(
        comment,
        ApplicationStaffJournal,
        ApplicationStaffJournalDto,
      ),
      isEditable: comment.author.uuid === userUuid,
    }));
  }
}

import { Mapper } from 'automapper-core';
import { InjectMapper } from 'automapper-nestjs';
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
import { ROLES_ALLOWED_BOARDS } from '../../common/authorization/roles';
import { RolesGuard } from '../../common/authorization/roles-guard.service';
import { UserRoles } from '../../common/authorization/roles.decorator';
import {
  StaffJournalDto,
  CreateApplicationStaffJournalDto,
  UpdateStaffJournalDto,
  CreateNoticeOfIntentStaffJournalDto,
  CreateNotificationStaffJournalDto,
} from './staff-journal.dto';
import { StaffJournal } from './staff-journal.entity';
import { StaffJournalService } from './staff-journal.service';

@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@UseGuards(RolesGuard)
@Controller('application-staff-journal')
export class StaffJournalController {
  constructor(
    private staffJournalService: StaffJournalService,
    @InjectMapper() private autoMapper: Mapper,
  ) {}

  @Get('/:parentUuid')
  @UserRoles(...ROLES_ALLOWED_BOARDS)
  async get(
    @Param('parentUuid') parentUuid,
    @Req() req,
  ): Promise<StaffJournalDto[]> {
    const records = await this.staffJournalService.fetch(parentUuid);
    return this.mapToDto(records, req.user.entity.uuid);
  }

  @Post('/application')
  @UserRoles(...ROLES_ALLOWED_BOARDS)
  async createForApplication(
    @Body() record: CreateApplicationStaffJournalDto,
    @Req() req,
  ): Promise<StaffJournalDto> {
    const newRecord = await this.staffJournalService.createForApplication(
      record.applicationUuid,
      record.body,
      req.user.entity,
    );

    return this.autoMapper.map(newRecord, StaffJournal, StaffJournalDto);
  }

  @Post('/notice-of-intent')
  @UserRoles(...ROLES_ALLOWED_BOARDS)
  async createForNoticeOfIntent(
    @Body() record: CreateNoticeOfIntentStaffJournalDto,
    @Req() req,
  ): Promise<StaffJournalDto> {
    const newRecord = await this.staffJournalService.createForNoticeOfIntent(
      record.noticeOfIntentUuid,
      record.body,
      req.user.entity,
    );

    return this.autoMapper.map(newRecord, StaffJournal, StaffJournalDto);
  }

  @Post('/notification')
  @UserRoles(...ROLES_ALLOWED_BOARDS)
  async createForNotification(
    @Body() record: CreateNotificationStaffJournalDto,
    @Req() req,
  ): Promise<StaffJournalDto> {
    const newRecord = await this.staffJournalService.createForNotification(
      record.notificationUuid,
      record.body,
      req.user.entity,
    );

    return this.autoMapper.map(newRecord, StaffJournal, StaffJournalDto);
  }

  @Patch()
  @UserRoles(...ROLES_ALLOWED_BOARDS)
  async update(
    @Body() record: UpdateStaffJournalDto,
    @Req() req,
  ): Promise<StaffJournalDto> {
    const existingNote = await this.staffJournalService.get(record.uuid);

    if (!existingNote) {
      throw new NotFoundException(`Note ${record.uuid} not found`);
    }

    if (existingNote.author.uuid === req.user.entity.uuid) {
      const updatedNote = await this.staffJournalService.update(
        record.uuid,
        record.body,
      );
      return this.autoMapper.map(updatedNote, StaffJournal, StaffJournalDto);
    } else {
      throw new ForbiddenException('Unable to delete others notes');
    }
  }

  @Delete('/:id')
  @UserRoles(...ROLES_ALLOWED_BOARDS)
  async softDelete(@Param('id') id: string, @Req() req): Promise<void> {
    const note = await this.staffJournalService.get(id);

    if (!note) {
      throw new NotFoundException(`Note ${id} not found`);
    }

    if (note.author.uuid === req.user.entity.uuid) {
      await this.staffJournalService.delete(id);
    } else {
      throw new ForbiddenException('Unable to delete others notes');
    }
  }

  private async mapToDto(
    records: StaffJournal[],
    userUuid: string,
  ): Promise<StaffJournalDto[]> {
    return records.map((note) => ({
      ...this.autoMapper.map(note, StaffJournal, StaffJournalDto),
      isEditable: note.author.uuid === userUuid,
    }));
  }
}

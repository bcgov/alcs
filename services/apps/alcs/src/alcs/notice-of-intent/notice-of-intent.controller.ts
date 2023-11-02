import { Mapper } from 'automapper-core';
import { InjectMapper } from 'automapper-nestjs';
import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import {
  ROLES_ALLOWED_APPLICATIONS,
  ROLES_ALLOWED_BOARDS,
} from '../../common/authorization/roles';
import { RolesGuard } from '../../common/authorization/roles-guard.service';
import { UserRoles } from '../../common/authorization/roles.decorator';
import { formatIncomingDate } from '../../utils/incoming-date.formatter';
import { BoardService } from '../board/board.service';
import { NOI_SUBMISSION_STATUS } from './notice-of-intent-submission-status/notice-of-intent-status.dto';
import { NoticeOfIntentSubmissionStatusService } from './notice-of-intent-submission-status/notice-of-intent-submission-status.service';
import { NoticeOfIntentSubtype } from './notice-of-intent-subtype.entity';
import {
  CreateNoticeOfIntentDto,
  NoticeOfIntentSubtypeDto,
  UpdateNoticeOfIntentDto,
} from './notice-of-intent.dto';
import { NoticeOfIntentService } from './notice-of-intent.service';

@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@Controller('notice-of-intent')
@UseGuards(RolesGuard)
export class NoticeOfIntentController {
  constructor(
    private noticeOfIntentService: NoticeOfIntentService,
    private noticeOfIntentSubmissionStatusService: NoticeOfIntentSubmissionStatusService,
    private boardService: BoardService,
    @InjectMapper() private mapper: Mapper,
  ) {}

  @Get('/:fileNumber')
  @UserRoles(...ROLES_ALLOWED_BOARDS)
  async get(@Param('fileNumber') fileNumber: string) {
    const noticeOfIntent =
      await this.noticeOfIntentService.getByFileNumber(fileNumber);
    const mapped = await this.noticeOfIntentService.mapToDtos([noticeOfIntent]);
    return mapped[0];
  }

  @Get('/types')
  @UserRoles(...ROLES_ALLOWED_BOARDS)
  async getSubtypes() {
    const subtypes = await this.noticeOfIntentService.listSubtypes();
    return this.mapper.mapArray(
      subtypes,
      NoticeOfIntentSubtype,
      NoticeOfIntentSubtypeDto,
    );
  }

  @Post()
  @UserRoles(...ROLES_ALLOWED_BOARDS)
  async create(@Body() createDto: CreateNoticeOfIntentDto) {
    const board = await this.boardService.getOneOrFail({
      code: createDto.boardCode,
    });

    const createdNoi = await this.noticeOfIntentService.create(
      {
        ...createDto,
        dateSubmittedToAlc: formatIncomingDate(createDto.dateSubmittedToAlc),
      },
      board,
    );

    const mapped = this.noticeOfIntentService.mapToDtos([createdNoi]);
    return mapped[0];
  }

  @Get('/card/:uuid')
  @UserRoles(...ROLES_ALLOWED_BOARDS)
  async getByCard(@Param('uuid') cardUuid: string) {
    const noi = await this.noticeOfIntentService.getByCardUuid(cardUuid);
    const mapped = await this.noticeOfIntentService.mapToDtos([noi]);
    return mapped[0];
  }

  @Post('/:fileNumber')
  @UserRoles(...ROLES_ALLOWED_BOARDS)
  async update(
    @Body() updateDto: UpdateNoticeOfIntentDto,
    @Param('fileNumber') fileNumber: string,
  ) {
    const updatedNotice = await this.noticeOfIntentService.update(
      fileNumber,
      updateDto,
    );
    const mapped = await this.noticeOfIntentService.mapToDtos([updatedNotice]);
    return mapped[0];
  }

  @Post('/:fileNumber/cancel')
  @UserRoles(...ROLES_ALLOWED_BOARDS)
  async cancel(@Param('fileNumber') fileNumber: string) {
    await this.noticeOfIntentSubmissionStatusService.setStatusDateByFileNumber(
      fileNumber,
      NOI_SUBMISSION_STATUS.CANCELLED,
    );
  }

  @Post('/:fileNumber/uncancel')
  @UserRoles(...ROLES_ALLOWED_BOARDS)
  async uncancel(@Param('fileNumber') fileNumber: string) {
    await this.noticeOfIntentSubmissionStatusService.setStatusDateByFileNumber(
      fileNumber,
      NOI_SUBMISSION_STATUS.CANCELLED,
      null,
    );
  }

  @Get('/search/:fileNumber')
  @UserRoles(...ROLES_ALLOWED_APPLICATIONS)
  async search(@Param('fileNumber') fileNumber: string) {
    const noticeOfIntents =
      await this.noticeOfIntentService.searchByFileNumber(fileNumber);
    return this.noticeOfIntentService.mapToDtos(noticeOfIntents);
  }
}

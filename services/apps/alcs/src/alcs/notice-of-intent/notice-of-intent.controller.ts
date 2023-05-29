import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ROLES_ALLOWED_BOARDS } from '../../common/authorization/roles';
import { UserRoles } from '../../common/authorization/roles.decorator';
import { BoardService } from '../board/board.service';
import {
  CreateNoticeOfIntentDto,
  UpdateNoticeOfIntentDto,
} from './notice-of-intent.dto';
import { NoticeOfIntentService } from './notice-of-intent.service';

@Controller('notice-of-intent')
export class NoticeOfIntentController {
  constructor(
    private noticeOfIntentService: NoticeOfIntentService,
    private boardService: BoardService,
  ) {}

  @Get('/:fileNumber')
  @UserRoles(...ROLES_ALLOWED_BOARDS)
  async get(@Param('fileNumber') fileNumber: string) {
    const noticeOfIntent = await this.noticeOfIntentService.getByFileNumber(
      fileNumber,
    );
    const mapped = await this.noticeOfIntentService.mapToDtos([noticeOfIntent]);
    return mapped[0];
  }

  @Post()
  @UserRoles(...ROLES_ALLOWED_BOARDS)
  async create(@Body() createDto: CreateNoticeOfIntentDto) {
    const board = await this.boardService.getOneOrFail({
      code: createDto.boardCode,
    });

    const createdNoi = await this.noticeOfIntentService.create(
      createDto,
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
}

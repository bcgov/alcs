import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ROLES_ALLOWED_BOARDS } from '../../common/authorization/roles';
import { UserRoles } from '../../common/authorization/roles.decorator';
import { BoardService } from '../board/board.service';
import { CreateNoticeOfIntentDto } from './notice-of-intent.dto';
import { NoticeOfIntentService } from './notice-of-intent.service';

@Controller('notice-of-intent')
export class NoticeOfIntentController {
  constructor(
    private noticeOfIntentService: NoticeOfIntentService,
    private boardService: BoardService,
  ) {}

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
    const covenant = await this.noticeOfIntentService.getByCardUuid(cardUuid);
    const mapped = await this.noticeOfIntentService.mapToDtos([covenant]);
    return mapped[0];
  }
}

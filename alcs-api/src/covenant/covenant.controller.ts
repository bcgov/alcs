import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { BoardService } from '../board/board.service';
import { ROLES_ALLOWED_BOARDS } from '../common/authorization/roles';
import { UserRoles } from '../common/authorization/roles.decorator';
import { CreateCovenantDto } from './covenant.dto';
import { CovenantService } from './covenant.service';

@Controller('covenant')
export class CovenantController {
  constructor(
    private covenantService: CovenantService,
    private boardService: BoardService,
  ) {}

  @Post()
  @UserRoles(...ROLES_ALLOWED_BOARDS)
  async create(@Body() createCovenantDto: CreateCovenantDto) {
    const board = await this.boardService.getOne({
      code: createCovenantDto.boardCode,
    });

    const createdCovenant = await this.covenantService.create(
      createCovenantDto,
      board,
    );

    const mapped = this.covenantService.mapToDtos([createdCovenant]);
    return mapped[0];
  }

  @Get('/card/:uuid')
  @UserRoles(...ROLES_ALLOWED_BOARDS)
  async getByCard(@Param('uuid') cardUuid: string) {
    const covenant = await this.covenantService.getByCardUuid(cardUuid);
    const mapped = await this.covenantService.mapToDtos([covenant]);
    return mapped[0];
  }
}

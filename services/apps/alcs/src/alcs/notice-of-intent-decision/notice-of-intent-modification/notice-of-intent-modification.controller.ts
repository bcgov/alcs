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
import { BoardService } from '../../board/board.service';
import { ROLES_ALLOWED_APPLICATIONS } from '../../../common/authorization/roles';
import { RolesGuard } from '../../../common/authorization/roles-guard.service';
import { UserRoles } from '../../../common/authorization/roles.decorator';
import {
  NoticeOfIntentModificationCreateDto,
  NoticeOfIntentModificationUpdateDto,
} from './notice-of-intent-modification.dto';
import { NoticeOfIntentModificationService } from './notice-of-intent-modification.service';

@Controller('notice-of-intent-modification')
@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@UseGuards(RolesGuard)
export class NoticeOfIntentModificationController {
  constructor(
    private modificationService: NoticeOfIntentModificationService,
    private boardService: BoardService,
  ) {}

  @Patch('/:uuid')
  @UserRoles(...ROLES_ALLOWED_APPLICATIONS)
  async update(
    @Param('uuid') uuid: string,
    @Body() updateDto: NoticeOfIntentModificationUpdateDto,
  ) {
    const updatedModification = await this.modificationService.update(
      uuid,
      updateDto,
    );
    return this.modificationService.mapToDtos([updatedModification]);
  }

  @Post()
  @UserRoles(...ROLES_ALLOWED_APPLICATIONS)
  async create(@Body() createDto: NoticeOfIntentModificationCreateDto) {
    const board = await this.boardService.getOneOrFail({
      code: createDto.boardCode,
    });
    const modification = await this.modificationService.create(
      createDto,
      board,
    );
    return this.modificationService.mapToDtos([modification]);
  }

  @Delete('/:uuid')
  @UserRoles(...ROLES_ALLOWED_APPLICATIONS)
  async delete(@Param('uuid') uuid: string) {
    const deleted = await this.modificationService.delete(uuid);
    return { uuid: deleted[0].uuid };
  }

  @Get('/card/:uuid')
  @UserRoles(...ROLES_ALLOWED_APPLICATIONS)
  async getByCard(@Param('uuid') cardUuid: string) {
    const modification = await this.modificationService.getByCardUuid(cardUuid);
    const mapped = await this.modificationService.mapToDtos([modification]);
    return mapped[0];
  }

  @Get('/notice-of-intent/:fileNumber')
  @UserRoles(...ROLES_ALLOWED_APPLICATIONS)
  async getByFileNumber(@Param('fileNumber') fileNumber: string) {
    const modification = await this.modificationService.getByFileNumber(
      fileNumber,
    );
    return this.modificationService.mapToDtos(modification);
  }
}

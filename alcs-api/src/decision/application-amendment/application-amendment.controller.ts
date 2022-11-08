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
import { ROLES_ALLOWED_APPLICATIONS } from '../../common/authorization/roles';
import { RolesGuard } from '../../common/authorization/roles-guard.service';
import { UserRoles } from '../../common/authorization/roles.decorator';
import {
  ApplicationAmendmentCreateDto,
  ApplicationAmendmentUpdateDto,
} from './application-amendment.dto';
import { ApplicationAmendmentService } from './application-amendment.service';

@Controller('application-amendment')
@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@UseGuards(RolesGuard)
export class ApplicationAmendmentController {
  constructor(
    private amendmentService: ApplicationAmendmentService,
    private boardService: BoardService,
  ) {}

  @Patch('/:uuid')
  @UserRoles(...ROLES_ALLOWED_APPLICATIONS)
  async update(
    @Param('uuid') uuid: string,
    @Body() updateDto: ApplicationAmendmentUpdateDto,
  ) {
    const updatedAmendment = await this.amendmentService.update(
      uuid,
      updateDto,
    );
    return this.amendmentService.mapToDtos([updatedAmendment]);
  }

  @Post()
  @UserRoles(...ROLES_ALLOWED_APPLICATIONS)
  async create(@Body() createDto: ApplicationAmendmentCreateDto) {
    const board = await this.boardService.getOne({
      code: createDto.boardCode,
    });
    const amendment = await this.amendmentService.create(createDto, board);

    return this.amendmentService.mapToDtos([amendment]);
  }

  @Delete('/:uuid')
  @UserRoles(...ROLES_ALLOWED_APPLICATIONS)
  async delete(@Param('uuid') uuid: string) {
    await this.amendmentService.delete(uuid);
    return {};
  }

  @Get('/card/:uuid')
  @UserRoles(...ROLES_ALLOWED_APPLICATIONS)
  async getByCard(@Param('uuid') cardUuid: string) {
    const amendment = await this.amendmentService.getByCardUuid(cardUuid);
    const mapped = await this.amendmentService.mapToDtos([amendment]);
    return mapped[0];
  }

  @Get('/board/:boardCode')
  @UserRoles(...ROLES_ALLOWED_APPLICATIONS)
  async getByBoard(@Param('code') boardCode: string) {
    const amendments = await this.amendmentService.getByBoardCode(boardCode);
    return this.amendmentService.mapToDtos(amendments);
  }

  @Get('/application/:applicationFileNumber')
  @UserRoles(...ROLES_ALLOWED_APPLICATIONS)
  async getByApplication(
    @Param('applicationFileNumber') applicationFileNumber: string,
  ) {
    const amendment = await this.amendmentService.getByApplication(
      applicationFileNumber,
    );
    return this.amendmentService.mapToDtos(amendment);
  }
}

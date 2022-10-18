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
import { RoleGuard } from 'nest-keycloak-connect';
import { BoardService } from '../board/board.service';
import { ROLES_ALLOWED_APPLICATIONS } from '../common/authorization/roles';
import { UserRoles } from '../common/authorization/roles.decorator';
import {
  ApplicationReconsiderationCreateDto,
  ApplicationReconsiderationUpdateDto,
} from './application-reconsideration.dto';
import { ApplicationReconsiderationService } from './application-reconsideration.service';

@Controller('application-reconsideration')
@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@UseGuards(RoleGuard)
export class ApplicationReconsiderationController {
  constructor(
    private reconsiderationService: ApplicationReconsiderationService,
    private boardService: BoardService,
  ) {}

  @Patch('/:uuid')
  @UserRoles(...ROLES_ALLOWED_APPLICATIONS)
  async update(
    @Param('uuid') uuid: string,
    @Body() reconsideration: ApplicationReconsiderationUpdateDto,
  ) {
    const updatedRecon = await this.reconsiderationService.update(
      uuid,
      reconsideration,
    );

    return this.reconsiderationService.mapToDtos([updatedRecon]);
  }

  @Post()
  @UserRoles(...ROLES_ALLOWED_APPLICATIONS)
  async create(@Body() reconsideration: ApplicationReconsiderationCreateDto) {
    const board = await this.boardService.getOne({
      code: reconsideration.boardCode,
    });

    const createdRecon = await this.reconsiderationService.create(
      reconsideration,
      board,
    );

    return this.reconsiderationService.mapToDtos([createdRecon]);
  }

  @Delete('/:uuid')
  @UserRoles(...ROLES_ALLOWED_APPLICATIONS)
  async delete(@Param('uuid') uuid: string) {
    await this.reconsiderationService.delete(uuid);
    return { deleted: true };
  }

  @Get('/card/:uuid')
  @UserRoles(...ROLES_ALLOWED_APPLICATIONS)
  async getByCard(@Param('uuid') cardUuid: string) {
    const recon = await this.reconsiderationService.getByCardUuid(cardUuid);
    const mapped = await this.reconsiderationService.mapToDtos([recon]);
    return mapped[0];
  }

  @Get('/board/:boardCode')
  @UserRoles(...ROLES_ALLOWED_APPLICATIONS)
  async getByBoard(@Param('code') boardCode: string) {
    const recon = await this.reconsiderationService.getByBoardCode(boardCode);
    return this.reconsiderationService.mapToDtos(recon);
  }

  @Get('/application/:applicationFileNumber')
  @UserRoles(...ROLES_ALLOWED_APPLICATIONS)
  async getByApplication(
    @Param('applicationFileNumber') applicationFileNumber: string,
  ) {
    const recon = await this.reconsiderationService.getByApplication(
      applicationFileNumber,
    );
    return this.reconsiderationService.mapToDtos(recon);
  }

  @Get('/codes')
  @UserRoles(...ROLES_ALLOWED_APPLICATIONS)
  async getCodes() {
    return this.reconsiderationService.getCodes();
  }
}

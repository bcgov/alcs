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
import { RoleGuard } from 'nest-keycloak-connect';
import { BoardService } from '../../board/board.service';
import { ANY_AUTH_ROLE } from '../../common/authorization/roles';
import { UserRoles } from '../../common/authorization/roles.decorator';
import { ApplicationReconsideration } from './application-reconsideration.entity';
import { ApplicationReconsiderationService } from './application-reconsideration.service';
import {
  ApplicationReconsiderationCreateDto,
  ApplicationReconsiderationDto,
  ApplicationReconsiderationUpdateDto,
} from './applicationReconsideration.dto';

@Controller('application-reconsideration')
@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@UseGuards(RoleGuard)
export class ApplicationReconsiderationController {
  constructor(
    private reconsiderationService: ApplicationReconsiderationService,
    private boardService: BoardService,
    @InjectMapper() private mapper: Mapper,
  ) {}

  @Patch('/:uuid')
  @UserRoles(...ANY_AUTH_ROLE)
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
  @UserRoles(...ANY_AUTH_ROLE)
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
  @UserRoles(...ANY_AUTH_ROLE)
  async delete(@Param('uuid') uuid: string) {
    await this.reconsiderationService.delete(uuid);
    return { deleted: true };
  }

  @Get('/card/:uuid')
  @UserRoles(...ANY_AUTH_ROLE)
  async getByCard(@Param('uuid') cardUuid: string) {
    const recon = await this.reconsiderationService.getByCardUuid(cardUuid);
    return this.mapper.mapAsync(
      recon,
      ApplicationReconsideration,
      ApplicationReconsiderationDto,
    );
  }
}

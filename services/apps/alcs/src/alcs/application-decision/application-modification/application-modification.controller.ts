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
  ApplicationModificationCreateDto,
  ApplicationModificationUpdateDto,
} from './application-modification.dto';
import { ApplicationModificationService } from './application-modification.service';

@Controller('application-modification')
@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@UseGuards(RolesGuard)
export class ApplicationModificationController {
  constructor(
    private modificationService: ApplicationModificationService,
    private boardService: BoardService,
  ) {}

  @Patch('/:uuid')
  @UserRoles(...ROLES_ALLOWED_APPLICATIONS)
  async update(
    @Param('uuid') uuid: string,
    @Body() updateDto: ApplicationModificationUpdateDto,
  ) {
    const updatedModification = await this.modificationService.update(
      uuid,
      updateDto,
    );
    return this.modificationService.mapToDtos([updatedModification]);
  }

  @Post()
  @UserRoles(...ROLES_ALLOWED_APPLICATIONS)
  async create(@Body() createDto: ApplicationModificationCreateDto) {
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
    await this.modificationService.delete(uuid);
    return {};
  }

  @Get('/card/:uuid')
  @UserRoles(...ROLES_ALLOWED_APPLICATIONS)
  async getByCard(@Param('uuid') cardUuid: string) {
    const modification = await this.modificationService.getByCardUuid(cardUuid);
    const mapped = await this.modificationService.mapToDtos([modification]);
    return mapped[0];
  }

  @Get('/application/:applicationFileNumber')
  @UserRoles(...ROLES_ALLOWED_APPLICATIONS)
  async getByApplication(
    @Param('applicationFileNumber') applicationFileNumber: string,
  ) {
    const modification = await this.modificationService.getByApplication(
      applicationFileNumber,
    );
    return this.modificationService.mapToDtos(modification);
  }
}

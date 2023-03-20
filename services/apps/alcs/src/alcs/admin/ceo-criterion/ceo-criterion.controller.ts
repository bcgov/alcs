import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { AUTH_ROLE } from '../../../common/authorization/roles';
import { RolesGuard } from '../../../common/authorization/roles-guard.service';
import { UserRoles } from '../../../common/authorization/roles.decorator';
import { CeoCriterionCodeDto } from '../../decision/application-decision/ceo-criterion/ceo-criterion.dto';
import { CeoCriterionService } from './ceo-criterion.service';

@Controller('ceo-criterion')
@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@UseGuards(RolesGuard)
export class CeoCriterionController {
  constructor(private ceoCriterionService: CeoCriterionService) {}

  @Get()
  @UserRoles(AUTH_ROLE.ADMIN)
  async fetch() {
    return await this.ceoCriterionService.fetch();
  }

  @Put('/:code')
  @UserRoles(AUTH_ROLE.ADMIN)
  async update(
    @Param('code') code: string,
    @Body() updateDto: CeoCriterionCodeDto,
  ) {
    if (code === 'MODI') {
      throw new BadRequestException('Cannot modify Modi');
    }

    return await this.ceoCriterionService.update(code, updateDto);
  }

  @Post('')
  @UserRoles(AUTH_ROLE.ADMIN)
  async create(@Body() createDto: CeoCriterionCodeDto) {
    return await this.ceoCriterionService.create(createDto);
  }

  @Delete('/:code')
  @UserRoles(AUTH_ROLE.ADMIN)
  async delete(@Param('code') code: string) {
    return await this.ceoCriterionService.delete(code);
  }
}

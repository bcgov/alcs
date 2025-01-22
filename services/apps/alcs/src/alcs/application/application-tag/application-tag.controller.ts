import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import { RolesGuard } from '../../../common/authorization/roles-guard.service';
import * as config from 'config';
import { ApplicationTagService } from './application-tag.service';
import { ApplicationTagDto } from './application-tag.dto';
import { UserRoles } from '../../../common/authorization/roles.decorator';
import { ANY_AUTH_ROLE, ROLES_ALLOWED_APPLICATIONS } from '../../../common/authorization/roles';

@Controller('application/:fileNumber/tag')
@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@UseGuards(RolesGuard)
export class ApplicationTagController {
  constructor(private service: ApplicationTagService) {}

  @Get('')
  @UserRoles(...ANY_AUTH_ROLE)
  async getApplicationTags(@Param('fileNumber') fileNumber: string) {
    return await this.service.getApplicationTags(fileNumber);
  }

  @Post('')
  @UserRoles(...ROLES_ALLOWED_APPLICATIONS)
  async addTagToApplication(@Param('fileNumber') fileNumber: string, @Body() dto: ApplicationTagDto) {
    return await this.service.addTagToApplication(fileNumber, dto.tagName);
  }

  @Delete('/:tagName')
  @UserRoles(...ROLES_ALLOWED_APPLICATIONS)
  async removeTagFromApplication(@Param('fileNumber') fileNumber: string, @Param('tagName') tagName: string) {
    return await this.service.removeTagFromApplication(fileNumber, tagName);
  }
}

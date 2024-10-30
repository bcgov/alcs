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
import { ROLES_ALLOWED_APPLICATIONS } from '../../../common/authorization/roles';

@Controller('application/:fileNumber/tag')
@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@UseGuards(RolesGuard)
export class ApplicationTagController {
  private logger = new Logger(ApplicationTagController.name);
  constructor(private service: ApplicationTagService) {}

  @Get('')
  @UserRoles(...ROLES_ALLOWED_APPLICATIONS)
  async getApplicationTags(@Param('fileNumber') fileNumber: string) {
    try {
      return await this.service.getApplicationTags(fileNumber);
    } catch (e) {
      this.logger.error(`Failed to load tags for application with number ${fileNumber}`, e.stack);
      throw new HttpException(
        `Failed to load tags for application with file number ${fileNumber}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('')
  @UserRoles(...ROLES_ALLOWED_APPLICATIONS)
  async addTagToApplication(@Param('fileNumber') fileNumber: string, @Body() dto: ApplicationTagDto) {
    try {
      return await this.service.addTagToApplication(fileNumber, dto.tagName);
    } catch (e) {
      this.logger.error(`Failed to add tag ${dto.tagName} to application with file number ${fileNumber}`, e.stack);
      throw new HttpException(
        `Failed to add tag ${dto.tagName} to application with file number ${fileNumber}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('')
  @UserRoles(...ROLES_ALLOWED_APPLICATIONS)
  async removeTagFromApplication(@Param('fileNumber') fileNumber: string, @Body() dto: ApplicationTagDto) {
    try {
      return await this.service.removeTagFromApplication(fileNumber, dto.tagName);
    } catch (e) {
      this.logger.error(`Failed to remove tag ${dto.tagName} to application with file number ${fileNumber}`, e.stack);
      throw new HttpException(
        `Failed to remove tag ${dto.tagName} to application with file number ${fileNumber}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

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
import { Mapper } from 'automapper-core';
import { InjectMapper } from 'automapper-nestjs';
import * as config from 'config';
import { ANY_AUTH_ROLE } from '../../../common/authorization/roles';
import { RolesGuard } from '../../../common/authorization/roles-guard.service';
import { UserRoles } from '../../../common/authorization/roles.decorator';
import {
  ApplicationBoundaryAmendmentDto,
  CreateApplicationBoundaryAmendmentDto,
  UpdateApplicationBoundaryAmendmentDto,
} from './application-boundary-amendment.dto';
import { ApplicationBoundaryAmendment } from './application-boundary-amendment.entity';
import { ApplicationBoundaryAmendmentService } from './application-boundary-amendment.service';

@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@UseGuards(RolesGuard)
@Controller('application-boundary-amendment')
export class ApplicationBoundaryAmendmentController {
  constructor(
    private applicationBoundaryAmendmentService: ApplicationBoundaryAmendmentService,
    @InjectMapper() private mapper: Mapper,
  ) {}

  @Get('/application/:fileNumber')
  @UserRoles(...ANY_AUTH_ROLE)
  async list(
    @Param('fileNumber') fileNumber: string,
  ): Promise<ApplicationBoundaryAmendmentDto[]> {
    const amendments =
      await this.applicationBoundaryAmendmentService.list(fileNumber);
    return this.mapper.mapArray(
      amendments,
      ApplicationBoundaryAmendment,
      ApplicationBoundaryAmendmentDto,
    );
  }

  @Post('/application/:fileNumber')
  @UserRoles(...ANY_AUTH_ROLE)
  async create(
    @Param('fileNumber') fileNumber: string,
    @Body() dto: CreateApplicationBoundaryAmendmentDto,
  ): Promise<ApplicationBoundaryAmendmentDto> {
    const amendment = await this.applicationBoundaryAmendmentService.create(
      fileNumber,
      dto,
    );

    return this.mapper.map(
      amendment,
      ApplicationBoundaryAmendment,
      ApplicationBoundaryAmendmentDto,
    );
  }

  @Patch('/:uuid')
  @UserRoles(...ANY_AUTH_ROLE)
  async update(
    @Param('uuid') amendmentUuid: string,
    @Body() body: UpdateApplicationBoundaryAmendmentDto,
  ): Promise<ApplicationBoundaryAmendmentDto> {
    const updatedAmendment =
      await this.applicationBoundaryAmendmentService.update(
        amendmentUuid,
        body,
      );

    return this.mapper.map(
      updatedAmendment,
      ApplicationBoundaryAmendment,
      ApplicationBoundaryAmendmentDto,
    );
  }

  @Delete('/:uuid')
  @UserRoles(...ANY_AUTH_ROLE)
  async delete(@Param('uuid') amendmentUuid: string) {
    const amendment =
      await this.applicationBoundaryAmendmentService.delete(amendmentUuid);
    return this.mapper.map(
      amendment,
      ApplicationBoundaryAmendment,
      ApplicationBoundaryAmendmentDto,
    );
  }
}

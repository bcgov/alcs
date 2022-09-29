import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { CardStatus } from '../card/card-status/card-status.entity';
import { CardService } from '../card/card.service';
import { ApplicationRegion } from '../code/application-code/application-region/application-region.entity';
import { ApplicationType } from '../code/application-code/application-type/application-type.entity';
import { CodeService } from '../code/code.service';
import { RoleGuard } from '../common/authorization/role.guard';
import { ANY_AUTH_ROLE } from '../common/authorization/roles';
import { UserRoles } from '../common/authorization/roles.decorator';
import { ServiceValidationException } from '../common/exceptions/base.exception';
import { NotificationService } from '../notification/notification.service';
import {
  ApplicationDetailedDto,
  ApplicationDto,
  ApplicationUpdateDto,
  CreateApplicationDto,
} from './application.dto';
import { ApplicationService } from './application.service';

@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@Controller('application')
@UseGuards(RoleGuard)
export class ApplicationController {
  constructor(
    private applicationService: ApplicationService,
    private codeService: CodeService,
    private notificationService: NotificationService,
    private cardService: CardService,
  ) {}

  @Get()
  @UserRoles(...ANY_AUTH_ROLE)
  async getAll(): Promise<ApplicationDto[]> {
    const applications = await this.applicationService.getAll();
    return this.applicationService.mapToDtos(applications);
  }

  @Get('/:fileNumber')
  @UserRoles(...ANY_AUTH_ROLE)
  async get(@Param('fileNumber') fileNumber): Promise<ApplicationDetailedDto> {
    const application = await this.applicationService.get(fileNumber);
    if (application) {
      const mappedApplication = await this.applicationService.mapToDtos([
        application,
      ]);
      return {
        ...mappedApplication[0],
        statusDetails: application.card.status,
        typeDetails: application.type,
        regionDetails: application.region,
      };
    }
  }

  @Post()
  @UserRoles(...ANY_AUTH_ROLE)
  async create(
    @Body() application: CreateApplicationDto,
  ): Promise<ApplicationDto> {
    const type = await this.codeService.fetchApplicationType(application.type);

    const region = application.region
      ? await this.codeService.fetchRegion(application.region)
      : undefined;

    const app = await this.applicationService.createOrUpdate({
      ...application,
      type,
      region,
      dateReceived: new Date(application.dateReceived),
    });
    const mappedApps = await this.applicationService.mapToDtos([app]);
    return mappedApps[0];
  }

  @Patch()
  @UserRoles(...ANY_AUTH_ROLE)
  async update(
    @Body() application: ApplicationUpdateDto,
  ): Promise<ApplicationDetailedDto> {
    const existingApplication = await this.applicationService.get(
      application.fileNumber,
    );

    if (!existingApplication) {
      throw new ServiceValidationException(
        `File ${application.fileNumber} not found`,
      );
    }

    let type: ApplicationType | undefined;
    if (application.type && application.type != existingApplication.type.code) {
      type = await this.codeService.fetchApplicationType(application.type);
    }

    let region: ApplicationRegion | undefined;
    if (
      application.region &&
      (!existingApplication.region ||
        application.region != existingApplication.region.code)
    ) {
      region = await this.codeService.fetchRegion(application.region);
    }

    // TODO: define DTO model that accepts these specific fields only
    const updatedApplication = await this.applicationService.createOrUpdate({
      fileNumber: application.fileNumber,
      applicant: application.applicant,
      typeUuid: type ? type.uuid : undefined,
      regionUuid: region ? region.uuid : undefined,
      datePaid: this.formatIncomingDate(application.datePaid),
      dateAcknowledgedIncomplete: this.formatIncomingDate(
        application.dateAcknowledgedIncomplete,
      ),
      dateReceivedAllItems: this.formatIncomingDate(
        application.dateReceivedAllItems,
      ),
      dateAcknowledgedComplete: this.formatIncomingDate(
        application.dateAcknowledgedComplete,
      ),
      decisionDate: this.formatIncomingDate(application.decisionDate),
    });

    const mappedApps = await this.applicationService.mapToDtos([
      updatedApplication,
    ]);
    return {
      ...mappedApps[0],
      statusDetails: updatedApplication.card.status,
      typeDetails: updatedApplication.type,
      regionDetails: updatedApplication.region,
    };
  }

  @Delete()
  @UserRoles(...ANY_AUTH_ROLE)
  async softDelete(@Body() applicationNumber: string): Promise<void> {
    await this.applicationService.delete(applicationNumber);
  }

  private formatIncomingDate(date?: number) {
    if (date) {
      return new Date(date);
    } else if (date === null) {
      return null;
    } else {
      return undefined;
    }
  }

  @Patch('/updateCard')
  @UserRoles(...ANY_AUTH_ROLE)
  async updateCard(
    @Body() applicationToUpdate: ApplicationUpdateDto,
    @Req() req,
  ) {
    const existingCard = await this.cardService.get(
      applicationToUpdate.cardUuid,
    );
    if (!existingCard) {
      throw new ServiceValidationException(
        `Card for application with ${applicationToUpdate.fileNumber} not found`,
      );
    }

    let status: CardStatus | undefined;
    if (
      applicationToUpdate.status &&
      applicationToUpdate.status != existingCard.status.code
    ) {
      status = await this.codeService.fetchApplicationStatus(
        applicationToUpdate.status,
      );
    }

    const updatedCard = await this.cardService.update(existingCard.uuid, {
      statusUuid: status ? status.uuid : undefined,
      assigneeUuid: applicationToUpdate.assigneeUuid,
      highPriority: applicationToUpdate.highPriority,
    });

    const application = await this.applicationService.getByCard(
      updatedCard.uuid,
    );

    if (
      updatedCard.assigneeUuid &&
      updatedCard.assigneeUuid !== existingCard.assigneeUuid &&
      updatedCard.assigneeUuid !== req.user.entity.uuid
    ) {
      this.notificationService.createForApplication(
        req.user.entity,
        updatedCard.assigneeUuid,
        "You've been assigned",
        application,
      );
    }

    const mappedApps = await this.applicationService.mapToDtos([application]);
    return {
      ...mappedApps[0],
      statusDetails: application.card.status,
      typeDetails: application.type,
      regionDetails: application.region,
    };
  }

  @Get('/search/:fileNumber')
  @UserRoles(...ANY_AUTH_ROLE)
  async searchApplications(@Param('fileNumber') fileNumber: string) {
    const applications =
      await this.applicationService.searchApplicationsByFileNumber(fileNumber);
    return this.applicationService.mapToDtos(applications);
  }
}

import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
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
import {
  ANY_AUTH_ROLE,
  ROLES_ALLOWED_APPLICATIONS,
} from '../common/authorization/roles';
import { UserRoles } from '../common/authorization/roles.decorator';
import { CONFIG_TOKEN } from '../common/config/config.module';
import { ServiceValidationException } from '../common/exceptions/base.exception';
import { NotificationService } from '../notification/notification.service';
import { formatIncomingDate } from '../utils/incoming-date.formatter';
import {
  ApplicationDetailedDto,
  ApplicationDto,
  UpdateApplicationDto,
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
    @Inject(CONFIG_TOKEN) private config: config.IConfig,
  ) {}

  @Get()
  @UserRoles(...ROLES_ALLOWED_APPLICATIONS)
  async getAll(): Promise<ApplicationDto[]> {
    const applications = await this.applicationService.getAll();
    return this.applicationService.mapToDtos(applications);
  }

  @Get('/:fileNumber')
  @UserRoles(...ROLES_ALLOWED_APPLICATIONS)
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
  @UserRoles(...ROLES_ALLOWED_APPLICATIONS)
  async create(
    @Body() application: CreateApplicationDto,
  ): Promise<ApplicationDto> {
    const app = await this.applicationService.create(application);
    const mappedApps = await this.applicationService.mapToDtos([app]);
    return mappedApps[0];
  }

  @Patch('/:fileNumber')
  @UserRoles(...ROLES_ALLOWED_APPLICATIONS)
  async update(
    @Param('fileNumber') fileNumber: string,
    @Body() updates: UpdateApplicationDto,
  ): Promise<ApplicationDetailedDto> {
    const application = await this.applicationService.getOrFail(fileNumber);
    let type: ApplicationType | undefined;
    if (updates.type && updates.type != application.type.code) {
      type = await this.codeService.fetchApplicationType(updates.type);
    }

    let region: ApplicationRegion | undefined;
    if (
      updates.region &&
      (!application.region || updates.region != application.region.code)
    ) {
      region = await this.codeService.fetchRegion(updates.region);
    }

    const updatedApplication = await this.applicationService.update(
      application,
      {
        applicant: updates.applicant,
        typeUuid: type ? type.uuid : undefined,
        regionUuid: region ? region.uuid : undefined,
        summary: updates.summary,
        datePaid: formatIncomingDate(updates.datePaid),
        dateAcknowledgedIncomplete: formatIncomingDate(
          updates.dateAcknowledgedIncomplete,
        ),
        dateReceivedAllItems: formatIncomingDate(updates.dateReceivedAllItems),
        dateAcknowledgedComplete: formatIncomingDate(
          updates.dateAcknowledgedComplete,
        ),
        notificationSentDate: formatIncomingDate(updates.notificationSentDate),
      },
    );

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
  @UserRoles(...ROLES_ALLOWED_APPLICATIONS)
  async softDelete(@Body() applicationNumber: string): Promise<void> {
    await this.applicationService.delete(applicationNumber);
  }

  @Patch('/card/:cardUuid')
  @UserRoles(...ROLES_ALLOWED_APPLICATIONS)
  async updateCard(
    @Param('cardUuid') cardUuid: string,
    @Body() applicationUpdates: UpdateApplicationDto,
    @Req() req,
  ) {
    const existingCard = await this.cardService.get(cardUuid);
    if (!existingCard) {
      throw new ServiceValidationException(`Card ${cardUuid} not found`);
    }

    let status: CardStatus | undefined;
    if (
      applicationUpdates.status &&
      applicationUpdates.status != existingCard.status.code
    ) {
      status = await this.codeService.fetchCardStatus(
        applicationUpdates.status,
      );
    }

    const updatedCard = await this.cardService.update(existingCard.uuid, {
      statusUuid: status ? status.uuid : undefined,
      assigneeUuid: applicationUpdates.assigneeUuid,
      highPriority: applicationUpdates.highPriority,
    });

    const application = await this.applicationService.getByCard(
      updatedCard.uuid,
    );

    if (
      updatedCard.assigneeUuid &&
      updatedCard.assigneeUuid !== existingCard.assigneeUuid &&
      updatedCard.assigneeUuid !== req.user.entity.uuid
    ) {
      const frontEnd = this.config.get('FRONTEND_ROOT');
      this.notificationService.createNotificationForApplication({
        actor: req.user.entity,
        receiverUuid: updatedCard.assigneeUuid,
        title: "You've been assigned",
        body: `${application.fileNumber} (${application.applicant})`,
        link: `${frontEnd}/board/${application.card.board.code}?app=${application.card.uuid}&type=${application.card.type.code}`,
        targetType: 'application',
      });
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
  @UserRoles(...ROLES_ALLOWED_APPLICATIONS)
  async searchApplications(@Param('fileNumber') fileNumber: string) {
    const applications =
      await this.applicationService.searchApplicationsByFileNumber(fileNumber);
    return this.applicationService.mapToDtos(applications);
  }
}

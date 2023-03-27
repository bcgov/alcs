import { CONFIG_TOKEN } from '@app/common/config/config.module';
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
import { CardService } from '../card/card.service';
import { RolesGuard } from '../../common/authorization/roles-guard.service';
import { ROLES_ALLOWED_APPLICATIONS } from '../../common/authorization/roles';
import { UserRoles } from '../../common/authorization/roles.decorator';
import {
  ServiceNotFoundException,
  ServiceValidationException,
} from '@app/common/exceptions/base.exception';
import { NotificationService } from '../notification/notification.service';
import { formatIncomingDate } from '../../utils/incoming-date.formatter';
import {
  ApplicationDto,
  CreateApplicationDto,
  UpdateApplicationDto,
} from './application.dto';
import { ApplicationService } from './application.service';

@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@Controller('application')
@UseGuards(RolesGuard)
export class ApplicationController {
  constructor(
    private applicationService: ApplicationService,
    private notificationService: NotificationService,
    private cardService: CardService,
    @Inject(CONFIG_TOKEN) private config: config.IConfig,
  ) {}

  @Get('/:fileNumber')
  @UserRoles(...ROLES_ALLOWED_APPLICATIONS)
  async get(@Param('fileNumber') fileNumber): Promise<ApplicationDto> {
    const application = await this.applicationService.getOrFail(fileNumber);
    const mappedApplication = await this.applicationService.mapToDtos([
      application,
    ]);
    return mappedApplication[0];
  }

  @Post()
  @UserRoles(...ROLES_ALLOWED_APPLICATIONS)
  async create(
    @Body() application: CreateApplicationDto,
  ): Promise<ApplicationDto> {
    const app = await this.applicationService.create({
      ...application,
      dateSubmittedToAlc: formatIncomingDate(application.dateSubmittedToAlc),
    });
    const mappedApps = await this.applicationService.mapToDtos([app]);
    return mappedApps[0];
  }

  @Patch('/:fileNumber')
  @UserRoles(...ROLES_ALLOWED_APPLICATIONS)
  async update(
    @Param('fileNumber') fileNumber: string,
    @Body() updates: UpdateApplicationDto,
  ): Promise<ApplicationDto> {
    const application = await this.applicationService.getOrFail(fileNumber);
    const updatedApplication = await this.applicationService.update(
      application,
      {
        dateSubmittedToAlc: formatIncomingDate(updates.dateSubmittedToAlc),
        applicant: updates.applicant,
        typeCode: updates.typeCode,
        regionCode: updates.regionCode,
        summary: updates.summary,
        feePaidDate: formatIncomingDate(updates.feePaidDate),
        feeAmount:
          updates.feeAmount !== undefined
            ? parseFloat(updates.feeAmount)
            : updates.feeAmount,
        feeSplitWithLg: updates.feeSplitWithLg,
        feeWaived: updates.feeWaived,
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
    return mappedApps[0];
  }

  @Delete()
  @UserRoles(...ROLES_ALLOWED_APPLICATIONS)
  async softDelete(@Body() applicationNumber: string): Promise<void> {
    await this.applicationService.delete(applicationNumber);
  }

  @Get('/card/:uuid')
  @UserRoles(...ROLES_ALLOWED_APPLICATIONS)
  async getByCardUuid(@Param('uuid') cardUuid): Promise<ApplicationDto> {
    const application = await this.applicationService.getByCard(cardUuid);
    if (application) {
      const mappedApplication = await this.applicationService.mapToDtos([
        application,
      ]);
      return mappedApplication[0];
    } else {
      throw new ServiceNotFoundException(
        `Failed to find application with card uuid ${cardUuid}`,
      );
    }
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

    const updatedCard = await this.cardService.update(existingCard.uuid, {
      statusCode: applicationUpdates.statusCode,
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
      const frontEnd = this.config.get('ALCS.FRONTEND_ROOT');
      this.notificationService.createNotificationForApplication({
        actor: req.user.entity,
        receiverUuid: updatedCard.assigneeUuid,
        title: "You've been assigned",
        body: `${application.fileNumber} (${application.applicant})`,
        link: `${frontEnd}/board/${updatedCard.board.code}?card=${updatedCard.uuid}&type=${updatedCard.type.code}`,
        targetType: 'application',
      });
    }

    const mappedApps = await this.applicationService.mapToDtos([application]);
    return mappedApps[0];
  }

  @Get('/search/:fileNumber')
  @UserRoles(...ROLES_ALLOWED_APPLICATIONS)
  async searchApplications(@Param('fileNumber') fileNumber: string) {
    const applications =
      await this.applicationService.searchApplicationsByFileNumber(fileNumber);
    return this.applicationService.mapToDtos(applications);
  }
}

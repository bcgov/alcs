import { CONFIG_TOKEN } from '@app/common/config/config.module';
import {
  ServiceNotFoundException,
  ServiceValidationException,
} from '@app/common/exceptions/base.exception';
import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  NotFoundException,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { ROLES_ALLOWED_APPLICATIONS } from '../../common/authorization/roles';
import { RolesGuard } from '../../common/authorization/roles-guard.service';
import { UserRoles } from '../../common/authorization/roles.decorator';
import { formatIncomingDate } from '../../utils/incoming-date.formatter';
import { CardService } from '../card/card.service';
import {
  ApplicationDto,
  CreateApplicationDto,
  UpdateApplicationDto,
} from './application.dto';
import { ApplicationService } from './application.service';
import { EmailService } from '../../providers/email/email.service';
import { generateCANCApplicationHtml } from '../../../../../templates/emails/cancelled';
import { SUBMISSION_STATUS } from '../application/application-submission-status/submission-status.dto';
import { PARENT_TYPE } from '../card/card-subtask/card-subtask.dto';

@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@Controller('application')
@UseGuards(RolesGuard)
export class ApplicationController {
  constructor(
    private applicationService: ApplicationService,
    private cardService: CardService,
    private emailService: EmailService,
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
        alrArea: updates.alrArea,
        agCap: updates.agCap,
        agCapConsultant: updates.agCapConsultant,
        agCapMap: updates.agCapMap,
        agCapSource: updates.agCapSource,
        proposalEndDate: formatIncomingDate(updates.proposalEndDate),
        proposalExpiryDate: formatIncomingDate(updates.proposalExpiryDate),
        nfuUseSubType: updates.nfuUseSubType,
        nfuUseType: updates.nfuUseType,
        inclExclApplicantType: updates.inclExclApplicantType,
        staffObservations: updates.staffObservations,
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

  @Post('/:fileNumber/cancel')
  @UserRoles(...ROLES_ALLOWED_APPLICATIONS)
  async cancel(@Param('fileNumber') fileNumber): Promise<void> {
    const { applicationSubmission, primaryContact, submissionGovernment } =
      await this.emailService.getApplicationEmailData(fileNumber);

    if (primaryContact) {
      await this.emailService.sendApplicationStatusEmail({
        generateStatusHtml: generateCANCApplicationHtml,
        status: SUBMISSION_STATUS.CANCELLED,
        applicationSubmission,
        government: submissionGovernment,
        parentType: PARENT_TYPE.APPLICATION,
        primaryContact,
        ccGovernment: !!submissionGovernment,
      });
    }

    await this.applicationService.cancel(fileNumber);
  }

  @Post('/:fileNumber/uncancel')
  @UserRoles(...ROLES_ALLOWED_APPLICATIONS)
  async uncancel(@Param('fileNumber') fileNumber): Promise<void> {
    await this.applicationService.uncancel(fileNumber);
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

    const updatedCard = await this.cardService.getWithBoard(existingCard.uuid);

    if (!updatedCard) {
      throw new NotFoundException(`Card not found with uuid: ${existingCard}`);
    }

    const application = await this.applicationService.getByCard(
      updatedCard.uuid,
    );

    const cardBody = `${application.fileNumber} (${application.applicant})`;
    await this.cardService.update(
      req.user.entity,
      existingCard.uuid,
      {
        statusCode: applicationUpdates.statusCode,
        assigneeUuid: applicationUpdates.assigneeUuid,
        highPriority: applicationUpdates.highPriority,
      },
      cardBody,
    );

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

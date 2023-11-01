import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApplicationSubmissionStatusService } from '../../alcs/application/application-submission-status/application-submission-status.service';
import { ApplicationSubmissionStatusType } from '../../alcs/application/application-submission-status/submission-status-type.entity';
import { ApplicationStatusDto } from '../../alcs/application/application-submission-status/submission-status.dto';
import { NoticeOfIntentSubmissionStatusType } from '../../alcs/notice-of-intent/notice-of-intent-submission-status/notice-of-intent-status-type.entity';
import { NoticeOfIntentStatusDto } from '../../alcs/notice-of-intent/notice-of-intent-submission-status/notice-of-intent-status.dto';
import { NoticeOfIntentSubmissionStatusService } from '../../alcs/notice-of-intent/notice-of-intent-submission-status/notice-of-intent-submission-status.service';
import { NotificationSubmissionStatusType } from '../../alcs/notification/notification-submission-status/notification-status-type.entity';
import { NotificationStatusDto } from '../../alcs/notification/notification-submission-status/notification-status.dto';
import { NotificationSubmissionStatusService } from '../../alcs/notification/notification-submission-status/notification-submission-status.service';
import { PortalAuthGuard } from '../../common/authorization/portal-auth-guard.service';
import { User } from '../../user/user.entity';
import { UserService } from '../../user/user.service';
import { isStringSetAndNotEmpty } from '../../utils/string-helper';
import { APPLICATION_SUBMISSION_TYPES } from '../pdf-generation/generate-submission-document.service';
import { InboxApplicationSubmissionView } from './application/inbox-application-view.entity';
import { InboxApplicationService } from './application/inbox-application.service';
import {
  AdvancedSearchResultDto,
  ApplicationInboxResultDto,
  InboxRequestDto,
  InboxResponseDto,
  NoticeOfIntentInboxResultDto,
  NotificationInboxResultDto,
} from './inbox.dto';
import { InboxNoticeOfIntentSubmissionView } from './notice-of-intent/inbox-notice-of-intent-view.entity';
import { InboxNoticeOfIntentService } from './notice-of-intent/inbox-notice-of-intent.service';
import { InboxNotificationSubmissionView } from './notification/inbox-notification-view.entity';
import { InboxNotificationService } from './notification/inbox-notification.service';

@Controller('inbox')
@UseGuards(PortalAuthGuard)
export class InboxController {
  constructor(
    @InjectMapper() private mapper: Mapper,
    private noticeOfIntentSearchService: InboxNoticeOfIntentService,
    private applicationSearchService: InboxApplicationService,
    private notificationSearchService: InboxNotificationService,
    private applicationSubmissionStatusService: ApplicationSubmissionStatusService,
    private noiSubStatusService: NoticeOfIntentSubmissionStatusService,
    private notiSubStatusService: NotificationSubmissionStatusService,
    private userService: UserService,
  ) {}

  @Get('/')
  async getStatuses() {
    const appStatuses =
      await this.applicationSubmissionStatusService.listStatuses();
    const noiStatuses = await this.noiSubStatusService.listStatuses();
    const notificationStatuses = await this.notiSubStatusService.listStatuses();

    return {
      application: this.mapper.mapArray(
        appStatuses,
        ApplicationSubmissionStatusType,
        ApplicationStatusDto,
      ),
      noticeOfIntent: this.mapper.mapArray(
        noiStatuses,
        NoticeOfIntentSubmissionStatusType,
        NoticeOfIntentStatusDto,
      ),
      notification: this.mapper.mapArray(
        notificationStatuses,
        NotificationSubmissionStatusType,
        NotificationStatusDto,
      ),
    };
  }

  @Post('/')
  async search(@Body() searchDto: InboxRequestDto, @Req() req) {
    const user = req.user.entity as User;
    const userId = user.uuid;
    const businessGuid = user.bceidBusinessGuid;
    const government = await this.userService.getUserLocalGovernment(user);

    const { searchApplications, searchNoi, searchNotifications } =
      this.getEntitiesTypeToSearch(searchDto);

    let applicationSearchResult: AdvancedSearchResultDto<
      InboxApplicationSubmissionView[]
    > | null = null;
    if (searchApplications) {
      applicationSearchResult =
        await this.applicationSearchService.searchApplications(
          searchDto,
          userId,
          businessGuid,
          government?.uuid ?? null,
        );
    }

    let noticeOfIntentResults: AdvancedSearchResultDto<
      InboxNoticeOfIntentSubmissionView[]
    > | null = null;
    if (searchNoi) {
      noticeOfIntentResults =
        await this.noticeOfIntentSearchService.searchNoticeOfIntents(
          searchDto,
          userId,
          businessGuid,
          government?.uuid ?? null,
        );
    }

    let notifications: AdvancedSearchResultDto<
      InboxNotificationSubmissionView[]
    > | null = null;
    if (searchNotifications) {
      notifications = await this.notificationSearchService.search(
        searchDto,
        userId,
        businessGuid,
        government?.uuid ?? null,
      );
    }

    return this.mapSearchResults(
      applicationSearchResult,
      noticeOfIntentResults,
      notifications,
    );
  }

  @Post('/application')
  async searchApplications(
    @Body() searchDto: InboxRequestDto,
    @Req() req,
  ): Promise<AdvancedSearchResultDto<ApplicationInboxResultDto[]>> {
    const user = req.user.entity as User;
    const userId = user.uuid;
    const businessGuid = user.bceidBusinessGuid;
    const government = await this.userService.getUserLocalGovernment(user);

    const applications = await this.applicationSearchService.searchApplications(
      searchDto,
      userId,
      businessGuid,
      government?.uuid ?? null,
    );

    const mappedSearchResult = this.mapSearchResults(applications, null, null);

    return {
      total: mappedSearchResult.totalApplications,
      data: mappedSearchResult.applications,
    };
  }

  @Post('/notice-of-intent')
  async searchNoticeOfIntents(
    @Body() searchDto: InboxRequestDto,
    @Req() req,
  ): Promise<AdvancedSearchResultDto<NoticeOfIntentInboxResultDto[]>> {
    const user = req.user.entity as User;
    const userId = user.uuid;
    const businessGuid = user.bceidBusinessGuid;
    const government = await this.userService.getUserLocalGovernment(user);

    const noticeOfIntents =
      await this.noticeOfIntentSearchService.searchNoticeOfIntents(
        searchDto,
        userId,
        businessGuid,
        government?.uuid ?? null,
      );

    const mappedSearchResult = this.mapSearchResults(
      null,
      noticeOfIntents,
      null,
    );

    return {
      total: mappedSearchResult.totalNoticeOfIntents,
      data: mappedSearchResult.noticeOfIntents,
    };
  }

  @Post('/notifications')
  async searchNotifications(
    @Body() searchDto: InboxRequestDto,
    @Req() req,
  ): Promise<AdvancedSearchResultDto<NotificationInboxResultDto[]>> {
    const user = req.user.entity as User;
    const userId = user.uuid;
    const businessGuid = user.bceidBusinessGuid;
    const government = await this.userService.getUserLocalGovernment(user);

    const notifications = await this.notificationSearchService.search(
      searchDto,
      userId,
      businessGuid,
      government?.uuid ?? null,
    );

    const mappedSearchResult = this.mapSearchResults(null, null, notifications);

    return {
      total: mappedSearchResult.totalNotifications,
      data: mappedSearchResult.notifications,
    };
  }

  private getEntitiesTypeToSearch(searchDto: InboxRequestDto) {
    let searchApplications = true;
    let noiTypeSpecified = false;
    let notificationTypeSpecified = false;

    if (searchDto.fileTypes.length > 0) {
      searchApplications =
        searchDto.fileTypes.filter((searchType) =>
          Object.values(APPLICATION_SUBMISSION_TYPES).includes(
            APPLICATION_SUBMISSION_TYPES[
              searchType as keyof typeof APPLICATION_SUBMISSION_TYPES
            ],
          ),
        ).length > 0;

      noiTypeSpecified = searchDto.fileTypes.includes('NOI');
      notificationTypeSpecified = searchDto.fileTypes.includes('SRW');
    }

    const searchNoi =
      (searchDto.fileTypes.length > 0 ? noiTypeSpecified : true) &&
      !isStringSetAndNotEmpty(searchDto.governmentFileNumber);

    const searchNotifications =
      (searchDto.fileTypes.length > 0 ? notificationTypeSpecified : true) &&
      !isStringSetAndNotEmpty(searchDto.governmentFileNumber);

    return {
      searchApplications,
      searchNoi,
      searchNotifications,
    };
  }

  private mapSearchResults(
    applications: AdvancedSearchResultDto<
      InboxApplicationSubmissionView[]
    > | null,
    noticeOfIntents: AdvancedSearchResultDto<
      InboxNoticeOfIntentSubmissionView[]
    > | null,
    notifications: AdvancedSearchResultDto<
      InboxNotificationSubmissionView[]
    > | null,
  ) {
    const response = new InboxResponseDto();

    const mappedApplications: ApplicationInboxResultDto[] = [];
    if (applications && applications.data.length > 0) {
      mappedApplications.push(
        ...applications.data.map((app) =>
          this.mapApplicationToSearchResult(app),
        ),
      );
    }

    const mappedNoticeOfIntents: NoticeOfIntentInboxResultDto[] = [];
    if (noticeOfIntents && noticeOfIntents.data.length > 0) {
      mappedNoticeOfIntents.push(
        ...noticeOfIntents.data.map((noi) =>
          this.mapNoticeOfIntentToSearchResult(noi),
        ),
      );
    }

    const mappedNotifications: NotificationInboxResultDto[] = [];
    if (notifications && notifications.data && notifications.data.length > 0) {
      mappedNotifications.push(
        ...notifications.data.map((notification) =>
          this.mapNotificationToSearchResult(notification),
        ),
      );
    }

    response.applications = mappedApplications;
    response.totalApplications = applications?.total ?? 0;
    response.noticeOfIntents = mappedNoticeOfIntents;
    response.totalNoticeOfIntents = noticeOfIntents?.total ?? 0;
    response.notifications = mappedNotifications;
    response.totalNotifications = notifications?.total ?? 0;

    return response;
  }

  private mapApplicationToSearchResult(
    application: InboxApplicationSubmissionView,
  ): ApplicationInboxResultDto {
    return {
      referenceId: application.fileNumber,
      fileNumber: application.fileNumber,
      type: application.applicationType.label,
      createdAt: application.createdAt.getTime(),
      lastUpdate: application.lastUpdate?.getTime(),
      ownerName: application.applicant,
      class: 'APP',
      status: application.status.status_type_code,
    };
  }

  private mapNoticeOfIntentToSearchResult(
    noi: InboxNoticeOfIntentSubmissionView,
  ): NoticeOfIntentInboxResultDto {
    return {
      referenceId: noi.fileNumber,
      fileNumber: noi.fileNumber,
      createdAt: noi.createdAt.getTime(),
      lastUpdate: noi.lastUpdate?.getTime(),
      type: noi.noticeOfIntentType.label,
      ownerName: noi.applicant,
      class: 'NOI',
      status: noi.status.status_type_code,
    };
  }

  private mapNotificationToSearchResult(
    notification: InboxNotificationSubmissionView,
  ): NotificationInboxResultDto {
    return {
      referenceId: notification.fileNumber,
      fileNumber: notification.fileNumber,
      createdAt: notification.createdAt.getTime(),
      lastUpdate: notification.status.effective_date,
      type: notification.notificationType.label,
      ownerName: notification.applicant,
      class: 'NOTI',
      status: notification.status.status_type_code,
    };
  }
}

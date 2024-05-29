import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Mapper } from 'automapper-core';
import { InjectMapper } from 'automapper-nestjs';
import { Repository } from 'typeorm';
import { ApplicationSubmissionStatusService } from '../../alcs/application/application-submission-status/application-submission-status.service';
import { ApplicationSubmissionStatusType } from '../../alcs/application/application-submission-status/submission-status-type.entity';
import { ApplicationStatusDto } from '../../alcs/application/application-submission-status/submission-status.dto';
import { ApplicationType } from '../../alcs/code/application-code/application-type/application-type.entity';
import { NoticeOfIntentSubmissionStatusType } from '../../alcs/notice-of-intent/notice-of-intent-submission-status/notice-of-intent-status-type.entity';
import { NoticeOfIntentStatusDto } from '../../alcs/notice-of-intent/notice-of-intent-submission-status/notice-of-intent-status.dto';
import { NoticeOfIntentSubmissionStatusService } from '../../alcs/notice-of-intent/notice-of-intent-submission-status/notice-of-intent-submission-status.service';
import { NoticeOfIntentType } from '../../alcs/notice-of-intent/notice-of-intent-type/notice-of-intent-type.entity';
import { NotificationSubmissionStatusType } from '../../alcs/notification/notification-submission-status/notification-status-type.entity';
import { NotificationStatusDto } from '../../alcs/notification/notification-submission-status/notification-status.dto';
import { NotificationSubmissionStatusService } from '../../alcs/notification/notification-submission-status/notification-submission-status.service';
import { NotificationType } from '../../alcs/notification/notification-type/notification-type.entity';
import { PortalAuthGuard } from '../../common/authorization/portal-auth-guard.service';
import { User } from '../../user/user.entity';
import { UserService } from '../../user/user.service';
import { isStringSetAndNotEmpty } from '../../utils/string-helper';
import { APPLICATION_SUBMISSION_TYPES } from '../pdf-generation/generate-submission-document.service';
import { ApplicationSearchResultDto } from '../public/search/public-search.dto';
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
    @InjectRepository(ApplicationType)
    private appTypeRepo: Repository<ApplicationType>,
    @InjectRepository(NoticeOfIntentType)
    private noiTypeRepo: Repository<NoticeOfIntentType>,
    @InjectRepository(NotificationType)
    private notificationTypeRepo: Repository<NotificationType>,
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

    return await this.mapSearchResults(
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

    const mappedSearchResult = await this.mapSearchResults(
      applications,
      null,
      null,
    );

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

    const mappedSearchResult = await this.mapSearchResults(
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

    const mappedSearchResult = await this.mapSearchResults(
      null,
      null,
      notifications,
    );

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

  private async mapSearchResults(
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

    const mappedApplications: ApplicationSearchResultDto[] = [];
    if (applications && applications.data.length > 0) {
      const appTypes = await this.appTypeRepo.find({
        select: {
          code: true,
          label: true,
        },
      });
      const appTypeMap = new Map<string, ApplicationType>();
      for (const type of appTypes) {
        appTypeMap.set(type.code, type);
      }
      mappedApplications.push(
        ...applications.data.map((app) =>
          this.mapApplicationToSearchResult(app, appTypeMap),
        ),
      );
    }

    const mappedNoticeOfIntents: NoticeOfIntentInboxResultDto[] = [];
    if (noticeOfIntents && noticeOfIntents.data.length > 0) {
      const noiTypes = await this.noiTypeRepo.find({
        select: {
          code: true,
          label: true,
        },
      });
      const noiTypeMap = new Map<string, NoticeOfIntentType>();
      for (const type of noiTypes) {
        noiTypeMap.set(type.code, type);
      }

      mappedNoticeOfIntents.push(
        ...noticeOfIntents.data.map((noi) =>
          this.mapNoticeOfIntentToSearchResult(noi, noiTypeMap),
        ),
      );
    }

    const mappedNotifications: NotificationInboxResultDto[] = [];
    if (notifications && notifications.data && notifications.data.length > 0) {
      const notificationTypes = await this.notificationTypeRepo.find({
        select: {
          code: true,
          label: true,
        },
      });
      const notificationTypeMap = new Map<string, NoticeOfIntentType>();
      for (const type of notificationTypes) {
        notificationTypeMap.set(type.code, type);
      }

      mappedNotifications.push(
        ...notifications.data.map((notification) =>
          this.mapNotificationToSearchResult(notification, notificationTypeMap),
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
    appTypeMap: Map<string, ApplicationType>,
  ): ApplicationInboxResultDto {
    return {
      referenceId: application.fileNumber,
      fileNumber: application.fileNumber,
      type: appTypeMap.get(application.applicationTypeCode)!.label,
      createdAt: application.createdAt.getTime(),
      lastUpdate: application.lastUpdate?.getTime(),
      ownerName: application.applicant,
      class: 'APP',
      status: application.status.status_type_code,
    };
  }

  private mapNoticeOfIntentToSearchResult(
    noi: InboxNoticeOfIntentSubmissionView,
    noiTypeMap: Map<string, NoticeOfIntentType>,
  ): NoticeOfIntentInboxResultDto {
    return {
      referenceId: noi.fileNumber,
      fileNumber: noi.fileNumber,
      createdAt: noi.createdAt.getTime(),
      lastUpdate: noi.lastUpdate?.getTime(),
      type: noiTypeMap.get(noi.noticeOfIntentTypeCode)!.label,
      ownerName: noi.applicant,
      class: 'NOI',
      status: noi.status.status_type_code,
    };
  }

  private mapNotificationToSearchResult(
    notification: InboxNotificationSubmissionView,
    notificationTypeMap: Map<string, NotificationType>,
  ): NotificationInboxResultDto {
    return {
      referenceId: notification.fileNumber,
      fileNumber: notification.fileNumber,
      createdAt: notification.createdAt.getTime(),
      lastUpdate: notification.status.effective_date,
      type: notificationTypeMap.get(notification.notificationTypeCode)!.label,
      ownerName: notification.applicant,
      class: 'NOTI',
      status: notification.status.status_type_code,
    };
  }
}

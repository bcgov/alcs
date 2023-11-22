import { Mapper } from 'automapper-core';
import { InjectMapper } from 'automapper-nestjs';
import { Body, Controller, Post } from '@nestjs/common';
import { Public } from 'nest-keycloak-connect';
import { isStringSetAndNotEmpty } from '../../../utils/string-helper';
import { APPLICATION_SUBMISSION_TYPES } from '../../pdf-generation/generate-submission-document.service';
import { PublicApplicationSubmissionSearchView } from './application/public-application-search-view.entity';
import { PublicApplicationSearchService } from './application/public-application-search.service';
import { PublicNoticeOfIntentSubmissionSearchView } from './notice-of-intent/public-notice-of-intent-search-view.entity';
import { PublicNoticeOfIntentSearchService } from './notice-of-intent/public-notice-of-intent-search.service';
import { PublicNotificationSubmissionSearchView } from './notification/public-notification-search-view.entity';
import { PublicNotificationSearchService } from './notification/public-notification-search.service';
import {
  AdvancedSearchResponseDto,
  AdvancedSearchResultDto,
  ApplicationSearchResultDto,
  NoticeOfIntentSearchResultDto,
  NotificationSearchResultDto,
  SearchRequestDto,
} from './public-search.dto';

@Public()
@Controller('search')
export class PublicSearchController {
  constructor(
    @InjectMapper() private mapper: Mapper,
    private noticeOfIntentSearchService: PublicNoticeOfIntentSearchService,
    private applicationSearchService: PublicApplicationSearchService,
    private notificationSearchService: PublicNotificationSearchService,
  ) {}

  @Post('/')
  async search(@Body() searchDto: SearchRequestDto) {
    const { searchApplications, searchNoi, searchNotifications } =
      this.getEntitiesTypeToSearch(searchDto);

    let applicationSearchResult: AdvancedSearchResultDto<
      PublicApplicationSubmissionSearchView[]
    > | null = null;
    if (searchApplications) {
      applicationSearchResult =
        await this.applicationSearchService.searchApplications(searchDto);
    }

    let noticeOfIntentResults: AdvancedSearchResultDto<
      PublicNoticeOfIntentSubmissionSearchView[]
    > | null = null;
    if (searchNoi) {
      noticeOfIntentResults =
        await this.noticeOfIntentSearchService.searchNoticeOfIntents(searchDto);
    }

    let notifications: AdvancedSearchResultDto<
      PublicNotificationSubmissionSearchView[]
    > | null = null;
    if (searchNotifications) {
      notifications = await this.notificationSearchService.search(searchDto);
    }

    return this.mapSearchResults(
      applicationSearchResult,
      noticeOfIntentResults,
      notifications,
    );
  }

  @Post('/application')
  async searchApplications(
    @Body() searchDto: SearchRequestDto,
  ): Promise<AdvancedSearchResultDto<ApplicationSearchResultDto[]>> {
    const applications =
      await this.applicationSearchService.searchApplications(searchDto);

    const mappedSearchResult = this.mapSearchResults(applications, null, null);

    return {
      total: mappedSearchResult.totalApplications,
      data: mappedSearchResult.applications,
    };
  }

  @Post('/notice-of-intent')
  async searchNoticeOfIntents(
    @Body() searchDto: SearchRequestDto,
  ): Promise<AdvancedSearchResultDto<NoticeOfIntentSearchResultDto[]>> {
    const noticeOfIntents =
      await this.noticeOfIntentSearchService.searchNoticeOfIntents(searchDto);

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
    @Body() searchDto: SearchRequestDto,
  ): Promise<AdvancedSearchResultDto<NotificationSearchResultDto[]>> {
    const notifications =
      await this.notificationSearchService.search(searchDto);

    const mappedSearchResult = this.mapSearchResults(null, null, notifications);

    return {
      total: mappedSearchResult.totalNotifications,
      data: mappedSearchResult.notifications,
    };
  }

  private getEntitiesTypeToSearch(searchDto: SearchRequestDto) {
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
      (searchDto.decisionMakerCode
        ? searchDto.decisionMakerCode === 'CEOP'
        : true);

    const searchNotifications =
      (searchDto.fileTypes.length > 0 ? notificationTypeSpecified : true) &&
      !searchDto.dateDecidedFrom &&
      !searchDto.dateDecidedTo &&
      !searchDto.decisionMakerCode &&
      !searchDto.decisionOutcome &&
      !isStringSetAndNotEmpty(searchDto.civicAddress);

    return {
      searchApplications,
      searchNoi,
      searchNotifications,
    };
  }

  private mapSearchResults(
    applications: AdvancedSearchResultDto<
      PublicApplicationSubmissionSearchView[]
    > | null,
    noticeOfIntents: AdvancedSearchResultDto<
      PublicNoticeOfIntentSubmissionSearchView[]
    > | null,
    notifications: AdvancedSearchResultDto<
      PublicNotificationSubmissionSearchView[]
    > | null,
  ) {
    const response = new AdvancedSearchResponseDto();

    const mappedApplications: ApplicationSearchResultDto[] = [];
    if (applications && applications.data.length > 0) {
      mappedApplications.push(
        ...applications.data.map((app) =>
          this.mapApplicationToSearchResult(app),
        ),
      );
    }

    const mappedNoticeOfIntents: NoticeOfIntentSearchResultDto[] = [];
    if (noticeOfIntents && noticeOfIntents.data.length > 0) {
      mappedNoticeOfIntents.push(
        ...noticeOfIntents.data.map((noi) =>
          this.mapNoticeOfIntentToSearchResult(noi),
        ),
      );
    }

    const mappedNotifications: NotificationSearchResultDto[] = [];
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
    application: PublicApplicationSubmissionSearchView,
  ): ApplicationSearchResultDto {
    return {
      referenceId: application.fileNumber,
      fileNumber: application.fileNumber,
      dateSubmitted: application.dateSubmittedToAlc?.getTime(),
      type: application.applicationType.label,
      lastUpdate: application.lastUpdate?.getTime(),
      localGovernmentName: application.localGovernmentName,
      ownerName: application.applicant,
      class: 'APP',
      status: application.status.status_type_code,
    };
  }

  private mapNoticeOfIntentToSearchResult(
    noi: PublicNoticeOfIntentSubmissionSearchView,
  ): NoticeOfIntentSearchResultDto {
    return {
      referenceId: noi.fileNumber,
      fileNumber: noi.fileNumber,
      lastUpdate: noi.lastUpdate?.getTime(),
      dateSubmitted: noi.dateSubmittedToAlc?.getTime(),
      type: noi.noticeOfIntentType.label,
      localGovernmentName: noi.localGovernmentName,
      ownerName: noi.applicant,
      class: 'NOI',
      status: noi.status.status_type_code,
    };
  }

  private mapNotificationToSearchResult(
    notification: PublicNotificationSubmissionSearchView,
  ): NotificationSearchResultDto {
    return {
      referenceId: notification.fileNumber,
      fileNumber: notification.fileNumber,
      lastUpdate: notification.status.effective_date,
      dateSubmitted: notification.dateSubmittedToAlc?.getTime(),
      type: notification.notificationType.label,
      localGovernmentName: notification.localGovernmentName,
      ownerName: notification.applicant,
      class: 'NOTI',
      status: notification.status.status_type_code,
    };
  }
}

import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { ROLES_ALLOWED_APPLICATIONS } from '../../common/authorization/roles';
import { RolesGuard } from '../../common/authorization/roles-guard.service';
import { UserRoles } from '../../common/authorization/roles.decorator';
import { APPLICATION_SUBMISSION_TYPES } from '../../portal/pdf-generation/generate-submission-document.service';
import { isStringSetAndNotEmpty } from '../../utils/string-helper';
import { Application } from '../application/application.entity';
import { CARD_TYPE } from '../card/card-type/card-type.entity';
import { ApplicationTypeDto } from '../code/application-code/application-type/application-type.dto';
import { ApplicationType } from '../code/application-code/application-type/application-type.entity';
import { Covenant } from '../covenant/covenant.entity';
import { NoticeOfIntent } from '../notice-of-intent/notice-of-intent.entity';
import { Notification } from '../notification/notification.entity';
import { PlanningReview } from '../planning-review/planning-review.entity';
import { ApplicationAdvancedSearchService } from './application/application-advanced-search.service';
import { ApplicationSubmissionSearchView } from './application/application-search-view.entity';
import { NonApplicationSearchView } from './non-applications/non-applications-view.entity';
import { NonApplicationsAdvancedSearchService } from './non-applications/non-applications.service';
import { NoticeOfIntentAdvancedSearchService } from './notice-of-intent/notice-of-intent-advanced-search.service';
import { NoticeOfIntentSubmissionSearchView } from './notice-of-intent/notice-of-intent-search-view.entity';
import { NotificationAdvancedSearchService } from './notification/notification-advanced-search.service';
import { NotificationSubmissionSearchView } from './notification/notification-search-view.entity';
import {
  AdvancedSearchResponseDto,
  AdvancedSearchResultDto,
  ApplicationSearchResultDto,
  NonApplicationSearchResultDto,
  NonApplicationsSearchRequestDto,
  NoticeOfIntentSearchResultDto,
  NotificationSearchResultDto,
  SearchRequestDto,
  SearchResultDto,
} from './search.dto';
import { SearchService } from './search.service';

@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@UseGuards(RolesGuard)
@Controller('search')
export class SearchController {
  constructor(
    private searchService: SearchService,
    @InjectMapper() private mapper: Mapper,
    private noticeOfIntentSearchService: NoticeOfIntentAdvancedSearchService,
    private applicationSearchService: ApplicationAdvancedSearchService,
    private nonApplicationsSearchService: NonApplicationsAdvancedSearchService,
    private notificationSearchService: NotificationAdvancedSearchService,
  ) {}

  @UserRoles(...ROLES_ALLOWED_APPLICATIONS)
  @Get('/:searchTerm')
  async search(@Param('searchTerm') searchTerm) {
    const application = await this.searchService.getApplication(searchTerm);
    const noi = await this.searchService.getNoi(searchTerm);
    const planningReview = await this.searchService.getPlanningReview(
      searchTerm,
    );
    const covenant = await this.searchService.getCovenant(searchTerm);
    const notification = await this.searchService.getNotification(searchTerm);

    const result: SearchResultDto[] = [];

    this.mapSearchResults(
      result,
      application,
      noi,
      planningReview,
      covenant,
      notification,
    );

    return result;
  }

  private mapSearchResults(
    result: SearchResultDto[],
    application: Application | null,
    noi: NoticeOfIntent | null,
    planningReview: PlanningReview | null,
    covenant: Covenant | null,
    notification: Notification | null,
  ) {
    if (application) {
      result.push(this.mapApplicationToSearchResult(application));
    }

    if (noi) {
      result.push(this.mapNoticeOfIntentToSearchResult(noi));
    }

    if (planningReview) {
      result.push(this.mapPlanningReviewToSearchResult(planningReview));
    }

    if (covenant) {
      result.push(this.mapCovenantToSearchResult(covenant));
    }

    if (notification) {
      result.push(this.mapNotificationToSearchResult(notification));
    }
  }

  private mapApplicationToSearchResult(
    application: Application,
  ): SearchResultDto {
    return {
      type: CARD_TYPE.APP,
      referenceId: application.fileNumber,
      localGovernmentName: application.localGovernment?.name,
      applicant: application.applicant,
      fileNumber: application.fileNumber,
      label: this.mapper.map(
        application.type,
        ApplicationType,
        ApplicationTypeDto,
      ),
    };
  }

  private mapNoticeOfIntentToSearchResult(
    noi: NoticeOfIntent,
  ): SearchResultDto {
    return {
      type: CARD_TYPE.NOI,
      referenceId: noi.fileNumber,
      localGovernmentName: noi.localGovernment?.name,
      applicant: noi.applicant,
      fileNumber: noi.fileNumber,
    };
  }

  private mapPlanningReviewToSearchResult(
    planning: PlanningReview,
  ): SearchResultDto {
    return {
      type: CARD_TYPE.PLAN,
      referenceId: planning.cardUuid,
      localGovernmentName: planning.localGovernment?.name,
      fileNumber: planning.fileNumber,
      boardCode: planning.card.board.code,
    };
  }

  private mapCovenantToSearchResult(covenant: Covenant): SearchResultDto {
    return {
      type: CARD_TYPE.COV,
      referenceId: covenant.cardUuid,
      localGovernmentName: covenant.localGovernment?.name,
      applicant: covenant.applicant,
      fileNumber: covenant.fileNumber,
      boardCode: covenant.card.board.code,
    };
  }

  private mapNotificationToSearchResult(
    notification: Notification,
  ): SearchResultDto {
    return {
      type: CARD_TYPE.NOTIFICATION,
      referenceId: notification.fileNumber,
      localGovernmentName: notification.localGovernment?.name,
      applicant: notification.applicant,
      fileNumber: notification.fileNumber,
    };
  }

  @Post('/advanced')
  @UserRoles(...ROLES_ALLOWED_APPLICATIONS)
  async advancedSearch(@Body() searchDto: SearchRequestDto) {
    const {
      searchApplications,
      searchNoi,
      searchNonApplications,
      searchNotifications,
    } = this.getEntitiesTypeToSearch(searchDto);

    let applicationSearchResult: AdvancedSearchResultDto<
      ApplicationSubmissionSearchView[]
    > | null = null;
    if (searchApplications) {
      applicationSearchResult =
        await this.applicationSearchService.searchApplications(searchDto);
    }

    let noticeOfIntentSearchService: AdvancedSearchResultDto<
      NoticeOfIntentSubmissionSearchView[]
    > | null = null;
    if (searchNoi) {
      noticeOfIntentSearchService =
        await this.noticeOfIntentSearchService.searchNoticeOfIntents(searchDto);
    }

    let nonApplications: AdvancedSearchResultDto<
      NonApplicationSearchView[]
    > | null = null;
    if (searchNonApplications) {
      nonApplications =
        await this.nonApplicationsSearchService.searchNonApplications(
          searchDto,
        );
    }

    let notifications: AdvancedSearchResultDto<
      NotificationSubmissionSearchView[]
    > | null = null;
    if (searchNotifications) {
      notifications = await this.notificationSearchService.search(searchDto);
    }

    return this.mapAdvancedSearchResults(
      applicationSearchResult,
      noticeOfIntentSearchService,
      nonApplications,
      notifications,
    );
  }

  @Post('/advanced/application')
  @UserRoles(...ROLES_ALLOWED_APPLICATIONS)
  async advancedSearchApplications(
    @Body() searchDto: SearchRequestDto,
  ): Promise<AdvancedSearchResultDto<ApplicationSearchResultDto[]>> {
    const applications = await this.applicationSearchService.searchApplications(
      searchDto,
    );

    const mappedSearchResult = this.mapAdvancedSearchResults(
      applications,
      null,
      null,
      null,
    );

    return {
      total: mappedSearchResult.totalApplications,
      data: mappedSearchResult.applications,
    };
  }

  @Post('/advanced/notice-of-intent')
  @UserRoles(...ROLES_ALLOWED_APPLICATIONS)
  async advancedSearchNoticeOfIntents(
    @Body() searchDto: SearchRequestDto,
  ): Promise<AdvancedSearchResultDto<NoticeOfIntentSearchResultDto[]>> {
    const noticeOfIntents =
      await this.noticeOfIntentSearchService.searchNoticeOfIntents(searchDto);

    const mappedSearchResult = this.mapAdvancedSearchResults(
      null,
      noticeOfIntents,
      null,
      null,
    );

    return {
      total: mappedSearchResult.totalNoticeOfIntents,
      data: mappedSearchResult.noticeOfIntents,
    };
  }

  @Post('/advanced/non-applications')
  @UserRoles(...ROLES_ALLOWED_APPLICATIONS)
  async advancedSearchNonApplications(
    @Body() searchDto: NonApplicationsSearchRequestDto,
  ): Promise<AdvancedSearchResultDto<NonApplicationSearchResultDto[]>> {
    const nonApplications =
      await this.nonApplicationsSearchService.searchNonApplications(searchDto);

    const mappedSearchResult = this.mapAdvancedSearchResults(
      null,
      null,
      nonApplications,
      null,
    );

    return {
      total: mappedSearchResult.totalNonApplications,
      data: mappedSearchResult.nonApplications,
    };
  }

  @Post('/advanced/notifications')
  @UserRoles(...ROLES_ALLOWED_APPLICATIONS)
  async advancedSearchNotifications(
    @Body() searchDto: SearchRequestDto,
  ): Promise<AdvancedSearchResultDto<NonApplicationSearchResultDto[]>> {
    const notifications = await this.notificationSearchService.search(
      searchDto,
    );

    const mappedSearchResult = this.mapAdvancedSearchResults(
      null,
      null,
      null,
      notifications,
    );

    return {
      total: mappedSearchResult.totalNonApplications,
      data: mappedSearchResult.nonApplications,
    };
  }

  private getEntitiesTypeToSearch(searchDto: SearchRequestDto) {
    let searchApplications = true;

    let nonApplicationTypeSpecified = false;
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

      nonApplicationTypeSpecified = searchDto.fileTypes.some((searchType) =>
        ['COV', 'PLAN'].includes(searchType),
      );
    }

    const searchNoi =
      (searchDto.fileTypes.length > 0 ? noiTypeSpecified : true) &&
      !searchDto.isIncludeOtherParcels &&
      !isStringSetAndNotEmpty(searchDto.legacyId);

    const searchNonApplications =
      (searchDto.fileTypes.length > 0 ? nonApplicationTypeSpecified : true) &&
      !searchDto.dateDecidedFrom &&
      !searchDto.dateDecidedTo &&
      !searchDto.resolutionNumber &&
      !searchDto.resolutionYear &&
      !searchDto.isIncludeOtherParcels &&
      !isStringSetAndNotEmpty(searchDto.legacyId);

    const searchNotifications =
      (searchDto.fileTypes.length > 0 ? notificationTypeSpecified : true) &&
      !searchDto.dateDecidedFrom &&
      !searchDto.dateDecidedTo &&
      !searchDto.resolutionNumber &&
      !searchDto.resolutionYear &&
      !searchDto.isIncludeOtherParcels &&
      !isStringSetAndNotEmpty(searchDto.legacyId);

    return {
      searchApplications,
      searchNoi,
      searchNonApplications,
      searchNotifications,
    };
  }

  private mapAdvancedSearchResults(
    applications: AdvancedSearchResultDto<
      ApplicationSubmissionSearchView[]
    > | null,
    noticeOfIntents: AdvancedSearchResultDto<
      NoticeOfIntentSubmissionSearchView[]
    > | null,
    nonApplications: AdvancedSearchResultDto<NonApplicationSearchView[]> | null,
    notifications: AdvancedSearchResultDto<
      NotificationSubmissionSearchView[]
    > | null,
  ) {
    const response = new AdvancedSearchResponseDto();

    const mappedApplications: ApplicationSearchResultDto[] = [];
    if (applications && applications.data.length > 0) {
      mappedApplications.push(
        ...applications.data.map((app) =>
          this.mapApplicationToAdvancedSearchResult(app),
        ),
      );
    }

    const mappedNoticeOfIntents: NoticeOfIntentSearchResultDto[] = [];
    if (noticeOfIntents && noticeOfIntents.data.length > 0) {
      mappedNoticeOfIntents.push(
        ...noticeOfIntents.data.map((noi) =>
          this.mapNoticeOfIntentToAdvancedSearchResult(noi),
        ),
      );
    }

    const mappedNonApplications: NonApplicationSearchResultDto[] = [];
    if (nonApplications?.data && nonApplications?.data.length > 0) {
      mappedNonApplications.push(
        ...nonApplications.data.map((nonApplication) =>
          this.mapNonApplicationToAdvancedSearchResult(nonApplication),
        ),
      );
    }

    const mappedNotifications: NotificationSearchResultDto[] = [];
    if (notifications && notifications.data && notifications.data.length > 0) {
      mappedNotifications.push(
        ...notifications.data.map((notification) =>
          this.mapNotificationToAdvancedSearchResult(notification),
        ),
      );
    }

    response.applications = mappedApplications;
    response.totalApplications = applications?.total ?? 0;
    response.noticeOfIntents = mappedNoticeOfIntents;
    response.totalNoticeOfIntents = noticeOfIntents?.total ?? 0;
    response.nonApplications = mappedNonApplications;
    response.totalNonApplications = nonApplications?.total ?? 0;
    response.notifications = mappedNotifications;
    response.totalNotifications = notifications?.total ?? 0;

    return response;
  }

  private mapApplicationToAdvancedSearchResult(
    application: ApplicationSubmissionSearchView,
  ): ApplicationSearchResultDto {
    return {
      referenceId: application.fileNumber,
      fileNumber: application.fileNumber,
      dateSubmitted: application.dateSubmittedToAlc?.getTime(),
      type: this.mapper.map(
        application.applicationType,
        ApplicationType,
        ApplicationTypeDto,
      ),
      localGovernmentName: application.localGovernmentName,
      ownerName: application.applicant,
      class: 'APP',
      status: application.status.status_type_code,
    };
  }

  private mapNoticeOfIntentToAdvancedSearchResult(
    noi: NoticeOfIntentSubmissionSearchView,
  ): NoticeOfIntentSearchResultDto {
    return {
      referenceId: noi.fileNumber,
      fileNumber: noi.fileNumber,
      dateSubmitted: noi.dateSubmittedToAlc?.getTime(),
      type: this.mapper.map(
        noi.noticeOfIntentType,
        ApplicationType,
        ApplicationTypeDto,
      ),
      localGovernmentName: noi.localGovernmentName,
      ownerName: noi.applicant,
      class: 'NOI',
      status: noi.status.status_type_code,
    };
  }

  private mapNonApplicationToAdvancedSearchResult(
    nonApplication: NonApplicationSearchView,
  ): NonApplicationSearchResultDto {
    return {
      referenceId: nonApplication.cardUuid,
      fileNumber: nonApplication.fileNumber,
      applicant: nonApplication.applicant,
      boardCode: nonApplication.boardCode,
      type: nonApplication.type,
      localGovernmentName: nonApplication.localGovernment?.name ?? null,
      class: nonApplication.class,
    };
  }

  private mapNotificationToAdvancedSearchResult(
    notification: NotificationSubmissionSearchView,
  ): NoticeOfIntentSearchResultDto {
    return {
      referenceId: notification.fileNumber,
      fileNumber: notification.fileNumber,
      dateSubmitted: notification.dateSubmittedToAlc?.getTime(),
      type: this.mapper.map(
        notification.notificationType,
        ApplicationType,
        ApplicationTypeDto,
      ),
      localGovernmentName: notification.localGovernmentName,
      ownerName: notification.applicant,
      class: 'NOTI',
      status: notification.status.status_type_code,
    };
  }
}

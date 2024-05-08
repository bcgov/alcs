import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Mapper } from 'automapper-core';
import { InjectMapper } from 'automapper-nestjs';
import * as config from 'config';
import { DataSource, Repository } from 'typeorm';
import { ROLES_ALLOWED_APPLICATIONS } from '../../common/authorization/roles';
import { RolesGuard } from '../../common/authorization/roles-guard.service';
import { UserRoles } from '../../common/authorization/roles.decorator';
import { APPLICATION_SUBMISSION_TYPES } from '../../portal/pdf-generation/generate-submission-document.service';
import { isStringSetAndNotEmpty } from '../../utils/string-helper';
import { Application } from '../application/application.entity';
import { CARD_TYPE } from '../card/card-type/card-type.entity';
import { ApplicationTypeDto } from '../code/application-code/application-type/application-type.dto';
import { ApplicationType } from '../code/application-code/application-type/application-type.entity';
import { INQUIRY_TYPES } from '../inquiry/inquiry.dto';
import { Inquiry } from '../inquiry/inquiry.entity';
import { NoticeOfIntent } from '../notice-of-intent/notice-of-intent.entity';
import { Notification } from '../notification/notification.entity';
import { PLANNING_REVIEW_TYPES } from '../planning-review/planning-review.dto';
import { PlanningReview } from '../planning-review/planning-review.entity';
import { ApplicationAdvancedSearchService } from './application/application-advanced-search.service';
import { ApplicationSubmissionSearchView } from './application/application-search-view.entity';
import { InquiryAdvancedSearchService } from './inquiry/inquiry-advanced-search.service';
import { InquirySearchView } from './inquiry/inquiry-search-view.entity';
import { NoticeOfIntentAdvancedSearchService } from './notice-of-intent/notice-of-intent-advanced-search.service';
import { NoticeOfIntentSubmissionSearchView } from './notice-of-intent/notice-of-intent-search-view.entity';
import { NotificationAdvancedSearchService } from './notification/notification-advanced-search.service';
import { NotificationSubmissionSearchView } from './notification/notification-search-view.entity';
import { PlanningReviewAdvancedSearchService } from './planning-review/planning-review-advanced-search.service';
import { PlanningReviewSearchView } from './planning-review/planning-review-search-view.entity';
import {
  AdvancedSearchResponseDto,
  AdvancedSearchResultDto,
  ApplicationSearchResultDto,
  InquirySearchResultDto,
  NoticeOfIntentSearchResultDto,
  NotificationSearchResultDto,
  PlanningReviewSearchResultDto,
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
    private notificationSearchService: NotificationAdvancedSearchService,
    private planningReviewSearchService: PlanningReviewAdvancedSearchService,
    private inquirySearchService: InquiryAdvancedSearchService,
    @InjectRepository(ApplicationType)
    private appTypeRepo: Repository<ApplicationType>,
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  @UserRoles(...ROLES_ALLOWED_APPLICATIONS)
  @Get('/:searchTerm')
  async search(@Param('searchTerm') searchTerm) {
    const application = await this.searchService.getApplication(searchTerm);
    const noi = await this.searchService.getNoi(searchTerm);
    const notification = await this.searchService.getNotification(searchTerm);
    const planningReview =
      await this.searchService.getPlanningReview(searchTerm);
    const inquiry = await this.searchService.getInquiry(searchTerm);

    const result: SearchResultDto[] = [];

    this.mapSearchResults(
      result,
      application,
      noi,
      planningReview,
      notification,
      inquiry,
    );

    return result;
  }

  private mapSearchResults(
    result: SearchResultDto[],
    application: Application | null,
    noi: NoticeOfIntent | null,
    planningReview: PlanningReview | null,
    notification: Notification | null,
    inquiry: Inquiry | null,
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

    if (notification) {
      result.push(this.mapNotificationToSearchResult(notification));
    }

    if (inquiry) {
      result.push(this.mapInquiryToSearchResult(inquiry));
    }
  }

  @Post('/advanced')
  @UserRoles(...ROLES_ALLOWED_APPLICATIONS)
  async advancedSearch(@Body() searchDto: SearchRequestDto) {
    const {
      searchApplications,
      searchNoi,
      searchPlanningReviews,
      searchNotifications,
      searchInquiries,
    } = this.getEntitiesTypeToSearch(searchDto);

    const queryRunner = this.dataSource.createQueryRunner('slave');

    try {
      let applicationSearchResult: AdvancedSearchResultDto<
        ApplicationSubmissionSearchView[]
      > | null = null;
      if (searchApplications) {
        applicationSearchResult =
          await this.applicationSearchService.searchApplications(
            searchDto,
            queryRunner,
          );
      }

      let noticeOfIntentSearchService: AdvancedSearchResultDto<
        NoticeOfIntentSubmissionSearchView[]
      > | null = null;
      if (searchNoi) {
        noticeOfIntentSearchService =
          await this.noticeOfIntentSearchService.searchNoticeOfIntents(
            searchDto,
            queryRunner,
          );
      }
      let notifications: AdvancedSearchResultDto<
        NotificationSubmissionSearchView[]
      > | null = null;
      if (searchNotifications) {
        notifications = await this.notificationSearchService.search(
          searchDto,
          queryRunner,
        );
      }

      let planningReviews: AdvancedSearchResultDto<
        PlanningReviewSearchView[]
      > | null = null;
      if (searchPlanningReviews) {
        planningReviews = await this.planningReviewSearchService.search(
          searchDto,
          queryRunner,
        );
      }

      let inquiries: AdvancedSearchResultDto<InquirySearchView[]> | null = null;
      if (searchInquiries) {
        inquiries = await this.inquirySearchService.search(
          searchDto,
          queryRunner,
        );
      }

      return await this.mapAdvancedSearchResults(
        applicationSearchResult,
        noticeOfIntentSearchService,
        planningReviews,
        notifications,
        inquiries,
      );
    } finally {
      await queryRunner.release();
    }
  }

  @Post('/advanced/application')
  @UserRoles(...ROLES_ALLOWED_APPLICATIONS)
  async advancedSearchApplications(
    @Body() searchDto: SearchRequestDto,
  ): Promise<AdvancedSearchResultDto<ApplicationSearchResultDto[]>> {
    const queryRunner = this.dataSource.createQueryRunner('slave');

    try {
      const applications =
        await this.applicationSearchService.searchApplications(
          searchDto,
          queryRunner,
        );

      const mappedSearchResult = await this.mapAdvancedSearchResults(
        applications,
        null,
        null,
        null,
        null,
      );

      return {
        total: mappedSearchResult.totalApplications,
        data: mappedSearchResult.applications,
      };
    } finally {
      await queryRunner.release();
    }
  }

  @Post('/advanced/notice-of-intent')
  @UserRoles(...ROLES_ALLOWED_APPLICATIONS)
  async advancedSearchNoticeOfIntents(
    @Body() searchDto: SearchRequestDto,
  ): Promise<AdvancedSearchResultDto<NoticeOfIntentSearchResultDto[]>> {
    const queryRunner = this.dataSource.createQueryRunner('slave');

    const noticeOfIntents =
      await this.noticeOfIntentSearchService.searchNoticeOfIntents(
        searchDto,
        queryRunner,
      );

    const mappedSearchResult = await this.mapAdvancedSearchResults(
      null,
      noticeOfIntents,
      null,
      null,
      null,
    );

    return {
      total: mappedSearchResult.totalNoticeOfIntents,
      data: mappedSearchResult.noticeOfIntents,
    };
  }

  @Post('/advanced/notifications')
  @UserRoles(...ROLES_ALLOWED_APPLICATIONS)
  async advancedSearchNotifications(
    @Body() searchDto: SearchRequestDto,
  ): Promise<AdvancedSearchResultDto<NotificationSearchResultDto[]>> {
    const queryRunner = this.dataSource.createQueryRunner('slave');

    const notifications = await this.notificationSearchService.search(
      searchDto,
      queryRunner,
    );

    const mappedSearchResult = await this.mapAdvancedSearchResults(
      null,
      null,
      null,
      notifications,
      null,
    );

    return {
      total: mappedSearchResult.totalNotifications,
      data: mappedSearchResult.notifications,
    };
  }

  @Post('/advanced/planning-reviews')
  @UserRoles(...ROLES_ALLOWED_APPLICATIONS)
  async advancedSearchPlanningReviews(
    @Body() searchDto: SearchRequestDto,
  ): Promise<AdvancedSearchResultDto<PlanningReviewSearchResultDto[]>> {
    const queryRunner = this.dataSource.createQueryRunner('slave');

    const planningReviews = await this.planningReviewSearchService.search(
      searchDto,
      queryRunner,
    );

    const mappedSearchResult = await this.mapAdvancedSearchResults(
      null,
      null,
      planningReviews,
      null,
      null,
    );

    return {
      total: mappedSearchResult.totalPlanningReviews,
      data: mappedSearchResult.planningReviews,
    };
  }

  @Post('/advanced/inquiries')
  @UserRoles(...ROLES_ALLOWED_APPLICATIONS)
  async advancedSearchInquiries(
    @Body() searchDto: SearchRequestDto,
  ): Promise<AdvancedSearchResultDto<InquirySearchResultDto[]>> {
    const queryRunner = this.dataSource.createQueryRunner('slave');

    const inquiries = await this.inquirySearchService.search(
      searchDto,
      queryRunner,
    );

    const mappedSearchResult = await this.mapAdvancedSearchResults(
      null,
      null,
      null,
      null,
      inquiries,
    );

    return {
      total: mappedSearchResult.totalInquiries,
      data: mappedSearchResult.inquiries,
    };
  }

  private getEntitiesTypeToSearch(searchDto: SearchRequestDto) {
    let searchApplications = true;

    let planningReviewTypeSpecified = false;
    let noiTypeSpecified = false;
    let notificationTypeSpecified = false;
    let inquiriesTypeSpecified = false;
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

      planningReviewTypeSpecified =
        searchDto.fileTypes.filter((searchType) =>
          Object.values(PLANNING_REVIEW_TYPES).includes(
            PLANNING_REVIEW_TYPES[
              searchType as keyof typeof PLANNING_REVIEW_TYPES
            ],
          ),
        ).length > 0;

      inquiriesTypeSpecified =
        searchDto.fileTypes.filter((searchType) =>
          Object.values(INQUIRY_TYPES).includes(
            INQUIRY_TYPES[searchType as keyof typeof INQUIRY_TYPES],
          ),
        ).length > 0;
    }

    const searchNoi = searchDto.fileTypes.length > 0 ? noiTypeSpecified : true;

    const searchPlanningReviews =
      (searchDto.fileTypes.length > 0 ? planningReviewTypeSpecified : true) &&
      !searchDto.portalStatusCode &&
      !searchDto.pid &&
      !isStringSetAndNotEmpty(searchDto.civicAddress);

    const searchNotifications =
      (searchDto.fileTypes.length > 0 ? notificationTypeSpecified : true) &&
      !searchDto.dateDecidedFrom &&
      !searchDto.dateDecidedTo &&
      !searchDto.resolutionNumber &&
      !searchDto.resolutionYear &&
      !isStringSetAndNotEmpty(searchDto.legacyId);

    const searchInquiries =
      (searchDto.fileTypes.length > 0 ? inquiriesTypeSpecified : true) &&
      !searchDto.dateDecidedFrom &&
      !searchDto.dateDecidedTo &&
      !searchDto.resolutionNumber &&
      !searchDto.resolutionYear &&
      !searchDto.portalStatusCode &&
      !isStringSetAndNotEmpty(searchDto.legacyId);

    return {
      searchApplications,
      searchNoi,
      searchPlanningReviews,
      searchNotifications,
      searchInquiries,
    };
  }

  private async mapAdvancedSearchResults(
    applications: AdvancedSearchResultDto<
      ApplicationSubmissionSearchView[]
    > | null,
    noticeOfIntents: AdvancedSearchResultDto<
      NoticeOfIntentSubmissionSearchView[]
    > | null,
    planningReviews: AdvancedSearchResultDto<PlanningReviewSearchView[]> | null,
    notifications: AdvancedSearchResultDto<
      NotificationSubmissionSearchView[]
    > | null,
    inquiries: AdvancedSearchResultDto<InquirySearchView[]> | null,
  ) {
    const response = new AdvancedSearchResponseDto();

    const mappedApplications: ApplicationSearchResultDto[] = [];
    if (applications && applications.data.length > 0) {
      const appTypes = await this.appTypeRepo.find();
      const appTypeMap = new Map<string, ApplicationType>();
      for (const type of appTypes) {
        appTypeMap.set(type.code, type);
      }

      mappedApplications.push(
        ...applications.data.map((app) =>
          this.mapApplicationToAdvancedSearchResult(app, appTypeMap),
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

    const mappedNotifications: NotificationSearchResultDto[] = [];
    if (notifications && notifications.data && notifications.data.length > 0) {
      mappedNotifications.push(
        ...notifications.data.map((notification) =>
          this.mapNotificationToAdvancedSearchResult(notification),
        ),
      );
    }

    const mappedPlanningReviews: PlanningReviewSearchResultDto[] = [];
    if (
      planningReviews &&
      planningReviews.data &&
      planningReviews.data.length > 0
    ) {
      mappedPlanningReviews.push(
        ...planningReviews.data.map((planningReview) =>
          this.mapPlanningReviewToAdvancedSearchResult(planningReview),
        ),
      );
    }

    const mappedInquiries: InquirySearchResultDto[] = [];
    if (inquiries && inquiries.data && inquiries.data.length > 0) {
      mappedInquiries.push(
        ...inquiries.data.map((inquiry) =>
          this.mapInquiryToAdvancedSearchResult(inquiry),
        ),
      );
    }

    response.applications = mappedApplications;
    response.totalApplications = applications?.total ?? 0;
    response.noticeOfIntents = mappedNoticeOfIntents;
    response.totalNoticeOfIntents = noticeOfIntents?.total ?? 0;
    response.notifications = mappedNotifications;
    response.totalNotifications = notifications?.total ?? 0;
    response.planningReviews = mappedPlanningReviews;
    response.totalPlanningReviews = planningReviews?.total ?? 0;
    response.inquiries = mappedInquiries;
    response.totalInquiries = inquiries?.total ?? 0;

    return response;
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
      referenceId: planning.fileNumber,
      localGovernmentName: planning.localGovernment?.name,
      applicant: planning.documentName,
      fileNumber: planning.fileNumber,
    };
  }

  private mapInquiryToSearchResult(inquiry: Inquiry): SearchResultDto {
    return {
      type: CARD_TYPE.INQUIRY,
      referenceId: inquiry.fileNumber,
      localGovernmentName: inquiry.localGovernment?.name,
      applicant: inquiry.inquirerLastName ?? undefined,
      fileNumber: inquiry.fileNumber,
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

  private mapApplicationToAdvancedSearchResult(
    application: ApplicationSubmissionSearchView,
    appTypeMap: Map<string, ApplicationType>,
  ): ApplicationSearchResultDto {
    return {
      referenceId: application.fileNumber,
      fileNumber: application.fileNumber,
      dateSubmitted: application.dateSubmittedToAlc?.getTime(),
      type: this.mapper.map(
        appTypeMap.get(application.applicationTypeCode),
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

  private mapPlanningReviewToAdvancedSearchResult(
    planningReview: PlanningReviewSearchView,
  ): PlanningReviewSearchResultDto {
    return {
      documentName: planningReview.documentName,
      referenceId: planningReview.fileNumber,
      fileNumber: planningReview.fileNumber,
      open: planningReview.open,
      type: {
        code: planningReview.planningReviewType_code,
        label: planningReview.planningReviewType_label,
        backgroundColor: planningReview.planningReviewType_background_color,
        textColor: planningReview.planningReviewType_text_color,
        description: '',
        shortLabel: planningReview.planningReviewType_short_label,
      },
      localGovernmentName: planningReview.localGovernmentName ?? null,
      class: 'PLAN',
    };
  }

  private mapInquiryToAdvancedSearchResult(
    inquiry: InquirySearchView,
  ): InquirySearchResultDto {
    return {
      fileNumber: inquiry.fileNumber,
      open: inquiry.open,
      type: {
        code: inquiry.inquiryTypeCode,
        label: inquiry.inquiryType.label,
        backgroundColor: inquiry.inquiryType.backgroundColor,
        textColor: inquiry.inquiryType.textColor,
        description: '',
        shortLabel: inquiry.inquiryType.shortLabel,
      },
      localGovernmentName: inquiry.localGovernmentName ?? null,
      dateSubmitted: inquiry.dateSubmittedToAlc?.getTime(),
      inquirerFirstName: inquiry.inquirerFirstName,
      inquirerLastName: inquiry.inquirerLastName,
      inquirerOrganizationName: inquiry.inquirerOrganization,
      class: 'INQR',
    };
  }
}

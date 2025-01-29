import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import { Mapper } from 'automapper-core';
import { InjectMapper } from 'automapper-nestjs';
import * as config from 'config';
import { Any } from 'typeorm';
import { ANY_AUTH_ROLE } from '../../common/authorization/roles';
import { RolesGuard } from '../../common/authorization/roles-guard.service';
import { UserRoles } from '../../common/authorization/roles.decorator';
import { UserDto } from '../../user/user.dto';
import { User } from '../../user/user.entity';
import { formatIncomingDate } from '../../utils/incoming-date.formatter';
import { ApplicationReconsiderationService } from '../application-decision/application-reconsideration/application-reconsideration.service';
import { ApplicationDecisionMeeting } from '../application/application-decision-meeting/application-decision-meeting.entity';
import { ApplicationDecisionMeetingService } from '../application/application-decision-meeting/application-decision-meeting.service';
import { ApplicationService } from '../application/application.service';
import { CARD_TYPE } from '../card/card-type/card-type.entity';
import { PlanningReferralService } from '../planning-review/planning-referral/planning-referral.service';
import { PlanningReviewMeetingService } from '../planning-review/planning-review-meeting/planning-review-meeting.service';
import {
  CreateApplicationDecisionMeetingDto,
  DecisionMeetingDto,
  UpcomingMeetingBoardMapDto,
  UpcomingMeetingDto,
} from './decision-meeting.dto';
import { ApplicationTimeTrackingService } from '../application/application-time-tracking.service';
import { ApplicationDecisionConditionCardService } from '../application-decision/application-decision-condition/application-decision-condition-card/application-decision-condition-card.service';

@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@Controller('decision-meeting')
@UseGuards(RolesGuard)
export class DecisionMeetingController {
  constructor(
    private appDecisionMeetingService: ApplicationDecisionMeetingService,
    private applicationService: ApplicationService,
    private reconsiderationService: ApplicationReconsiderationService,
    private planningReferralService: PlanningReferralService,
    private planningReviewMeetingService: PlanningReviewMeetingService,
    private applicationTimeTrackingService: ApplicationTimeTrackingService,
    private applicationDecisionConditionCardService: ApplicationDecisionConditionCardService,
    @InjectMapper() private mapper: Mapper,
  ) {}

  @Get('/overview/meetings')
  @UserRoles(...ANY_AUTH_ROLE)
  async getMeetings(): Promise<UpcomingMeetingBoardMapDto> {
    const mappedApps = await this.getMappedApplicationMeetings();
    const mappedRecons = await this.getMappedReconsiderationMeetings();
    const mappedReviews = await this.getMappedPlanningReviewMeetings();
    const mappedConditionCards = await this.getMappedApplicationConditionCards();

    const boardCodeToApps: UpcomingMeetingBoardMapDto = {};
    [...mappedApps, ...mappedRecons, ...mappedReviews, ...mappedConditionCards].forEach((mappedApp) => {
      const boardMeetings = boardCodeToApps[mappedApp.boardCode] || [];
      boardMeetings.push(mappedApp);
      boardCodeToApps[mappedApp.boardCode] = boardMeetings;
    });

    return boardCodeToApps;
  }

  @Get('/:fileNumber')
  @UserRoles(...ANY_AUTH_ROLE)
  async getAllForApplication(@Param('fileNumber') fileNumber): Promise<DecisionMeetingDto[]> {
    const meetings = await this.appDecisionMeetingService.getByAppFileNumber(fileNumber);
    return this.mapper.mapArrayAsync(meetings, ApplicationDecisionMeeting, DecisionMeetingDto);
  }

  @Get('/meeting/:uuid')
  @UserRoles(...ANY_AUTH_ROLE)
  async get(@Param('uuid') uuid: string): Promise<DecisionMeetingDto> {
    const meeting = await this.appDecisionMeetingService.get(uuid);
    return this.mapper.mapAsync(meeting, ApplicationDecisionMeeting, DecisionMeetingDto);
  }

  @Delete('/:uuid')
  @UserRoles(...ANY_AUTH_ROLE)
  async delete(@Param('uuid') uuid: string) {
    return this.appDecisionMeetingService.delete(uuid);
  }

  @Post()
  @UserRoles(...ANY_AUTH_ROLE)
  async create(@Body() meeting: CreateApplicationDecisionMeetingDto): Promise<DecisionMeetingDto> {
    const application = await this.applicationService.getOrFail(meeting.applicationFileNumber);

    const newMeeting = await this.appDecisionMeetingService.createOrUpdate({
      date: formatIncomingDate(meeting.date) ?? new Date(),
      applicationUuid: application.uuid,
    });

    return this.mapper.map(newMeeting, ApplicationDecisionMeeting, DecisionMeetingDto);
  }

  @Patch()
  @UserRoles(...ANY_AUTH_ROLE)
  async update(@Body() updateDto: DecisionMeetingDto): Promise<DecisionMeetingDto> {
    const appDecEntity = new ApplicationDecisionMeeting({
      uuid: updateDto.uuid,
      date: formatIncomingDate(updateDto.date)!,
    });
    const updatedMeeting = await this.appDecisionMeetingService.createOrUpdate(appDecEntity);
    return this.mapper.map(updatedMeeting, ApplicationDecisionMeeting, DecisionMeetingDto);
  }

  private async getMappedApplicationMeetings() {
    const upcomingApplicationMeetings = await this.appDecisionMeetingService.getUpcomingApplicationMeetings();
    const allAppIds = upcomingApplicationMeetings.map((a) => a.uuid);
    const pausedStatuses = await this.applicationTimeTrackingService.getPausedStatusByUuid(allAppIds);
    const allApps = await this.applicationService.getMany({
      uuid: Any(allAppIds),
    });
    return allApps.map((app): UpcomingMeetingDto => {
      const meetingDate = upcomingApplicationMeetings.find((meeting) => meeting.uuid === app.uuid);
      return {
        meetingDate: new Date(meetingDate!.next_meeting).getTime(),
        fileNumber: app.fileNumber,
        applicant: app.applicant,
        boardCode: app.card!.board.code,
        type: CARD_TYPE.APP,
        assignee: this.mapper.map(app.card!.assignee, User, UserDto),
        isPaused: pausedStatuses.get(app.uuid)!,
      };
    });
  }

  private async getMappedReconsiderationMeetings() {
    const upcomingReconsiderationMeetings = await this.appDecisionMeetingService.getUpcomingReconsiderationMeetings();

    const reconIds = upcomingReconsiderationMeetings.map((a) => a.uuid);
    const pausedStatuses = await this.applicationTimeTrackingService.getPausedStatusByUuid(reconIds);
    const reconsiderations = await this.reconsiderationService.getMany(reconIds);
    return reconsiderations
      .filter((recon) => {
        const meetingDate = upcomingReconsiderationMeetings.find((meeting) => meeting.uuid === recon.uuid);

        return new Date(meetingDate!.next_meeting).getTime() > new Date(recon.submittedDate).getTime();
      })
      .map((recon): UpcomingMeetingDto => {
        const meetingDate = upcomingReconsiderationMeetings.find((meeting) => meeting.uuid === recon.uuid);

        return {
          meetingDate: new Date(meetingDate!.next_meeting).getTime(),
          fileNumber: recon.application.fileNumber,
          applicant: recon.application.applicant,
          boardCode: recon.card!.board.code,
          type: CARD_TYPE.APP,
          assignee: this.mapper.map(recon.card!.assignee, User, UserDto),
          isPaused: pausedStatuses.get(recon.uuid)!,
        };
      });
  }

  private async getMappedPlanningReviewMeetings() {
    const upcomingMeetings = await this.planningReviewMeetingService.getUpcomingMeetings();
    const planningReviewIds = upcomingMeetings.map((a) => a.uuid);
    const planningReferrals = await this.planningReferralService.getManyByPlanningReview(planningReviewIds);
    return planningReferrals.flatMap((planningReferral): UpcomingMeetingDto[] => {
      const meetingDate = upcomingMeetings.find((meeting) => meeting.uuid === planningReferral.planningReview.uuid);

      if (!meetingDate || !planningReferral.card) {
        return [];
      }

      return [
        {
          meetingDate: new Date(meetingDate.next_meeting).getTime(),
          fileNumber: planningReferral.planningReview.fileNumber,
          applicant: planningReferral.planningReview.documentName,
          boardCode: planningReferral.card.board.code,
          type: CARD_TYPE.PLAN,
          assignee: this.mapper.map(planningReferral.card.assignee, User, UserDto),
          isPaused: false,
        },
      ];
    });
  }

  private async getMappedApplicationConditionCards() {
    const upcomingConditionCards = await this.appDecisionMeetingService.getUpcomingApplicationDecisionConditionCards();
    const allAppIds = upcomingConditionCards.map((a) => a.uuid);
    const allConditionCardIds = upcomingConditionCards.map((a) => a.condition_card_uuid);
    const pausedStatuses = await this.applicationTimeTrackingService.getPausedStatusByUuid(allAppIds);
    const allApps = await this.applicationService.getMany({
      uuid: Any(allAppIds),
    });
    const allConditionCards = await this.applicationDecisionConditionCardService.getMany({
      uuid: Any(allConditionCardIds),
    });

    return allConditionCards.map((conditionCard): UpcomingMeetingDto => {
      const meetingDate = upcomingConditionCards.find((meeting) => meeting.condition_card_uuid === conditionCard.uuid);
      const app = allApps.find((a) =>
        upcomingConditionCards.some((card) => card.condition_card_uuid === conditionCard.uuid && card.uuid === a.uuid),
      );

      return {
        meetingDate: new Date(meetingDate!.next_meeting).getTime(),
        fileNumber: app!.fileNumber,
        applicant: app!.applicant,
        boardCode: conditionCard.card!.board.code,
        type: CARD_TYPE.APP_CON,
        assignee: this.mapper.map(conditionCard.card!.assignee, User, UserDto),
        isPaused: pausedStatuses.get(conditionCard.uuid)!,
      };
    });
  }
}

import { Component, OnDestroy, OnInit } from '@angular/core';
import * as moment from 'moment';
import { Subject, takeUntil } from 'rxjs';
import { BOARD_TYPE_CODES } from '../../features/board/board.component';
import { ApplicationDocumentService } from '../../services/application/application-document/application-document.service';
import { ROLES } from '../../services/authentication/authentication.service';
import { BoardService, BoardWithFavourite } from '../../services/board/board.service';
import { UpcomingMeetingBoardMapDto, UpcomingMeetingDto } from '../../services/decision-meeting/decision-meeting.dto';
import { DecisionMeetingService } from '../../services/decision-meeting/decision-meeting.service';
import { ToastService } from '../../services/toast/toast.service';
import { UserService } from '../../services/user/user.service';

type MeetingWithApplications = {
  meetingDate: number;
  applications: (UpcomingMeetingDto & { isHighlighted: boolean })[];
  isExpanded: boolean;
};

type BoardWithDecisionMeetings = {
  boardTitle: string;
  boardCode: string;
  isFavourite: boolean;
  pastMeetings: MeetingWithApplications[];
  upcomingMeetings: MeetingWithApplications[];
  nextMeeting: MeetingWithApplications | undefined;
  isExpanded: boolean;
};

const BOARD_CODES_TO_HIDE = [BOARD_TYPE_CODES.CEO, BOARD_TYPE_CODES.VETT];

@Component({
  selector: 'app-meeting-overview',
  templateUrl: './meeting-overview.component.html',
  styleUrls: ['./meeting-overview.component.scss'],
})
export class MeetingOverviewComponent implements OnInit, OnDestroy {
  destroy = new Subject<void>();
  private boards: BoardWithFavourite[] = [];
  private meetings: UpcomingMeetingBoardMapDto | undefined;
  customDateFormat = 'ddd YYYY-MM-DD';
  searchText = '';
  isCommissioner = false;

  viewData: BoardWithDecisionMeetings[] = [];

  constructor(
    private meetingService: DecisionMeetingService,
    private boardService: BoardService,
    private applicationDocumentService: ApplicationDocumentService,
    private toastService: ToastService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.boardService.$boards.pipe(takeUntil(this.destroy)).subscribe((boards) => {
      this.boards = boards;
      this.loadMeetings();
    });

    this.userService.$userProfile.pipe(takeUntil(this.destroy)).subscribe((currentUser) => {
      if (currentUser) {
        this.isCommissioner =
          currentUser.clientRoles && currentUser.clientRoles.length === 1
            ? currentUser.clientRoles.includes(ROLES.COMMISSIONER)
            : false;
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  async loadMeetings() {
    const meetings = await this.meetingService.fetch();
    if (meetings) {
      this.meetings = meetings;
      this.populateViewData();
    }
  }

  private populateViewData() {
    if (this.meetings && this.boards.length > 0) {
      this.viewData = this.boards
        .filter((board) => !BOARD_CODES_TO_HIDE.includes(board.code))
        .map((board): BoardWithDecisionMeetings => {
          let upcomingMeetings: MeetingWithApplications[] = [];
          let pastMeetings: MeetingWithApplications[] = [];
          const applications = this.meetings![board.code];
          if (applications) {
            this.sortApplications(applications, pastMeetings, upcomingMeetings);
          }

          upcomingMeetings.sort((a, b) => a.meetingDate - b.meetingDate);
          pastMeetings.sort((a, b) => a.meetingDate - b.meetingDate);

          const nextMeeting = upcomingMeetings.shift();
          if (nextMeeting) {
            nextMeeting.isExpanded = true; //Start with next meeting expanded
          }
          return {
            boardCode: board.code,
            boardTitle: board.title,
            isFavourite: board.isFavourite,
            pastMeetings,
            upcomingMeetings,
            nextMeeting,
            isExpanded: false,
          };
        });
    }
  }

  private sortApplications(
    applications: UpcomingMeetingDto[],
    pastMeetings: MeetingWithApplications[],
    upcomingMeetings: MeetingWithApplications[]
  ) {
    applications.forEach((app) => {
      const yesterday = moment.utc().startOf('day').add(-1, 'day');

      if (yesterday.isAfter(app.meetingDate)) {
        this.mapApplicationsIntoMeetings(pastMeetings, app);
      } else {
        this.mapApplicationsIntoMeetings(upcomingMeetings, app);
      }
    });
  }

  private mapApplicationsIntoMeetings(pastMeetings: MeetingWithApplications[], app: UpcomingMeetingDto) {
    const meeting = pastMeetings.find((meeting) => meeting.meetingDate === app.meetingDate);
    if (meeting) {
      meeting.applications.push({
        ...app,
        isHighlighted: false,
      });
    } else {
      pastMeetings.push({
        meetingDate: app.meetingDate,
        applications: [
          {
            ...app,
            isHighlighted: false,
          },
        ],
        isExpanded: false,
      });
    }
  }

  onSearch() {
    let foundResult = false;
    this.viewData = this.viewData.map((board) => {
      board.isExpanded = false;
      board.pastMeetings = board.pastMeetings.map((meeting) => {
        const res = this.findAndExpand(meeting, board);
        if (res.isExpanded) {
          foundResult = true;
        }
        return res;
      });

      if (board.nextMeeting) {
        const res = this.findAndExpand(board.nextMeeting, board);
        if (res.isExpanded) {
          foundResult = true;
        }
      }

      board.upcomingMeetings = board.upcomingMeetings.map((meeting) => {
        const res = this.findAndExpand(meeting, board);
        if (res.isExpanded) {
          foundResult = true;
        }
        return res;
      });

      return board;
    });

    if (foundResult) {
      this.searchText = '';
    } else {
      this.toastService.showErrorToast('File ID not found on this page');
    }
  }

  private findAndExpand(meeting: MeetingWithApplications, board: BoardWithDecisionMeetings) {
    meeting.isExpanded = false;
    meeting.applications = meeting.applications.map((application) => {
      application.isHighlighted = false;
      if (application.fileNumber === this.searchText) {
        meeting.isExpanded = true;
        board.isExpanded = true;
        application.isHighlighted = true;
        this.scrollToApplication(application.fileNumber);
      }
      return application;
    });
    return meeting;
  }

  private scrollToApplication(fileNumber: string) {
    setTimeout(() => {
      const el = document.getElementById(fileNumber);
      if (el) {
        el.scrollIntoView({
          block: 'center',
          inline: 'center',
        });
      }
    }, 300);
  }

  clearHighlight() {
    this.viewData = this.viewData.map((board) => {
      board.pastMeetings = board.pastMeetings.map((meeting) => {
        meeting.applications = meeting.applications.map((application) => {
          application.isHighlighted = false;
          return application;
        });
        return meeting;
      });

      if (board.nextMeeting) {
        board.nextMeeting.applications.map((application) => {
          application.isHighlighted = false;
          return application;
        });
      }

      board.upcomingMeetings = board.upcomingMeetings.map((meeting) => {
        meeting.applications = meeting.applications.map((application) => {
          application.isHighlighted = false;
          return application;
        });
        return meeting;
      });

      return board;
    });
  }

  isEllipsisActive(e: string): boolean {
    const el = document.getElementById(e);
    return el ? el.offsetWidth < el.scrollWidth : false;
  }

  openApplication(fileNumber: string) {
    this.clearHighlight();
    const url = this.isCommissioner ? `/commissioner/${fileNumber}` : `/application/${fileNumber}/review`;
    window.open(url, '_blank');
  }
}

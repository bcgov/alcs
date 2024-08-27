import { Component, OnDestroy, OnInit } from '@angular/core';
import * as moment from 'moment';
import { combineLatestWith, Subject, takeUntil } from 'rxjs';
import { ROLES } from '../../services/authentication/authentication.service';
import { BoardService, BoardWithFavourite } from '../../services/board/board.service';
import { UpcomingMeetingBoardMapDto, UpcomingMeetingDto } from '../../services/decision-meeting/decision-meeting.dto';
import { DecisionMeetingService } from '../../services/decision-meeting/decision-meeting.service';
import { ToastService } from '../../services/toast/toast.service';
import { UserService } from '../../services/user/user.service';
import { CardType } from '../card/card.component';
import { ActivatedRoute } from '@angular/router';

type MeetingCollection = {
  meetingDate: number;
  meetings: (UpcomingMeetingDto & { isHighlighted: boolean })[];
  isExpanded: boolean;
};

type BoardWithDecisionMeetings = {
  boardTitle: string;
  boardCode: string;
  isFavourite: boolean;
  pastMeetings: MeetingCollection[];
  upcomingMeetings: MeetingCollection[];
  nextMeeting: MeetingCollection | undefined;
  isExpanded: boolean;
};

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
    private toastService: ToastService,
    private userService: UserService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.boardService.$boards
      .pipe(takeUntil(this.destroy))
      .pipe(combineLatestWith(this.route.queryParams))
      .subscribe(async ([boards, params]) => {
        this.boards = boards;
        await this.loadMeetings();

        if (this.viewData.length > 0 && params['file_number'] !== undefined) {
          this.findAndExpandAll(params['file_number']);
        }
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
      await this.populateViewData();
    }
  }

  private async populateViewData() {
    if (this.meetings && this.boards.length > 0) {
      this.viewData = this.boards
        .filter((board) => board.showOnSchedule)
        .map((board): BoardWithDecisionMeetings => {
          let upcomingMeetings: MeetingCollection[] = [];
          let pastMeetings: MeetingCollection[] = [];
          const meetings = this.meetings![board.code];
          if (meetings) {
            this.sortMeetings(meetings, pastMeetings, upcomingMeetings);
          }

          upcomingMeetings.sort((a, b) => a.meetingDate - b.meetingDate);
          pastMeetings.sort((a, b) => a.meetingDate - b.meetingDate);

          const nextMeeting = upcomingMeetings[0];
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

  private sortMeetings(
    meetings: UpcomingMeetingDto[],
    pastMeetings: MeetingCollection[],
    upcomingMeetings: MeetingCollection[],
  ) {
    meetings.forEach((app) => {
      const yesterday = moment.utc().startOf('day').add(-1, 'day');

      if (yesterday.isAfter(app.meetingDate)) {
        this.sortMeetingsIntoCollections(pastMeetings, app);
      } else {
        this.sortMeetingsIntoCollections(upcomingMeetings, app);
      }
    });
  }

  private sortMeetingsIntoCollections(pastMeetings: MeetingCollection[], meetings: UpcomingMeetingDto) {
    const meeting = pastMeetings.find((meeting) => meeting.meetingDate === meetings.meetingDate);
    if (meeting) {
      meeting.meetings.push({
        ...meetings,
        isHighlighted: false,
      });
    } else {
      pastMeetings.push({
        meetingDate: meetings.meetingDate,
        meetings: [
          {
            ...meetings,
            isHighlighted: false,
          },
        ],
        isExpanded: false,
      });
    }
  }

  onSearch() {
    this.findAndExpandAll(this.searchText);
  }

  findAndExpandAll(fileNumber: string) {
    let foundResult = false;
    this.viewData = this.viewData.map((board) => {
      board.isExpanded = false;
      board.pastMeetings = board.pastMeetings.map((meeting) => {
        const res = this.findAndExpand(meeting, board, fileNumber);
        if (res.isExpanded) {
          foundResult = true;
        }
        return res;
      });

      if (board.nextMeeting) {
        const res = this.findAndExpand(board.nextMeeting, board, fileNumber);
        if (res.isExpanded) {
          foundResult = true;
        }
      }

      board.upcomingMeetings = board.upcomingMeetings.map((meeting) => {
        const res = this.findAndExpand(meeting, board, fileNumber);
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

  private findAndExpand(meeting: MeetingCollection, board: BoardWithDecisionMeetings, fileNumber: string) {
    meeting.isExpanded = false;
    meeting.meetings = meeting.meetings.map((application) => {
      application.isHighlighted = false;
      if (application.fileNumber === fileNumber) {
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
        meeting.meetings = meeting.meetings.map((application) => {
          application.isHighlighted = false;
          return application;
        });
        return meeting;
      });

      if (board.nextMeeting) {
        board.nextMeeting.meetings.map((application) => {
          application.isHighlighted = false;
          return application;
        });
      }

      board.upcomingMeetings = board.upcomingMeetings.map((meeting) => {
        meeting.meetings = meeting.meetings.map((application) => {
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

  openMeetings(fileNumber: string, type: CardType) {
    this.clearHighlight();
    const target = type === CardType.PLAN ? 'planning-review' : 'application';
    const url = this.isCommissioner ? `/commissioner/${target}/${fileNumber}` : `/${target}/${fileNumber}/review`;
    window.open(url, '_blank');
  }
}

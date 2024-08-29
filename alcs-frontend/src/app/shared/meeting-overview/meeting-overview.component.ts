import { Component, OnDestroy, OnInit } from '@angular/core';
import * as moment from 'moment';
import { Subject, takeUntil } from 'rxjs';
import { ROLES } from '../../services/authentication/authentication.service';
import { BoardService, BoardWithFavourite } from '../../services/board/board.service';
import { UpcomingMeetingBoardMapDto, UpcomingMeetingDto } from '../../services/decision-meeting/decision-meeting.dto';
import { DecisionMeetingService } from '../../services/decision-meeting/decision-meeting.service';
import { ToastService } from '../../services/toast/toast.service';
import { UserService } from '../../services/user/user.service';
import { CardType } from '../card/card.component';
import { IncomingFileService } from 'src/app/services/incoming-file/incoming-file.service';
import { IncomingFileBoardMapDto, IncomingFileDto } from 'src/app/services/incoming-file/incomig-file.dto';

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
  incomingFiles: IncomingFileDto[];
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
  private incomingFiles: IncomingFileBoardMapDto | undefined;
  customDateFormat = 'ddd YYYY-MM-DD';
  searchText = '';
  isCommissioner = false;

  viewData: BoardWithDecisionMeetings[] = [];

  constructor(
    private meetingService: DecisionMeetingService,
    private incomingFileService: IncomingFileService,
    private boardService: BoardService,
    private toastService: ToastService,
    private userService: UserService,
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
    const incomingFiles = await this.incomingFileService.fetch();

    if (meetings && incomingFiles) {
      this.meetings = meetings;
      this.incomingFiles = incomingFiles;
      this.populateViewData();
    }
  }

  private populateViewData() {
    if (this.meetings && this.incomingFiles && this.boards.length > 0) {
      this.viewData = this.boards
        .filter((board) => board.showOnSchedule)
        .map((board): BoardWithDecisionMeetings => {
          let upcomingMeetings: MeetingCollection[] = [];
          let pastMeetings: MeetingCollection[] = [];
          const incomingFiles = this.incomingFiles![board.code];
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
            incomingFiles,
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

  private findAndExpand(meeting: MeetingCollection, board: BoardWithDecisionMeetings) {
    meeting.isExpanded = false;
    meeting.meetings = meeting.meetings.map((application) => {
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

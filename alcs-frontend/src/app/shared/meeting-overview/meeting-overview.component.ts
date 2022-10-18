import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { BOARD_TYPE_CODES } from '../../features/board/board.component';
import { ApplicationDocumentService } from '../../services/application/application-document/application-document.service';
import { BoardService, BoardWithFavourite } from '../../services/board/board.service';
import { UpcomingMeeting, UpcomingMeetingBoardMapDto } from '../../services/decision-meeting/decision-meeting.dto';
import { DecisionMeetingService } from '../../services/decision-meeting/decision-meeting.service';
import { ToastService } from '../../services/toast/toast.service';

type MeetingWithApplications = {
  meetingDate: number;
  applications: (UpcomingMeeting & { isExpanded: boolean; isHighlighted: boolean })[];
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

  viewData: BoardWithDecisionMeetings[] = [];

  constructor(
    private meetingService: DecisionMeetingService,
    private boardService: BoardService,
    private applicationDocumentService: ApplicationDocumentService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadMeetings();
    this.boardService.$boards.pipe(takeUntil(this.destroy)).subscribe((boards) => {
      this.boards = boards;
      this.populateViewData();
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
    applications: UpcomingMeeting[],
    pastMeetings: MeetingWithApplications[],
    upcomingMeetings: MeetingWithApplications[]
  ) {
    applications.forEach((app) => {
      if (app.meetingDate < Date.now()) {
        this.mapApplicationsIntoMeetings(pastMeetings, app);
      } else {
        this.mapApplicationsIntoMeetings(upcomingMeetings, app);
      }
    });
  }

  private mapApplicationsIntoMeetings(pastMeetings: MeetingWithApplications[], app: UpcomingMeeting) {
    const meeting = pastMeetings.find((meeting) => meeting.meetingDate === app.meetingDate);
    if (meeting) {
      meeting.applications.push({
        ...app,
        isExpanded: false,
        isHighlighted: false,
      });
    } else {
      pastMeetings.push({
        meetingDate: app.meetingDate,
        applications: [
          {
            ...app,
            isExpanded: false,
            isHighlighted: false,
          },
        ],
        isExpanded: false,
      });
    }
  }

  async onOpen(uuid: string, fileName: string) {
    this.clearHighlight();
    await this.applicationDocumentService.download(uuid, fileName);
  }

  async onDownload(uuid: string, fileName: string) {
    this.clearHighlight();
    await this.applicationDocumentService.download(uuid, fileName, false);
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
      application.isExpanded = false;
      application.isHighlighted = false;
      if (application.fileNumber === this.searchText) {
        meeting.isExpanded = true;
        board.isExpanded = true;
        application.isExpanded = true;
        application.isHighlighted = true;
      }
      return application;
    });
    return meeting;
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
}

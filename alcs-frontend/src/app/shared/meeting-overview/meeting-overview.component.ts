import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { ApplicationDocumentService } from '../../services/application/application-document/application-document.service';
import { BoardService, BoardWithFavourite } from '../../services/board/board.service';
import { UpcomingMeeting, UpcomingMeetingBoardMapDto } from '../../services/decision-meeting/decision-meeting.dto';
import { DecisionMeetingService } from '../../services/decision-meeting/decision-meeting.service';

type MeetingWithApplications = { meetingDate: number; applications: UpcomingMeeting[] };

type BoardWithDecisionMeetings = {
  boardTitle: string;
  boardCode: string;
  isFavourite: boolean;
  pastMeetings: MeetingWithApplications[];
  upcomingMeetings: MeetingWithApplications[];
  nextMeeting: MeetingWithApplications | undefined;
};

const BOARD_CODES_TO_HIDE = ['ceo', 'vett'];

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

  viewData: BoardWithDecisionMeetings[] = [];

  constructor(
    private meetingService: DecisionMeetingService,
    private boardService: BoardService,
    private applicationDocumentService: ApplicationDocumentService
  ) {}

  ngOnInit(): void {
    this.loadMeetings();
    this.boardService.$boards.pipe(takeUntil(this.destroy)).subscribe((boards) => {
      this.boards = boards;
      this.populateViewData();
    });
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
          return {
            boardCode: board.code,
            boardTitle: board.title,
            isFavourite: board.isFavourite,
            pastMeetings,
            upcomingMeetings,
            nextMeeting,
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
        const meeting = pastMeetings.find((meeting) => meeting.meetingDate === app.meetingDate);
        if (meeting) {
          meeting.applications.push(app);
        } else {
          pastMeetings.push({
            meetingDate: app.meetingDate,
            applications: [app],
          });
        }
      } else {
        const meeting = upcomingMeetings.find((meeting) => meeting.meetingDate === app.meetingDate);
        if (meeting) {
          meeting.applications.push(app);
        } else {
          upcomingMeetings.push({
            meetingDate: app.meetingDate,
            applications: [app],
          });
        }
      }
    });
  }

  async onOpen(uuid: string, fileName: string) {
    await this.applicationDocumentService.download(uuid, fileName);
  }

  async onDownload(uuid: string, fileName: string) {
    await this.applicationDocumentService.download(uuid, fileName, false);
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }
}

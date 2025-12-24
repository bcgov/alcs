import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { combineLatestWith, Subject, takeUntil } from 'rxjs';
import { CardDto } from '../../../services/card/card.dto';
import { CommissionerPlanningReviewDto } from '../../../services/commissioner/commissioner.dto';
import { PlanningReviewDetailedDto } from '../../../services/planning-review/planning-review.dto';
import { CLOSED_PR_LABEL, OPEN_PR_LABEL } from '../../../shared/application-type-pill/application-type-pill.constants';
import { AuthenticationService, ROLES } from '../../../services/authentication/authentication.service';
import { BoardService } from '../../../services/board/board.service';
import { DecisionMeetingService } from '../../../services/decision-meeting/decision-meeting.service';
import { IncomingFileService } from '../../../services/incoming-file/incoming-file.service';
import { UpcomingMeetingBoardMapDto } from '../../../services/decision-meeting/decision-meeting.dto';
import { IncomingFileBoardMapDto } from '../../../services/incoming-file/incoming-file.dto';

@Component({
    selector: 'app-planning-review-header[planningReview]',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
    standalone: false
})
export class HeaderComponent implements OnInit, OnChanges, OnDestroy {
  $destroy = new Subject<void>();

  @Input() planningReview!: PlanningReviewDetailedDto | CommissionerPlanningReviewDto;
  @Input() showStatus = true;

  linkedCards: (CardDto & { displayName: string })[] = [];
  statusPill = OPEN_PR_LABEL;

  isCommissioner: boolean = false;
  hasMeetings: boolean = false;
  isIncoming: boolean = false;

  $meetingsByBoard = new Subject<UpcomingMeetingBoardMapDto>();
  $incomingFilesByBoard = new Subject<IncomingFileBoardMapDto>();

  constructor(
    private router: Router,
    private authService: AuthenticationService,
    private boardService: BoardService,
    private meetingService: DecisionMeetingService,
    private incomingFileService: IncomingFileService,
  ) {}

  ngOnInit(): void {
    this.loadMeetings();
    this.loadIncomingFiles();

    this.authService.$currentUser.pipe(takeUntil(this.$destroy)).subscribe((currentUser) => {
      this.isCommissioner =
        !!currentUser &&
        !!currentUser.client_roles &&
        currentUser.client_roles.length === 1 &&
        currentUser.client_roles.includes(ROLES.COMMISSIONER);
    });

    this.boardService.$boards
      .pipe(combineLatestWith(this.$meetingsByBoard, this.$incomingFilesByBoard))
      .pipe(takeUntil(this.$destroy))
      .subscribe(([boards, meetingsByBoard, incomingFilesByBoard]) => {
        if (boards && meetingsByBoard && this.planningReview) {
          const visibleBoardCodes = boards.filter((board) => board.showOnSchedule).map((board) => board.code);

          const visibleBoardCodeMeetingPairs = Object.entries(meetingsByBoard).filter(([code, _]) =>
            visibleBoardCodes.includes(code),
          );

          const visibleBoardCodeIncomingFilePairs = Object.entries(incomingFilesByBoard!).filter(([code, _]) =>
            visibleBoardCodes.includes(code),
          );

          this.hasMeetings = visibleBoardCodeMeetingPairs.some(([_, meetings]) =>
            meetings.some((meeting) => meeting.fileNumber === this.planningReview?.fileNumber),
          );

          this.isIncoming = visibleBoardCodeIncomingFilePairs.some(([_, incomingFiles]) =>
            incomingFiles.some((file) => file.fileNumber === this.planningReview?.fileNumber),
          );
        }
      });
  }

  async loadMeetings() {
    const meetingsByBoards = await this.meetingService.fetch();

    if (meetingsByBoards !== undefined) {
      this.$meetingsByBoard.next(meetingsByBoards);
    }
  }

  async loadIncomingFiles() {
    const incomingFilesByBoard = await this.incomingFileService.fetchAndSort();

    if (incomingFilesByBoard !== undefined) {
      this.$incomingFilesByBoard.next(incomingFilesByBoard);
    }
  }

  async onGoToCard(card: CardDto) {
    const boardCode = card.boardCode;
    const cardUuid = card.uuid;
    const cardTypeCode = card.type;
    await this.router.navigateByUrl(`/board/${boardCode}?card=${cardUuid}&type=${cardTypeCode}`);
  }

  async onGoToSchedule(fileNumber: string) {
    if (this.isCommissioner) {
      await this.router.navigateByUrl(`/home?file_number=${fileNumber}`);
    }
  }

  async setupLinkedCards() {
    if ('referrals' in this.planningReview) {
      for (const [index, referral] of this.planningReview.referrals.entries()) {
        if (referral.card) {
          this.linkedCards.push({
            ...referral.card,
            displayName: `Referral #${this.planningReview.referrals.length - index}`,
          });
        }
      }
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.setupLinkedCards();
    this.statusPill = this.planningReview.open ? OPEN_PR_LABEL : CLOSED_PR_LABEL;
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
}

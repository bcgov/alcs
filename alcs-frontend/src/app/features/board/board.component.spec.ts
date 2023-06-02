import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject, of } from 'rxjs';
import { sleep } from '../../../../test/sleep';
import { ApplicationModificationService } from '../../services/application/application-modification/application-modification.service';
import { ApplicationReconsiderationDto } from '../../services/application/application-reconsideration/application-reconsideration.dto';
import { ApplicationReconsiderationService } from '../../services/application/application-reconsideration/application-reconsideration.service';
import { ApplicationDto } from '../../services/application/application.dto';
import { ApplicationService } from '../../services/application/application.service';
import { BoardService, BoardWithFavourite } from '../../services/board/board.service';
import { CardDto } from '../../services/card/card.dto';
import { CardService } from '../../services/card/card.service';
import { CovenantDto } from '../../services/covenant/covenant.dto';
import { CovenantService } from '../../services/covenant/covenant.service';
import { NoticeOfIntentService } from '../../services/notice-of-intent/notice-of-intent.service';
import { PlanningReviewDto } from '../../services/planning-review/planning-review.dto';
import { PlanningReviewService } from '../../services/planning-review/planning-review.service';
import { ToastService } from '../../services/toast/toast.service';
import { CardType } from '../../shared/card/card.component';
import { BoardComponent } from './board.component';

describe('BoardComponent', () => {
  let component: BoardComponent;
  let fixture: ComponentFixture<BoardComponent>;

  let applicationService: DeepMocked<ApplicationService>;
  let boardService: DeepMocked<BoardService>;
  let dialog: DeepMocked<MatDialog>;
  let toastService: DeepMocked<ToastService>;
  let router: DeepMocked<Router>;
  let cardService: DeepMocked<CardService>;
  let reconsiderationService: DeepMocked<ApplicationReconsiderationService>;
  let planningReviewService: DeepMocked<PlanningReviewService>;
  let modificationService: DeepMocked<ApplicationModificationService>;
  let covenantService: DeepMocked<CovenantService>;
  let titleService: DeepMocked<Title>;
  let noticeOfIntentService: DeepMocked<NoticeOfIntentService>;

  let boardEmitter = new BehaviorSubject<BoardWithFavourite[]>([]);

  const lowPriorityCard: CardDto = {
    status: {
      code: 'card-status',
    },
    highPriority: false,
  } as CardDto;

  let mockApplication = {
    applicant: 'applicant',
    fileNumber: '1',
    card: lowPriorityCard,
  } as ApplicationDto;

  let mockRecon = {
    application: {
      applicant: 'applicant',
      fileNumber: '2',
    },
    card: lowPriorityCard,
  } as ApplicationReconsiderationDto;

  let queryParamMapEmitter: BehaviorSubject<Map<string, any>>;

  beforeEach(async () => {
    applicationService = createMock();
    boardService = createMock();
    boardService.$boards = boardEmitter;
    boardService.fetchCards.mockResolvedValue({
      applications: [],
      covenants: [],
      modifications: [],
      planningReviews: [],
      reconsiderations: [],
      noticeOfIntents: [],
    });

    dialog = createMock();
    toastService = createMock();

    router = createMock();
    cardService = createMock();
    reconsiderationService = createMock();
    planningReviewService = createMock();
    modificationService = createMock();
    covenantService = createMock();
    titleService = createMock();
    noticeOfIntentService = createMock();

    const params = {
      boardCode: 'boardCode',
    };
    queryParamMapEmitter = new BehaviorSubject(new Map());

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, MatMenuModule],
      providers: [
        {
          provide: ApplicationService,
          useValue: applicationService,
        },
        {
          provide: BoardService,
          useValue: boardService,
        },
        {
          provide: MatDialog,
          useValue: dialog,
        },
        {
          provide: ToastService,
          useValue: toastService,
        },
        {
          provide: Router,
          useValue: router,
        },
        {
          provide: CardService,
          useValue: cardService,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            params: of(params),
            queryParamMap: queryParamMapEmitter,
          },
        },
        {
          provide: ApplicationReconsiderationService,
          useValue: reconsiderationService,
        },
        {
          provide: PlanningReviewService,
          useValue: planningReviewService,
        },
        {
          provide: ApplicationModificationService,
          useValue: modificationService,
        },
        {
          provide: CovenantService,
          useValue: covenantService,
        },
        {
          provide: NoticeOfIntentService,
          useValue: noticeOfIntentService,
        },
        {
          provide: Title,
          useValue: titleService,
        },
      ],
      declarations: [BoardComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(BoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set the title when provided a board code', async () => {
    boardEmitter.next([
      {
        code: 'boardCode',
        title: 'boardTitle',
        isFavourite: false,
        decisionMaker: '',
        statuses: [],
        allowedCardTypes: [],
      },
    ]);

    await fixture.whenStable();

    expect(titleService.setTitle).toHaveBeenCalledTimes(1);
    expect(titleService.setTitle).toHaveBeenCalledWith('ALCS | boardTitle Board');
    expect(component.currentBoardCode).toEqual('boardCode');
  });

  it('should enable covenants when not the vetting board', () => {
    boardEmitter.next([
      {
        code: 'boardCode',
        title: 'boardTitle',
        isFavourite: false,
        decisionMaker: '',
        statuses: [],
        allowedCardTypes: [],
      },
    ]);

    expect(component.boardHasCovenant).toBeTruthy();
  });

  it('should map an application into a card', async () => {
    boardService.fetchCards.mockResolvedValue({
      applications: [mockApplication],
      covenants: [],
      modifications: [],
      planningReviews: [],
      reconsiderations: [],
      noticeOfIntents: [],
    });

    boardEmitter.next([
      {
        code: 'boardCode',
        title: 'boardTitle',
        isFavourite: false,
        decisionMaker: '',
        statuses: [],
        allowedCardTypes: [],
      },
    ]);

    await sleep(1);

    expect(component.cards.length).toEqual(1);
    expect(component.cards[0].title).toEqual('1 (applicant)');
  });

  it('should map a reconsideration into a card', async () => {
    boardService.fetchCards.mockResolvedValue({
      applications: [],
      covenants: [],
      modifications: [],
      planningReviews: [],
      reconsiderations: [mockRecon],
      noticeOfIntents: [],
    });

    boardEmitter.next([
      {
        code: 'boardCode',
        title: 'boardTitle',
        isFavourite: false,
        decisionMaker: '',
        statuses: [],
        allowedCardTypes: [],
      },
    ]);

    await sleep(1);

    expect(component.cards.length).toEqual(1);
    expect(component.cards[0].title).toEqual('2 (applicant)');
  });

  it('should sort card by priority', async () => {
    const highPriorityApplication: ApplicationDto = {
      ...mockApplication,
      fileNumber: '3',
      card: {
        highPriority: true,
        status: {
          code: 'card-status',
        },
      },
    } as ApplicationDto;

    const highActiveDays: ApplicationDto = {
      ...mockApplication,
      activeDays: 5000,
      fileNumber: '4',
      card: {
        highPriority: true,
        status: {
          code: 'card-status',
        },
      },
    } as ApplicationDto;
    boardService.fetchCards.mockResolvedValue({
      applications: [mockApplication, highPriorityApplication, highActiveDays],
      covenants: [],
      modifications: [],
      planningReviews: [],
      reconsiderations: [],
      noticeOfIntents: [],
    });

    boardEmitter.next([
      {
        code: 'boardCode',
        title: 'boardTitle',
        isFavourite: false,
        decisionMaker: '',
        statuses: [],
        allowedCardTypes: [],
      },
    ]);

    await sleep(1);

    expect(component.cards.length).toEqual(3);
    expect(component.cards[0].highPriority).toBeTruthy();
    expect(component.cards[1].activeDays).toEqual(5000);
    expect(component.cards[2].highPriority).toBeFalsy();
  });

  it('should load application and open dialog when url is set', async () => {
    applicationService.fetchByCardUuid.mockResolvedValue({} as ApplicationDto);

    queryParamMapEmitter.next(
      new Map([
        ['card', 'app-id'],
        ['type', CardType.APP],
      ])
    );

    await sleep(1);

    expect(applicationService.fetchByCardUuid).toHaveBeenCalledTimes(1);
    expect(dialog.open).toHaveBeenCalledTimes(1);
  });

  it('should load reconsideration and open dialog when url is set', async () => {
    reconsiderationService.fetchByCardUuid.mockResolvedValue({} as ApplicationReconsiderationDto);

    queryParamMapEmitter.next(
      new Map([
        ['card', 'app-id'],
        ['type', CardType.RECON],
      ])
    );

    await sleep(1);

    expect(reconsiderationService.fetchByCardUuid).toHaveBeenCalledTimes(1);
    expect(dialog.open).toHaveBeenCalledTimes(1);
  });

  it('should load planning review and open dialog when url is set', async () => {
    planningReviewService.fetchByCardUuid.mockResolvedValue({} as PlanningReviewDto);

    queryParamMapEmitter.next(
      new Map([
        ['card', 'app-id'],
        ['type', CardType.PLAN],
      ])
    );

    await sleep(1);

    expect(planningReviewService.fetchByCardUuid).toHaveBeenCalledTimes(1);
    expect(dialog.open).toHaveBeenCalledTimes(1);
  });

  it('should load covenant and open dialog when url is set', async () => {
    covenantService.fetchByCardUuid.mockResolvedValue({} as CovenantDto);

    queryParamMapEmitter.next(
      new Map([
        ['card', 'app-id'],
        ['type', CardType.COV],
      ])
    );

    await sleep(1);

    expect(covenantService.fetchByCardUuid).toHaveBeenCalledTimes(1);
    expect(dialog.open).toHaveBeenCalledTimes(1);
  });

  it('should show an error toast if fetching data fails', async () => {
    covenantService.fetchByCardUuid.mockRejectedValue({});

    queryParamMapEmitter.next(
      new Map([
        ['card', 'app-id'],
        ['type', CardType.COV],
      ])
    );

    await sleep(1);

    expect(covenantService.fetchByCardUuid).toHaveBeenCalledTimes(1);
    expect(dialog.open).toHaveBeenCalledTimes(0);
    expect(toastService.showErrorToast).toHaveBeenCalledTimes(1);
  });
});

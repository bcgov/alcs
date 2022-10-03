import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA, EventEmitter } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  ApplicationRegionDto,
  ApplicationTypeDto,
  CardStatusDto,
} from '../../../services/application/application-code.dto';
import { ApplicationDetailedDto } from '../../../services/application/application.dto';
import { BoardService } from '../../../services/board/board.service';
import { CardDto } from '../../../services/card/card.dto';
import { UserDto } from '../../../services/user/user.dto';
import { ConfirmationDialogService } from '../../../shared/confirmation-dialog/confirmation-dialog.service';
import { SharedModule } from '../../../shared/shared.module';
import { CardDetailDialogComponent } from './card-detail-dialog.component';

describe('CardDetailDialogComponent', () => {
  let component: CardDetailDialogComponent;
  let fixture: ComponentFixture<CardDetailDialogComponent>;

  const mockAssignee: UserDto = {
    uuid: '11111-11111-11111',
    email: '11111@1111.11',
    name: 'Dart',
    displayName: 'Dart P',
    identityProvider: 'star',
    preferredUsername: 'Dart Placeholder',
    givenName: 'Dart',
    familyName: 'Placeholder',
    mentionLabel: 'DartPlaceholder',
    initials: 'DP',
    settings: { favoriteBoards: [] },
    clientRoles: [],
  };

  const mockApplicationStatusDetails: CardStatusDto = {
    label: 'test_st',
    code: 'STATUS',
    description: 'this is a test status',
  };

  const mockApplicationRegionDetails: ApplicationRegionDto = {
    label: 'test_st',
    code: 'STATUS',
    description: 'this is a test status',
  };

  const mockApplicationType: ApplicationTypeDto = {
    label: 'test_ty',
    code: 'TYPE',
    description: 'this is a test type',
    shortLabel: 'short_label',
    textColor: '#000',
    backgroundColor: '#fff',
  };

  const mockCardDetail: ApplicationDetailedDto = {
    statusDetails: mockApplicationStatusDetails,
    typeDetails: mockApplicationType,
    regionDetails: mockApplicationRegionDetails,
    type: 'TYPE',
    fileNumber: '1111',
    applicant: 'I am an applicant',
    status: 'STATUS',
    region: 'REGION',
    assignee: mockAssignee,
    activeDays: 10,
    pausedDays: 5,
    paused: true,
    highPriority: false,
    board: 'board',
    decisionMeetings: [],
    dateReceived: Date.now(),
    card: {} as CardDto,
  };

  beforeEach(async () => {
    const mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close', 'afterClosed', 'backdropClick', 'subscribe']);
    mockDialogRef.backdropClick = () => new EventEmitter();

    const mockBoardService = jasmine.createSpyObj('BoardService', [
      'close',
      'afterClosed',
      'backdropClick',
      'subscribe',
    ]);
    mockBoardService.$boards = new EventEmitter();

    await TestBed.configureTestingModule({
      declarations: [CardDetailDialogComponent],
      imports: [HttpClientTestingModule, SharedModule, BrowserAnimationsModule],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: {} },
        {
          provide: MatDialogRef,
          useValue: mockDialogRef,
        },
        {
          provide: BoardService,
          useValue: mockBoardService,
        },
        { provide: ConfirmationDialogService, useValue: {} },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(CardDetailDialogComponent);
    component = fixture.componentInstance;
    component.data = mockCardDetail;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render card detail with correct data', () => {
    fixture.detectChanges();

    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('.card-assignee')).toBeTruthy();
    expect(compiled.querySelector('.region')).toBeTruthy();
    expect(compiled.querySelector('.card-active-days').textContent).toContain(`${mockCardDetail.activeDays}`);
    expect(compiled.querySelector('.card-paused-days').textContent).toContain(`${mockCardDetail.pausedDays} `);
    expect(compiled.querySelector('.card-comments-wrapper')).toBeTruthy();
  });
});

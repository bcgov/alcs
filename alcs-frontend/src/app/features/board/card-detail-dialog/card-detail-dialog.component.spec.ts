import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ApplicationStatusDto, ApplicationTypeDto } from '../../services/application/application-code.dto';
import { ApplicationDetailedDto } from '../../services/application/application.dto';
import { UserDto } from '../../services/user/user.dto';
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
  };

  const mockApplicationStatusDetails: ApplicationStatusDto = {
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
    type: 'TYPE',
    fileNumber: '1111',
    applicant: 'I am an applicant',
    status: 'STATUS',
    assignee: mockAssignee,
    activeDays: 10,
    pausedDays: 5,
    paused: true,
    highPriority: false,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CardDetailDialogComponent],
      imports: [
        MatDialogModule,
        HttpClientTestingModule,
        MatFormFieldModule,
        MatDividerModule,
        MatInputModule,
        MatSelectModule,
        BrowserAnimationsModule,
        MatSnackBarModule,
      ],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: {} },
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
    expect(compiled.querySelector('.card-status-label').textContent).toEqual(mockCardDetail.statusDetails.label);
    expect(compiled.querySelector('.card-state').textContent).toEqual('Paused');
    expect(compiled.querySelector('.card-applicant')).toBeTruthy();
    expect(compiled.querySelector('.card-type')).toBeTruthy();
    expect(compiled.querySelector('.card-assignee')).toBeTruthy();
    expect(compiled.querySelector('.card-decision-maker')).toBeTruthy();
    expect(compiled.querySelector('.card-region')).toBeTruthy();
    expect(compiled.querySelector('.card-active-days').textContent).toEqual(`${mockCardDetail.activeDays}`);
    expect(compiled.querySelector('.card-paused-days').textContent).toEqual(`${mockCardDetail.pausedDays}`);
    expect(compiled.querySelector('.card-state-btn').textContent.trim()).toEqual('Activate');
    expect(compiled.querySelector('.card-comments-wrapper')).toBeTruthy();
  });
});

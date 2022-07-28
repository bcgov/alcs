import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { UserDto } from '../../services/user/user.dto';
import { ApplicationStatusDto } from '../application/application-status.dto';
import { ApplicationDetailedDto } from '../application/application.dto';
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
  };

  const mockApplicationStatusDetails: ApplicationStatusDto = {
    label: 'test_st',
    code: 'TEST',
    description: 'this is a test status',
  };

  const mockCardDetail: ApplicationDetailedDto = {
    statusDetails: mockApplicationStatusDetails,
    fileNumber: '1111',
    title: '111 title',
    body: 'this is a body',
    status: 'TEST',
    assignee: mockAssignee,
    activeDays: 0,
    pausedDays: 0,
    paused: true,
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
      ],
      providers: [{ provide: MAT_DIALOG_DATA, useValue: {} }],
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
    expect(compiled.querySelector('.card-title').textContent).toEqual(mockCardDetail.title);
    expect(compiled.querySelector('.card-status-label').textContent).toEqual(mockCardDetail.statusDetails.label);
    expect(compiled.querySelector('.card-state').textContent).toEqual('Paused');
    expect(compiled.querySelector('.card-file-number').textContent).toEqual(mockCardDetail.fileNumber);
    expect(compiled.querySelector('.card-applicant').textContent).toEqual('Dart Placeholder');
    expect(compiled.querySelector('.card-assignee')).toBeTruthy();
    expect(compiled.querySelector('.card-active-days').textContent).toEqual('10 Placeholder');
    expect(compiled.querySelector('.card-paused-days').textContent).toEqual('5 Placeholder');
    expect(compiled.querySelector('.card-state-btn').textContent.trim()).toEqual('Activate');
    expect(compiled.querySelector('.card-details').textContent).toEqual(mockCardDetail.body);
    expect(compiled.querySelector('.card-comments-wrapper')).toBeTruthy();
  });
});

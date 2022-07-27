import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApplicationDetailedDto } from '../application/application.dto';
import { UserDto } from '../../services/user/user.dto';

import { CardDetailDialogComponent } from './card-detail-dialog.component';
import { ApplicationStatusDto } from '../application/application-status.dto';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDividerModule } from '@angular/material/divider';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('CardDetailDialogComponent', () => {
  let component: CardDetailDialogComponent;
  let fixture: ComponentFixture<CardDetailDialogComponent>;

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
      ],
      providers: [{ provide: MAT_DIALOG_DATA, useValue: {} }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(CardDetailDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render card detail with correct data', () => {
    const testAssignee: UserDto = {
      uuid: '11111-11111-11111',
      email: '11111@1111.11',
      name: 'Dart',
      displayName: 'Dart P',
      identityProvider: 'star',
      preferredUsername: 'Dart Placeholder',
      givenName: 'Dart',
      familyName: 'Placeholder',
    };

    const testApplicationStatusDetails: ApplicationStatusDto = {
      label: 'test_st',
      code: 'TEST',
      description: 'this is a test status',
    };

    const testCardDetail: ApplicationDetailedDto = {
      statusDetails: testApplicationStatusDetails,
      fileNumber: '1111',
      title: '111 title',
      body: 'this is a body',
      status: 'TEST',
      assignee: testAssignee,
    };

    component.data = testCardDetail;
    fixture.detectChanges();

    const compiled = fixture.debugElement.nativeElement;
  });
});

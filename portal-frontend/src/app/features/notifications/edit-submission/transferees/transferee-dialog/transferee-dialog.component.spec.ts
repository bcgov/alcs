import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { NotificationTransfereeService } from '../../../../../services/notification-transferee/notification-transferee.service';

import { TransfereeDialogComponent } from './transferee-dialog.component';

describe('TransfereeDialogComponent', () => {
  let component: TransfereeDialogComponent;
  let fixture: ComponentFixture<TransfereeDialogComponent>;
  let mockTransfereeService: DeepMocked<NotificationTransfereeService>;

  beforeEach(async () => {
    mockTransfereeService = createMock();

    await TestBed.configureTestingModule({
      providers: [
        {
          provide: NotificationTransfereeService,
          useValue: mockTransfereeService,
        },
        {
          provide: MatDialogRef,
          useValue: {},
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {},
        },
        {
          provide: MatDialog,
          useValue: {},
        },
      ],
      declarations: [TransfereeDialogComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(TransfereeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

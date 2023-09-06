import { HttpClient } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { NotificationParcelService } from '../../../../../services/notification-parcel/notification-parcel.service';
import { DeleteParcelDialogComponent } from './delete-parcel-dialog.component';

describe('DeleteParcelDialogComponent', () => {
  let component: DeleteParcelDialogComponent;
  let fixture: ComponentFixture<DeleteParcelDialogComponent>;
  let mockHttpClient: DeepMocked<HttpClient>;
  let mockNotificationParcelService: DeepMocked<NotificationParcelService>;

  beforeEach(async () => {
    mockHttpClient = createMock();
    mockNotificationParcelService = createMock();

    await TestBed.configureTestingModule({
      declarations: [DeleteParcelDialogComponent],
      providers: [
        {
          provide: HttpClient,
          useValue: mockHttpClient,
        },
        {
          provide: NotificationParcelService,
          useValue: mockNotificationParcelService,
        },
        {
          provide: MatDialogRef,
          useValue: {},
        },
        { provide: MAT_DIALOG_DATA, useValue: {} },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(DeleteParcelDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

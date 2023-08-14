import { HttpClient } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { NoticeOfIntentParcelService } from '../../../../../services/notice-of-intent-parcel/notice-of-intent-parcel.service';
import { DeleteParcelDialogComponent } from './delete-parcel-dialog.component';

describe('DeleteParcelDialogComponent', () => {
  let component: DeleteParcelDialogComponent;
  let fixture: ComponentFixture<DeleteParcelDialogComponent>;
  let mockHttpClient: DeepMocked<HttpClient>;
  let mockNoiParcelService: DeepMocked<NoticeOfIntentParcelService>;

  beforeEach(async () => {
    mockHttpClient = createMock();
    mockNoiParcelService = createMock();

    await TestBed.configureTestingModule({
      declarations: [DeleteParcelDialogComponent],
      providers: [
        {
          provide: HttpClient,
          useValue: mockHttpClient,
        },
        {
          provide: NoticeOfIntentParcelService,
          useValue: mockNoiParcelService,
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

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { PaginatedHolidayResponse, StatHolidayService } from '../../../services/stat-holiday/stat-holiday.service';
import { ConfirmationDialogService } from '../../../shared/confirmation-dialog/confirmation-dialog.service';

import { StatHolidayComponent } from './stat-holiday.component';

describe('StatHolidayComponent', () => {
  let component: StatHolidayComponent;
  let fixture: ComponentFixture<StatHolidayComponent>;
  let mockHolidayService: DeepMocked<StatHolidayService>;
  let mockDialog: DeepMocked<MatDialog>;
  let mockConfirmationDialogService: DeepMocked<ConfirmationDialogService>;

  beforeEach(async () => {
    mockHolidayService = createMock();
    mockDialog = createMock();
    mockConfirmationDialogService = createMock();
    mockHolidayService.$statHolidays = new BehaviorSubject<PaginatedHolidayResponse>({ data: [], total: 0 });

    await TestBed.configureTestingModule({
      declarations: [StatHolidayComponent],
      providers: [
        {
          provide: StatHolidayService,
          useValue: mockHolidayService,
        },
        {
          provide: MatDialog,
          useValue: mockDialog,
        },
        {
          provide: ConfirmationDialogService,
          useValue: mockConfirmationDialogService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [HttpClientTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(StatHolidayComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

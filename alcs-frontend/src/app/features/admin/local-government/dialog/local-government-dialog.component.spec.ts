import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AdminLocalGovernmentService } from '../../../../services/admin-local-government/admin-local-government.service';
import { HolidayService } from '../../../../services/stat-holiday/holiday.service';

import { LocalGovernmentDialogComponent } from './local-government-dialog.component';

describe('HolidayDialogComponent', () => {
  let component: LocalGovernmentDialogComponent;
  let fixture: ComponentFixture<LocalGovernmentDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, FormsModule],
      declarations: [LocalGovernmentDialogComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: MatDialogRef, useValue: {} },
        {
          provide: AdminLocalGovernmentService,
          useValue: {},
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(LocalGovernmentDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

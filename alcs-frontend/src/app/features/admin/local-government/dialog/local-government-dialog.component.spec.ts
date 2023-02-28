import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AdminLocalGovernmentService } from '../../../../services/admin-local-government/admin-local-government.service';

import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { ApplicationRegionDto } from '../../../../services/application/application-code.dto';
import { ApplicationService } from '../../../../services/application/application.service';
import { LocalGovernmentDialogComponent } from './local-government-dialog.component';

describe('HolidayDialogComponent', () => {
  let component: LocalGovernmentDialogComponent;
  let fixture: ComponentFixture<LocalGovernmentDialogComponent>;
  let mockApplicationService: DeepMocked<ApplicationService>;

  beforeEach(async () => {
    mockApplicationService = createMock();
    mockApplicationService.$applicationRegions = new BehaviorSubject<ApplicationRegionDto[]>([]);

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
        {
          provide: ApplicationService,
          useValue: mockApplicationService,
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

import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { ApplicationStatusDto } from '../../../../../services/application/application-reconsideration/application-reconsideration.dto';
import { ApplicationService } from '../../../../../services/application/application.service';

import { RevertToDraftDialogComponent } from './revert-to-draft-dialog.component';

describe('RevertToDraftDialogComponent', () => {
  let component: RevertToDraftDialogComponent;
  let fixture: ComponentFixture<RevertToDraftDialogComponent>;
  let mockApplicationService: DeepMocked<ApplicationService>;

  beforeEach(async () => {
    mockApplicationService = createMock();
    mockApplicationService.$applicationStatuses = new BehaviorSubject<ApplicationStatusDto[]>([]);

    await TestBed.configureTestingModule({
      declarations: [RevertToDraftDialogComponent],
      providers: [
        {
          provide: ApplicationService,
          useValue: mockApplicationService,
        },
        { provide: MatDialogRef, useValue: {} },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(RevertToDraftDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

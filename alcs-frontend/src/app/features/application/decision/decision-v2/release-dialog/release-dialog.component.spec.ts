import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { ApplicationStatusTypeDto } from '../../../../../services/application/application-reconsideration/application-reconsideration.dto';
import { ApplicationService } from '../../../../../services/application/application.service';

import { ReleaseDialogComponent } from './release-dialog.component';

describe('ReleaseDialogComponent', () => {
  let component: ReleaseDialogComponent;
  let fixture: ComponentFixture<ReleaseDialogComponent>;
  let mockApplicationService: DeepMocked<ApplicationService>;

  beforeEach(async () => {
    mockApplicationService = createMock();
    mockApplicationService.$applicationStatuses = new BehaviorSubject<ApplicationStatusTypeDto[]>([]);

    await TestBed.configureTestingModule({
      declarations: [ReleaseDialogComponent],
      providers: [
        {
          provide: ApplicationService,
          useValue: mockApplicationService,
        },
        { provide: MatDialogRef, useValue: {} },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ReleaseDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

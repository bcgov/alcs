import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { ApplicationDetailService } from '../../../services/application/application-detail.service';
import { ConfirmationDialogService } from '../../../shared/confirmation-dialog/confirmation-dialog.service';

import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { InfoRequestsComponent } from './info-requests.component';

describe('InfoRequestsComponent', () => {
  let component: InfoRequestsComponent;
  let fixture: ComponentFixture<InfoRequestsComponent>;
  let mockAppDetailService: DeepMocked<ApplicationDetailService>;

  beforeEach(async () => {
    mockAppDetailService = createMock();

    await TestBed.configureTestingModule({
      declarations: [InfoRequestsComponent],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [MatSnackBarModule],
      providers: [
        {
          provide: MatDialogRef,
          useValue: {},
        },
        {
          provide: MatDialog,
          useValue: {},
        },
        { provide: ApplicationDetailService, useValue: mockAppDetailService },
        { provide: ConfirmationDialogService, useValue: {} },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(InfoRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDialog } from '@angular/material/dialog';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import {
  AdminLocalGovernmentService,
  PaginatedLocalGovernmentResponse,
} from '../../../services/admin-local-government/admin-local-government.service';
import { ConfirmationDialogService } from '../../../shared/confirmation-dialog/confirmation-dialog.service';

import { LocalGovernmentComponent } from './local-government.component';

describe('LocalGovernmentComponent', () => {
  let component: LocalGovernmentComponent;
  let fixture: ComponentFixture<LocalGovernmentComponent>;
  let mockLgService: DeepMocked<AdminLocalGovernmentService>;
  let mockDialog: DeepMocked<MatDialog>;
  let mockConfirmationDialogService: DeepMocked<ConfirmationDialogService>;

  beforeEach(async () => {
    mockLgService = createMock();
    mockDialog = createMock();
    mockConfirmationDialogService = createMock();
    mockLgService.$localGovernments = new BehaviorSubject<PaginatedLocalGovernmentResponse>({ data: [], total: 0 });

    await TestBed.configureTestingModule({
      declarations: [LocalGovernmentComponent],
      providers: [
        {
          provide: AdminLocalGovernmentService,
          useValue: mockLgService,
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
      imports: [HttpClientTestingModule, MatAutocompleteModule],
    }).compileComponents();

    fixture = TestBed.createComponent(LocalGovernmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

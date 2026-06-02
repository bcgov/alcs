import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { AdminBoardManagementService } from '../../../services/admin-board-management/admin-board-management.service';
import { BoardService } from '../../../services/board/board.service';
import { ConfirmationDialogService } from '../../../shared/confirmation-dialog/confirmation-dialog.service';

import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { BoardManagementComponent } from './board-management.component';

describe('BoardManagementComponent', () => {
  let component: BoardManagementComponent;
  let fixture: ComponentFixture<BoardManagementComponent>;

  let mockBoardService: DeepMocked<BoardService>;
  let mockBoardAdminService: DeepMocked<AdminBoardManagementService>;

  let mockDialog: DeepMocked<MatDialog>;
  let mockConfirmationDialogService: DeepMocked<ConfirmationDialogService>;

  beforeEach(async () => {
    mockBoardService = createMock();
    mockBoardAdminService = createMock();
    mockDialog = createMock();
    mockConfirmationDialogService = createMock();

    await TestBed.configureTestingModule({
      declarations: [BoardManagementComponent],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [],
      providers: [
        {
          provide: BoardService,
          useValue: mockBoardService,
        },
        {
          provide: AdminBoardManagementService,
          useValue: mockBoardAdminService,
        },
        {
          provide: MatDialog,
          useValue: mockDialog,
        },
        {
          provide: ConfirmationDialogService,
          useValue: mockConfirmationDialogService,
        },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BoardManagementComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

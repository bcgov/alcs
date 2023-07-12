import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EventEmitter, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject, Observable } from 'rxjs';
import { AdminBoardManagementService } from '../../../services/admin-board-management/admin-board-management.service';
import { BoardService, BoardWithFavourite } from '../../../services/board/board.service';
import { ConfirmationDialogService } from '../../../shared/confirmation-dialog/confirmation-dialog.service';

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

    mockBoardService.$boards = new BehaviorSubject<BoardWithFavourite[]>([]);

    await TestBed.configureTestingModule({
      declarations: [BoardManagementComponent],
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
      ],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [HttpClientTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(BoardManagementComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

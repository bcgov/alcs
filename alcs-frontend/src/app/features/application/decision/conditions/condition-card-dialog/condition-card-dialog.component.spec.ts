import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ApplicationDecisionConditionCardService } from '../../../../../services/application/decision/application-decision-v2/application-decision-condition/application-decision-condition-card/application-decision-condition-card.service';
import { BoardService } from '../../../../../services/board/board.service';
import { ToastService } from '../../../../../services/toast/toast.service';
import { ConditionCardDialogComponent } from './condition-card-dialog.component';

describe('ConditionCardDialogComponent', () => {
  let component: ConditionCardDialogComponent;
  let fixture: ComponentFixture<ConditionCardDialogComponent>;
  let mockDecisionConditionCardService: DeepMocked<ApplicationDecisionConditionCardService>;
  let mockBoardService: DeepMocked<BoardService>;
  let mockToastService: DeepMocked<ToastService>;

  beforeEach(async () => {
    mockDecisionConditionCardService = createMock();
    mockBoardService = createMock();
    mockToastService = createMock();

    await TestBed.configureTestingModule({
      declarations: [ConditionCardDialogComponent],
      imports: [
        MatDialogModule,
        BrowserAnimationsModule,
        MatTableModule,
        MatSortModule,
        HttpClientTestingModule,
        RouterTestingModule,
      ],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { conditions: [], decision: 'decision-uuid' } },
        { provide: MatDialogRef, useValue: {} },
        { provide: ApplicationDecisionConditionCardService, useValue: mockDecisionConditionCardService },
        { provide: BoardService, useValue: mockBoardService },
        { provide: ToastService, useValue: mockToastService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ConditionCardDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

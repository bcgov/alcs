import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConditionCardDialogComponent } from './condition-card-dialog.component';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { NoticeOfIntentDecisionConditionCardService } from '../../../../../services/notice-of-intent/decision-v2/notice-of-intent-decision-condition/notice-of-intent-decision-condition-card/notice-of-intent-decision-condition-card.service';
import { BoardService } from '../../../../../services/board/board.service';
import { ToastService } from '../../../../../services/toast/toast.service';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('ConditionCardDialogComponent', () => {
  let component: ConditionCardDialogComponent;
  let fixture: ComponentFixture<ConditionCardDialogComponent>;
  let mockDecisionConditionCardService: DeepMocked<NoticeOfIntentDecisionConditionCardService>;
  let mockBoardService: DeepMocked<BoardService>;
  let mockToastService: DeepMocked<ToastService>;

  beforeEach(async () => {
    mockDecisionConditionCardService = createMock();
    mockBoardService = createMock();
    mockToastService = createMock();

    await TestBed.configureTestingModule({
    declarations: [ConditionCardDialogComponent],
    imports: [MatDialogModule, BrowserAnimationsModule, MatTableModule, MatSortModule],
    providers: [
        { provide: MAT_DIALOG_DATA, useValue: { conditions: [], decision: 'decision-uuid' } },
        { provide: MatDialogRef, useValue: {} },
        { provide: NoticeOfIntentDecisionConditionCardService, useValue: mockDecisionConditionCardService },
        { provide: BoardService, useValue: mockBoardService },
        { provide: ToastService, useValue: mockToastService },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
    ]
}).compileComponents();

    fixture = TestBed.createComponent(ConditionCardDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

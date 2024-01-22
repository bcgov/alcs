import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { ToastService } from '../../../../../../../services/toast/toast.service';

import { DecisionComponentComponent } from './decision-component.component';

describe('DecisionComponentComponent', () => {
  let component: DecisionComponentComponent;
  let fixture: ComponentFixture<DecisionComponentComponent>;
  let mockToastService: DeepMocked<ToastService>;

  beforeEach(async () => {
    mockToastService = createMock();

    await TestBed.configureTestingModule({
      declarations: [DecisionComponentComponent],
      providers: [{ provide: ToastService, useValue: mockToastService }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(DecisionComponentComponent);
    component = fixture.componentInstance;
    component.data = { noticeOfIntentDecisionComponentTypeCode: '' };

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

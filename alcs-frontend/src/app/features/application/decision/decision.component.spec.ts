import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { ApplicationDetailService } from '../../../services/application/application-detail.service';

import { DecisionComponent } from './decision.component';

describe('DecisionComponent', () => {
  let component: DecisionComponent;
  let fixture: ComponentFixture<DecisionComponent>;
  let mockApplicationDetailService: DeepMocked<ApplicationDetailService>;

  beforeEach(async () => {
    mockApplicationDetailService = createMock();

    await TestBed.configureTestingModule({
      providers: [
        {
          provide: ApplicationDetailService,
          useValue: mockApplicationDetailService,
        },
      ],
      declarations: [DecisionComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(DecisionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

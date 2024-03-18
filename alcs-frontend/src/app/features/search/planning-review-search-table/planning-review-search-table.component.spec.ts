import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { createMock, DeepMocked } from '@golevelup/ts-jest';

import { PlanningReviewSearchTableComponent } from './planning-review-search-table.component';

describe('NonApplicationSearchTableComponent', () => {
  let component: PlanningReviewSearchTableComponent;
  let fixture: ComponentFixture<PlanningReviewSearchTableComponent>;
  let mockRouter: DeepMocked<Router>;

  beforeEach(async () => {
    mockRouter = createMock();

    await TestBed.configureTestingModule({
      declarations: [PlanningReviewSearchTableComponent],
      providers: [
        {
          provide: Router,
          useValue: mockRouter,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PlanningReviewSearchTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanningReviewComponent } from './planning-review.component';

describe('PlanningReviewComponent', () => {
  let component: PlanningReviewComponent;
  let fixture: ComponentFixture<PlanningReviewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PlanningReviewComponent]
    });
    fixture = TestBed.createComponent(PlanningReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

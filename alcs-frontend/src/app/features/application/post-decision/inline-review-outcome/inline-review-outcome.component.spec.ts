import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InlineReviewOutcomeComponent } from './inline-review-outcome.component';

describe('InlineReviewOutcomeComponent', () => {
  let component: InlineReviewOutcomeComponent;
  let fixture: ComponentFixture<InlineReviewOutcomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InlineReviewOutcomeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InlineReviewOutcomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

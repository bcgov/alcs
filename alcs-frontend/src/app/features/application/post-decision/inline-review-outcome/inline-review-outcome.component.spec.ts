import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

import { InlineReviewOutcomeComponent } from './inline-review-outcome.component';

describe('InlineReviewOutcomeComponent', () => {
  let component: InlineReviewOutcomeComponent;
  let fixture: ComponentFixture<InlineReviewOutcomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule, MatButtonToggleModule],
      declarations: [InlineReviewOutcomeComponent],
      providers: [],
    }).compileComponents();

    fixture = TestBed.createComponent(InlineReviewOutcomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

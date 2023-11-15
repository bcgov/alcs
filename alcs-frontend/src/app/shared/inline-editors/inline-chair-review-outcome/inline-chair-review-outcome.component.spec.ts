import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { SharedModule } from '../../shared.module';
import { InlineChairReviewOutcomeComponent } from './inline-chair-review-outcome.component';

describe('InlineChairReviewOutcomeComponent', () => {
  let component: InlineChairReviewOutcomeComponent;
  let fixture: ComponentFixture<InlineChairReviewOutcomeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule, FormsModule, ReactiveFormsModule, MatButtonToggleModule],
      declarations: [InlineChairReviewOutcomeComponent],
      providers: [],
    });
    fixture = TestBed.createComponent(InlineChairReviewOutcomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

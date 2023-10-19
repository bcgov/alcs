import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { SharedModule } from '../../shared.module';

import { InlineDecisionOutcomeComponent } from './inline-decision-outcome.component';

describe('InlineDecisionOutcomeComponent', () => {
  let component: InlineDecisionOutcomeComponent;
  let fixture: ComponentFixture<InlineDecisionOutcomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedModule, FormsModule, ReactiveFormsModule, MatButtonToggleModule],
      declarations: [InlineDecisionOutcomeComponent],
      providers: [],
    }).compileComponents();

    fixture = TestBed.createComponent(InlineDecisionOutcomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

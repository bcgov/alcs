import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { SharedModule } from '../shared.module';

import { InlineApplicantTypeComponent } from './inline-applicant-type.component';

describe('InlineApplicantTypeComponent', () => {
  let component: InlineApplicantTypeComponent;
  let fixture: ComponentFixture<InlineApplicantTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedModule, FormsModule, ReactiveFormsModule, MatButtonToggleModule],
      declarations: [InlineApplicantTypeComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(InlineApplicantTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

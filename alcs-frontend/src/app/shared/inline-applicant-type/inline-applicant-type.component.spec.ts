import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InlineApplicantTypeComponent } from './inline-applicant-type.component';

describe('InlineApplicantTypeComponent', () => {
  let component: InlineApplicantTypeComponent;
  let fixture: ComponentFixture<InlineApplicantTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InlineApplicantTypeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InlineApplicantTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

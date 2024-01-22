import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicationSubmissionStatusTypePillComponent } from './application-submission-status-type-pill.component';

describe('ApplicationSubmissionStatusTypePillComponent', () => {
  let component: ApplicationSubmissionStatusTypePillComponent;
  let fixture: ComponentFixture<ApplicationSubmissionStatusTypePillComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ApplicationSubmissionStatusTypePillComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ApplicationSubmissionStatusTypePillComponent);
    component = fixture.componentInstance;
    component.type = {
      backgroundColor: '#fff',
      label: 'label',
      textColor: '#fff',
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

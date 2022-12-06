import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicationTimeTrackerComponent } from './application-time-tracker.component';

describe('ApplicationTimeTrackerComponent', () => {
  let component: ApplicationTimeTrackerComponent;
  let fixture: ComponentFixture<ApplicationTimeTrackerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ApplicationTimeTrackerComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ApplicationTimeTrackerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

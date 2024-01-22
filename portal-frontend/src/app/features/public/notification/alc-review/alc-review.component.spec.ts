import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicAlcReviewComponent } from './alc-review.component';

describe('PublicAlcReviewComponent', () => {
  let component: PublicAlcReviewComponent;
  let fixture: ComponentFixture<PublicAlcReviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [],
      declarations: [PublicAlcReviewComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(PublicAlcReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

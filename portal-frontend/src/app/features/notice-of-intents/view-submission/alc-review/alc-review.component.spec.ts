import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlcReviewComponent } from './alc-review.component';

describe('AlcsReviewComponent', () => {
  let component: AlcReviewComponent;
  let fixture: ComponentFixture<AlcReviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [],
      declarations: [AlcReviewComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AlcReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

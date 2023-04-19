import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdatedBannerComponent } from './updated-banner.component';

describe('UpdatedBannerComponent', () => {
  let component: UpdatedBannerComponent;
  let fixture: ComponentFixture<UpdatedBannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UpdatedBannerComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(UpdatedBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

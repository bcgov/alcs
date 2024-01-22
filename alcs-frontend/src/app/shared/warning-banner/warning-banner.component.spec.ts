import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WarningBannerComponent } from './warning-banner.component';

describe('WarningBannerComponent', () => {
  let component: WarningBannerComponent;
  let fixture: ComponentFixture<WarningBannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WarningBannerComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(WarningBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

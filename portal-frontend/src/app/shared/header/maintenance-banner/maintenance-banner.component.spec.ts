import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaintenanceBannerComponent } from './maintenance-banner.component';

describe('MaintenanceBannerComponent', () => {
  let component: MaintenanceBannerComponent;
  let fixture: ComponentFixture<MaintenanceBannerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MaintenanceBannerComponent]
    });
    fixture = TestBed.createComponent(MaintenanceBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

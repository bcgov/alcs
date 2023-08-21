import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicationLegacyIdComponent } from './application-legacy-id.component';

describe('ApplicationLegacyIdComponent', () => {
  let component: ApplicationLegacyIdComponent;
  let fixture: ComponentFixture<ApplicationLegacyIdComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ApplicationLegacyIdComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApplicationLegacyIdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

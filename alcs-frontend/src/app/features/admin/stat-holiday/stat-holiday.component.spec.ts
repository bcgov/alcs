import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatHolidayComponent } from './stat-holiday.component';

describe('StatHolidayComponent', () => {
  let component: StatHolidayComponent;
  let fixture: ComponentFixture<StatHolidayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StatHolidayComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StatHolidayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicationSearchTableComponent } from './application-search-table.component';

describe('ApplicationSearchTableComponent', () => {
  let component: ApplicationSearchTableComponent;
  let fixture: ComponentFixture<ApplicationSearchTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ApplicationSearchTableComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApplicationSearchTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

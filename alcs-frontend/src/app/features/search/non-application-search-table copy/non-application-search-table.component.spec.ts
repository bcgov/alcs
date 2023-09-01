import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NonApplicationSearchTableComponent } from './non-application-search-table.component';

describe('NonApplicationSearchTableComponent', () => {
  let component: NonApplicationSearchTableComponent;
  let fixture: ComponentFixture<NonApplicationSearchTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NonApplicationSearchTableComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NonApplicationSearchTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

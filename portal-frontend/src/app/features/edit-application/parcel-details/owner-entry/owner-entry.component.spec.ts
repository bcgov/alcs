import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OwnerEntryComponent } from './owner-entry.component';

describe('OwnerEntryComponent', () => {
  let component: OwnerEntryComponent;
  let fixture: ComponentFixture<OwnerEntryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OwnerEntryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OwnerEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

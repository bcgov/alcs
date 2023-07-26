import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LotsTableFormComponent } from './lots-table-form.component';

describe('LotsTableComponent', () => {
  let component: LotsTableFormComponent;
  let fixture: ComponentFixture<LotsTableFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LotsTableFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LotsTableFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { StartOfDayPipe } from '../pipes/startOfDay.pipe';

import { InlineDatepickerComponent } from './inline-datepicker.component';

describe('InlineDatepickerComponent', () => {
  let component: InlineDatepickerComponent;
  let fixture: ComponentFixture<InlineDatepickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule],
      declarations: [InlineDatepickerComponent, StartOfDayPipe],
    }).compileComponents();

    fixture = TestBed.createComponent(InlineDatepickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

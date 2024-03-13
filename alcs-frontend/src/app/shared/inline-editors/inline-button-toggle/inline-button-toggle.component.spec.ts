import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { SharedModule } from '../../shared.module';

import { InlineButtonToggleComponent } from './inline-button-toggle.component';

describe('InlineButtonToggleComponent', () => {
  let component: InlineButtonToggleComponent;
  let fixture: ComponentFixture<InlineButtonToggleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedModule, FormsModule, ReactiveFormsModule, MatButtonToggleModule],
      declarations: [InlineButtonToggleComponent],
      providers: [],
    }).compileComponents();

    fixture = TestBed.createComponent(InlineButtonToggleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

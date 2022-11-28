import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { RouterTestingModule } from '@angular/router/testing';
import { ApplicationService } from '../../services/application/application.service';
import { CodeService } from '../../services/code/code.service';

import { CreateApplicationComponent } from './create-application.component';

describe('CreateApplicationComponent', () => {
  let component: CreateApplicationComponent;
  let fixture: ComponentFixture<CreateApplicationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreateApplicationComponent],
      providers: [
        {
          provide: ApplicationService,
          useValue: {},
        },
        {
          provide: CodeService,
          useValue: {},
        },
      ],
      imports: [RouterTestingModule, MatAutocompleteModule],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateApplicationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

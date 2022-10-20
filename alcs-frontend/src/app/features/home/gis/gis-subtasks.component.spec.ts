import { EventEmitter } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { CardSubtaskService } from '../../../services/card/card-subtask/card-subtask.service';
import { ApplicationService } from '../../../services/application/application.service';
import { HomeService } from '../../../services/home/home.service';
import { UserService } from '../../../services/user/user.service';
import { GisSubtasksComponent } from './gis-subtasks.component';

describe('GisSubtasksComponent', () => {
  let component: GisSubtasksComponent;
  let fixture: ComponentFixture<GisSubtasksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        {
          provide: ApplicationService,
          useValue: {
            setup: jasmine.createSpy(),
            $cardStatuses: new EventEmitter(),
          },
        },
        {
          provide: CardSubtaskService,
          useValue: {},
        },
        {
          provide: UserService,
          useValue: {
            $users: new EventEmitter(),
            fetchUsers: jasmine.createSpy(),
          },
        },
        { provide: HomeService, useValue: {} },
      ],
      declarations: [GisSubtasksComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GisSubtasksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

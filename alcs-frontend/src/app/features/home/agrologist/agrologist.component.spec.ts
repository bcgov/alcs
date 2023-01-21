import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { CardSubtaskService } from '../../../services/card/card-subtask/card-subtask.service';
import { HomeService } from '../../../services/home/home.service';
import { AssigneeDto } from '../../../services/user/user.dto';
import { UserService } from '../../../services/user/user.service';
import { SharedModule } from '../../../shared/shared.module';
import { AgrologistComponent } from './agrologist.component';

describe('GisSubtasksComponent', () => {
  let component: AgrologistComponent;
  let fixture: ComponentFixture<AgrologistComponent>;
  let mockUserService: DeepMocked<UserService>;

  beforeEach(async () => {
    mockUserService = createMock();
    mockUserService.$assignableUsers = new BehaviorSubject<AssigneeDto[]>([]);

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, SharedModule],
      providers: [
        {
          provide: CardSubtaskService,
          useValue: {},
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
        { provide: HomeService, useValue: {} },
      ],
      declarations: [AgrologistComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AgrologistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

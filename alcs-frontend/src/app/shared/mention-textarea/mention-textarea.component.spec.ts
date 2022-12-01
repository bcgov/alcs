import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { AssigneeDto, UserDto } from '../../services/user/user.dto';
import { UserService } from '../../services/user/user.service';

import { MentionTextareaComponent } from './mention-textarea.component';

describe('MentionTextareaComponent', () => {
  let component: MentionTextareaComponent;
  let fixture: ComponentFixture<MentionTextareaComponent>;
  let mockUserService: DeepMocked<UserService>;

  beforeEach(async () => {
    mockUserService = createMock();
    mockUserService.$assignableUsers = new BehaviorSubject<AssigneeDto[]>([]);

    await TestBed.configureTestingModule({
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
      declarations: [MentionTextareaComponent],
      imports: [HttpClientTestingModule, MatSnackBarModule],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(MentionTextareaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

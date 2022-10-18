import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BehaviorSubject } from 'rxjs';
import { UserDto } from '../../services/user/user.dto';
import { UserService } from '../../services/user/user.service';

import { MentionTextareaComponent } from './mention-textarea.component';

describe('MentionTextareaComponent', () => {
  let component: MentionTextareaComponent;
  let fixture: ComponentFixture<MentionTextareaComponent>;
  let mockUserService: jasmine.SpyObj<UserService>;

  beforeEach(async () => {
    mockUserService = jasmine.createSpyObj<UserService>('UserService', ['fetchUsers']);
    mockUserService.$users = new BehaviorSubject<UserDto[]>([]);

    await TestBed.configureTestingModule({
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
      declarations: [MentionTextareaComponent],
      imports: [HttpClientTestingModule, MatSnackBarModule],
    }).compileComponents();

    fixture = TestBed.createComponent(MentionTextareaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

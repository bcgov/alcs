import { Component, Directive, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from '../../services/authentication/authentication.service';
import { DragDropColumn } from '../../shared/drag-drop-board/drag-drop-column.interface';
import { DragDropItem } from '../../shared/drag-drop-board/drag-drop-item.interface';
import { ApplicationService } from '../application/application.service';

@Component({
  selector: 'app-authorization',
  template: `<>`,
})
export class AuthorizationComponent implements OnInit {
  constructor(private route: ActivatedRoute, private router: Router, private authService: AuthenticationService) {}

  async ngOnInit() {
    const token = this.route.snapshot.queryParamMap.get('t');
    if (token) {
      await this.authService.setToken(token);
      await this.router.navigateByUrl('/admin');
    }
  }
}

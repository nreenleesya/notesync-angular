import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { PageService } from '../../../services/page.service';

@Component({
  selector: 'app-header',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: true,
  imports: [AsyncPipe],
})
export class DashboardComponent {
  pageService: PageService = inject(PageService);
  user$ = this.pageService.user$;
}

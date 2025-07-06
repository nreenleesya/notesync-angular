import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { PageService } from '../../../services/page.service';

@Component({
  selector: 'app-header',
  templateUrl: './admin.html',
  styleUrls: ['./admin.css'],
  standalone: true,
  imports: [],
})
export class AdminComponent {
  pageService: PageService = inject(PageService);
  user$ = this.pageService.user$;
}

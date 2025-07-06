import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { PageService } from '../../../services/page.service';
import { RouterModule } from '@angular/router'; // Import RouterModule

@Component({
  selector: 'app-header', // Consider renaming this selector if it's the dashboard
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: true,
  imports: [AsyncPipe, RouterModule], // Add RouterModule here
})
export class DashboardComponent {
  pageService: PageService = inject(PageService);
  user$ = this.pageService.user$;
}
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
/*TODO: add search function
async function findNotesBySubject(subject) {
  const notes = await Note.find({ subject: subject });
  console.log('Notes found:', notes);
}


/* --- PRE-REQUISITE: Get some existing IDs from your 'users' and 'notes' collections ---
// Example: Find an admin (seller) user ID
const exampleSellerId = db.users.findOne({ role: "admin" })._id;
print(`Example Seller ID: ${exampleSellerId}`);

// Example: Find a buyer user ID
const exampleBuyerId = db.users.findOne({ role: "buyer" })._id;
print(`Example Buyer ID: ${exampleBuyerId}`);

// Example: Find a note ID (e.g., the Python notes)
const exampleNoteId = db.notes.findOne({ title: "Introduction to Python Programming - Basics" })._id;
print(`Example Note ID: ${exampleNoteId}`);
*/

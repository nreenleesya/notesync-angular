import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Import CommonModule for ngIf, ngClass
import { FormsModule } from '@angular/forms'; // Import FormsModule for ngModel
import { PageService } from '../../../services/page.service'; // Assuming this service exists

@Component({
  selector: 'app-admin', // Changed from app-header to app-admin based on your file structure
  templateUrl: './admin.html',
  styleUrls: ['./admin.css'],
  standalone: true,
  imports: [CommonModule, FormsModule], // Include CommonModule and FormsModule
})
export class AdminComponent implements OnInit {
  pageService: PageService = inject(PageService);
  user$ = this.pageService.user$; // Assuming user$ provides user data

  // Component properties to hold profile data
  displayName: string = 'Loading...';
  displayEmail: string = 'Loading...';
  displayRole: string = 'Administrator';
  displayMemberSince: string = 'January 1, 2023';
  displayLastLogin: string = 'July 7, 2025';
  displayNotesUploaded: number = 150;

  // Properties for the edit form
  editName: string = '';
  editEmail: string = '';

  // State variable to control form visibility
  isEditing: boolean = false;

  ngOnInit(): void {
    // Simulate fetching user data on component initialization
    // In a real Angular app, you would subscribe to an authentication service
    // or your pageService.user$ observable here.
    this.fetchUserData();
  }

  fetchUserData(): void {
    // Placeholder for actual authentication data fetch
    // Replace with actual logic to get data from this.pageService.user$ or another service
    const userData = {
      name: "Syafiqah Nadhirah", // Example: From authenticated user's profile
      email: "syafiqah.nadhirah@example.com" // Example: From authenticated user's email
    };

    this.displayName = userData.name;
    this.displayEmail = userData.email;
    this.editName = userData.name; // Initialize edit fields with current data
    this.editEmail = userData.email;
  }

  // Method to handle the "Edit Profile" button click
  onEditProfile(): void {
    this.isEditing = true;
    // Populate edit fields with current display values (already done in fetchUserData and ngModel)
    // this.editName = this.displayName; // No need to explicitly set here due to ngModel
    // this.editEmail = this.displayEmail; // No need to explicitly set here due to ngModel
    console.log('Entering edit mode.');
  }

  // Method to handle the "Save Changes" button click
  onSaveChanges(): void {
    // Update display values with edited values
    this.displayName = this.editName;
    this.displayEmail = this.editEmail;

    // In a real application, you would send these changes to a backend service
    console.log('Profile saved:', {
      name: this.editName,
      email: this.editEmail
    });
    this.isEditing = false; // Exit edit mode
  }

  // Method to handle the "Cancel" button click
  onCancelEdit(): void {
    // Revert edit fields to original display values
    this.editName = this.displayName;
    this.editEmail = this.displayEmail;

    this.isEditing = false; // Exit edit mode
    console.log('Edit cancelled.');
  }
}

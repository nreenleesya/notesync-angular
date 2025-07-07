import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Import CommonModule for ngIf, ngClass
import { FormsModule } from '@angular/forms'; // Import FormsModule for ngModel
import { PageService } from '../../../services/page.service'; // Adjust path as needed
import { User } from 'firebase/auth'; // Import User type from firebase/auth

@Component({
  selector: 'app-admin',
  templateUrl: './admin.html',
  styleUrls: ['./admin.css'],
  standalone: true,
  imports: [CommonModule, FormsModule], // Include CommonModule and FormsModule
})
export class AdminComponent implements OnInit {
  pageService: PageService = inject(PageService);

  // Component properties to hold profile data
  displayName: string = 'Loading...';
  displayEmail: string = 'Loading...';
  displayRole: string = 'Administrator'; // This might be fetched from a Firestore user document
  displayMemberSince: string = 'N/A';
  displayLastLogin: string = 'N/A';
  displayNotesUploaded: number = 0; // This would typically be fetched from Firestore

  // Properties for the edit form
  editName: string = '';
  editEmail: string = '';

  // State variable to control form visibility
  isEditing: boolean = false;

  ngOnInit(): void {
    // Subscribe to the user$ observable from PageService
    // This will update the profile data whenever the authentication state changes
    this.pageService.user$.subscribe((user: User | null) => {
      if (user) {
        // Populate display properties from the authenticated user object
        this.displayName = user.displayName || 'Admin User'; // Fallback if displayName is null
        this.displayEmail = user.email || 'N/A';

        // Initialize edit fields with current display values
        this.editName = this.displayName;
        this.editEmail = this.displayEmail;

        // Populate member since and last login from Firebase user metadata
        if (user.metadata) {
          this.displayMemberSince = user.metadata.creationTime ?
            new Date(user.metadata.creationTime).toLocaleDateString() : 'N/A';
          this.displayLastLogin = user.metadata.lastSignInTime ?
            new Date(user.metadata.lastSignInTime).toLocaleDateString() : 'N/A';
        }

        // TODO: Fetch 'displayNotesUploaded' and potentially 'displayRole'
        // from a Firestore document associated with this user's UID.
        // Example: this.fetchAdminSpecificData(user.uid);
        console.log('AdminComponent: User data loaded from Firebase:', user.displayName, user.email);
      } else {
        // User is logged out or not authenticated
        this.displayName = 'Guest';
        this.displayEmail = 'Not logged in';
        this.displayMemberSince = 'N/A';
        this.displayLastLogin = 'N/A';
        this.displayNotesUploaded = 0;
        this.editName = '';
        this.editEmail = '';
        console.log('AdminComponent: No user logged in.');
        // Optionally, redirect to login page if this component should only be accessible when logged in
        // this.pageService.router.navigate(['/login']);
      }
    });
  }

  // Method to handle the "Edit Profile" button click
  onEditProfile(): void {
    this.isEditing = true;
    // Edit fields are already initialized in ngOnInit and kept in sync by ngModel
    console.log('Entering edit mode.');
  }

  // Method to handle the "Save Changes" button click
  async onSaveChanges(): Promise<void> {
    console.log('Attempting to save changes:', {
      name: this.editName,
      email: this.editEmail
    });

    const currentUser = this.pageService.auth.currentUser;
    if (currentUser) {
      try {
        // Update Firebase Auth profile
        await this.pageService.updateAuthProfile(currentUser, {
          displayName: this.editName,
          email: this.editEmail
        });

        // Update local display values after successful save
        this.displayName = this.editName;
        this.displayEmail = this.editEmail;

        // TODO: If you store 'role' or 'notesUploaded' in Firestore, update them here too.
        // Example:
        // await this.pageService.updateData(`users/${currentUser.uid}`, {
        //   notesUploaded: this.displayNotesUploaded // Assuming this is editable or just for display
        // });

        console.log('Profile updated successfully!');
        this.isEditing = false; // Exit edit mode
        // You might want to show a success message to the user here (e.g., a toast notification)
      } catch (error: any) {
        console.error('Error saving profile changes:', error);
        // Show an error message to the user
        if (error.code === 'auth/requires-recent-login') {
          // This error occurs if the user's last sign-in was too long ago for sensitive operations like email change
          alert('Please log in again to update your email or sensitive information.');
        } else {
          alert('Failed to save changes: ' + error.message);
        }
      }
    } else {
      console.warn('No user logged in to save changes. Cannot save profile.');
      // Optionally, redirect to login or show an error
    }
  }

  // Method to handle the "Cancel" button click
  onCancelEdit(): void {
    // Revert edit fields to original display values
    this.editName = this.displayName;
    this.editEmail = this.displayEmail;

    this.isEditing = false; // Exit edit mode
    console.log('Edit cancelled.');
  }

  // TODO: Implement this method to fetch admin-specific data from Firestore
  // private async fetchAdminSpecificData(uid: string): Promise<void> {
  //   try {
  //     const adminDoc = await firstValueFrom(this.pageService.getDocData(`adminProfiles/${uid}`));
  //     if (adminDoc) {
  //       this.displayNotesUploaded = adminDoc['notesUploaded'] || 0;
  //       this.displayRole = adminDoc['role'] || 'Administrator';
  //     }
  //   } catch (error) {
  //     console.error('Error fetching admin specific data:', error);
  //   }
  // }
}
// src/app/pages/admin/notes uploaded/notes-uploaded.component.ts

import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Import FormsModule for ngModel
import { Auth, onAuthStateChanged, User as FirebaseUser } from '@angular/fire/auth';
import { Firestore, collection, query, where, onSnapshot, DocumentData, QuerySnapshot, Timestamp } from '@angular/fire/firestore';
import { Storage, ref, uploadBytesResumable, getDownloadURL } from '@angular/fire/storage'; // Import Storage related functions
import { Subscription, Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { PageService } from '../../../services/page.service'; // Assuming this service exists and has addDocToCollection

// Define an interface for your Note structure for better type safety
interface Note {
  _id?: string; // Firestore doc.id (though in Firestore it's just 'id')
  title: string;
  subject: string;
  description: string;
  price: number;
  fileUrl: string;
  tags: string[];
  contributorId: string;
  uploadedAt: Date | Timestamp; // Allow both Date (after toDate()) and Timestamp (before toDate())
  updatedAt: Date | Timestamp;
  salesCount: number;
}

@Component({
  selector: 'app-notes-uploaded',
  standalone: true,
  imports: [CommonModule, FormsModule], // Add FormsModule here
  templateUrl: './notes-uploaded.component.html',
  styleUrls: ['./notes-uploaded.component.css']
})
export class NotesUploadedComponent implements OnInit, OnDestroy {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private router = inject(Router);
  private pageService = inject(PageService); // Inject PageService
  private storage = inject(Storage); // Inject Firebase Storage

  // --- State for displaying notes ---
  notes: Note[] = [];
  isLoadingList: boolean = true; // Renamed to avoid conflict
  errorMessageList: string | null = null; // Renamed to avoid conflict

  private authStateSubscription: Subscription | undefined;
  private notesSubscription: (() => void | undefined) | undefined; // onSnapshot returns an unsubscribe function

  currentUserUid: string | null = null;

  // --- State for uploading notes ---
  showUploadForm: boolean = false; // Controls visibility of the upload form
  noteTitle: string = '';
  noteSubject: string = '';
  noteDescription: string = '';
  notePrice: number = 0;
  noteTags: string = ''; // Comma-separated string for input
  selectedFile: File | null = null;

  isLoadingUpload: boolean = false; // Controls loading state for upload
  uploadProgress: number = 0;
  uploadErrorMessage: string | null = null; // Error specific to upload
  uploadSuccessMessage: string | null = null; // Success specific to upload


  ngOnInit(): void {
    // This subscription handles fetching notes when user auth state changes
    this.authStateSubscription = new Observable<FirebaseUser | null>(observer => {
      onAuthStateChanged(this.auth, user => {
        observer.next(user);
      });
    }).pipe(
      switchMap(user => {
        if (user && user.uid) {
          this.currentUserUid = user.uid;
          // When user logs in, fetch their notes
          this.fetchNotes(user.uid);
          return of([]); // Return an observable to satisfy switchMap, actual notes are in onSnapshot
        } else {
          // User is not logged in
          this.errorMessageList = 'You must be logged in to view your uploaded notes.';
          this.isLoadingList = false;
          this.notes = [];
          this.currentUserUid = null;
          // Optionally redirect if not logged in
          // this.router.navigate(['/login']);
          return of([]);
        }
      })
    ).subscribe({
      next: () => {
        // This 'next' handler is for the outer Observable, actual note data is handled by onSnapshot directly
      },
      error: (err) => {
        console.error('Error in auth state or notes fetching:', err);
        this.errorMessageList = 'An error occurred while loading your notes.';
        this.isLoadingList = false;
      }
    });
  }

  private fetchNotes(contributorId: string): void { // Changed return type to void as onSnapshot handles data
    this.isLoadingList = true;
    this.errorMessageList = null;
    this.notes = [];

    // Unsubscribe previous listener if it exists to prevent memory leaks/duplicate listeners
    if (this.notesSubscription) {
      this.notesSubscription();
    }

    const notesCollectionRef = collection(this.firestore, 'notes');
    const q = query(notesCollectionRef, where('contributorId', '==', contributorId));

    this.notesSubscription = onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
      const fetchedNotes: Note[] = [];
      snapshot.forEach(doc => {
        const noteData = doc.data();
        // Convert Firestore Timestamp to JavaScript Date objects if they exist
        const uploadedAtDate = noteData['uploadedAt'] ? (noteData['uploadedAt'] as Timestamp).toDate() : null;
        const updatedAtDate = noteData['updatedAt'] ? (noteData['updatedAt'] as Timestamp).toDate() : null;

        fetchedNotes.push({
          _id: doc.id,
          title: noteData['title'],
          subject: noteData['subject'],
          description: noteData['description'],
          price: noteData['price'],
          fileUrl: noteData['fileUrl'],
          tags: noteData['tags'] || [],
          contributorId: noteData['contributorId'],
          uploadedAt: uploadedAtDate,
          updatedAt: updatedAtDate,
          salesCount: noteData['salesCount'] || 0
        } as Note);
      });
      this.notes = fetchedNotes;
      this.isLoadingList = false;
      if (this.notes.length === 0) {
        this.errorMessageList = 'You have not uploaded any notes yet.';
      } else {
        this.errorMessageList = null; // Clear if notes are found
      }
    }, (error) => {
      console.error('Error fetching notes:', error);
      this.errorMessageList = 'Failed to load notes. Please try again.';
      this.isLoadingList = false;
    });
  }

  // --- Upload-specific methods ---

  toggleUploadForm(): void {
    this.showUploadForm = !this.showUploadForm;
    if (this.showUploadForm) {
      this.resetUploadForm(); // Clear form when showing it
      this.uploadSuccessMessage = null; // Clear success message if showing form again
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'];
      if (!allowedTypes.includes(file.type)) {
        this.uploadErrorMessage = 'Only PDF and PPTX files are allowed.';
        this.selectedFile = null;
        return;
      }
      this.selectedFile = file;
      this.uploadErrorMessage = null; // Clear any previous errors
    } else {
      this.selectedFile = null;
    }
  }

  async onSubmitUpload(): Promise<void> {
    this.isLoadingUpload = true;
    this.uploadErrorMessage = null;
    this.uploadSuccessMessage = null;
    this.uploadProgress = 0;

    if (!this.currentUserUid) {
      this.uploadErrorMessage = 'You must be logged in to upload a note.';
      this.isLoadingUpload = false;
      return;
    }

    if (!this.selectedFile || !this.noteTitle || !this.noteSubject || !this.noteDescription || this.notePrice < 0) {
      this.uploadErrorMessage = 'Please fill in all required fields and select a file.';
      this.isLoadingUpload = false;
      return;
    }

    try {
      // 1. Upload file to Firebase Storage
      const fileExtension = this.selectedFile.name.split('.').pop();
      const filePath = `notes/${this.currentUserUid}/${this.noteTitle.replace(/\s+/g, '_')}_${Date.now()}.${fileExtension}`;
      const storageRef = ref(this.storage, filePath);
      const uploadTask = uploadBytesResumable(storageRef, this.selectedFile);

      uploadTask.on('state_changed',
        (snapshot) => {
          this.uploadProgress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('Upload is ' + this.uploadProgress + '% done');
        },
        (error) => {
          console.error('File upload failed:', error);
          this.uploadErrorMessage = `File upload failed: ${error.message}`;
          this.isLoadingUpload = false;
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          console.log('File available at', downloadURL);

          // 2. Save note metadata to Firestore
          const tagsArray = this.noteTags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);

          const newNoteData = {
            title: this.noteTitle,
            subject: this.noteSubject,
            description: this.noteDescription,
            price: this.notePrice,
            fileUrl: downloadURL,
            tags: tagsArray,
            contributorId: this.currentUserUid,
            uploadedAt: Timestamp.now(), // Use Firestore server timestamp
            updatedAt: Timestamp.now(),
            salesCount: 0
          };

          await this.pageService.addDocToCollection('notes', newNoteData);

          this.uploadSuccessMessage = 'Note uploaded and saved successfully!';
          this.isLoadingUpload = false;
          this.uploadProgress = 0;
          this.resetUploadForm(); // Clear form after success
          // No navigation needed, as this component now handles both
          // The onSnapshot listener will automatically update the list.
          setTimeout(() => {
            this.showUploadForm = false; // Hide form after success
            this.uploadSuccessMessage = null; // Clear success message after hiding form
          }, 2000);
        }
      );

    } catch (error: any) {
      console.error('Error during note upload/save:', error);
      this.uploadErrorMessage = `Error: ${error.message}`;
      this.isLoadingUpload = false;
    }
  }

  resetUploadForm(): void {
    this.noteTitle = '';
    this.noteSubject = '';
    this.noteDescription = '';
    this.notePrice = 0;
    this.noteTags = '';
    this.selectedFile = null;
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = ''; // Clear the file input visually
    }
  }

  onCancelUpload(): void {
    this.resetUploadForm();
    this.uploadErrorMessage = null;
    this.uploadSuccessMessage = null;
    this.isLoadingUpload = false;
    this.uploadProgress = 0;
    this.showUploadForm = false; // Hide the form
  }

  // --- Helper functions for display (already existing) ---
  getFileIcon(fileUrl: string): string {
    if (!fileUrl) return '📄';
    const extension = fileUrl.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf': return '📄';
      case 'jpg': case 'jpeg': case 'png': case 'gif': return '🖼️';
      case 'mp4': case 'mov': case 'avi': return '🎬';
      case 'doc': case 'docx': return '📝';
      case 'xls': case 'xlsx': return '📊';
      case 'ppt': case 'pptx': return '📊'; // Changed to presentation icon
      default: return '📄';
    }
  }

  getFileName(fileUrl: string): string {
    if (!fileUrl) return 'Unknown File';

    try {
      const url = new URL(fileUrl);
      let fileNameWithQuery = url.pathname.split('/').pop();

      if (!fileNameWithQuery) {
        return 'Unknown File';
      }

      // Remove any query parameters
      let cleanedFileName = fileNameWithQuery.split('?')[0];

      // Replace '+' with spaces, as this encoding might come from storage paths
      cleanedFileName = cleanedFileName.replace(/\+/g, ' ');

      // --- Start of fix for URIError ---
      try {
        // Attempt to decode URI components. This is where the error occurs.
        cleanedFileName = decodeURIComponent(cleanedFileName);
      } catch (e) {
        console.warn(`URIError: Could not decode "${cleanedFileName}". Returning as is.`, e);
        // If decodeURIComponent fails, return the string as it was before this step.
        // This prevents the application from crashing.
      }
      // --- End of fix ---

      // Optional: Attempt to remove Firebase Storage's timestamp/UUID suffix
      // This heuristic checks for a 13-digit timestamp (e.g., 1678901234567)
      // followed by an underscore and then potentially another part (e.g., uniqueID.pdf)
      const parts = cleanedFileName.split('_');
      // Check if the second-to-last part is a 13-digit number (timestamp)
      if (parts.length >= 2 && /^\d{13}$/.test(parts[parts.length - 2])) {
        // If it matches the pattern 'name_timestamp_uniqueId.extension'
        // Remove the last two parts (uniqueId and timestamp)
        parts.splice(parts.length - 2, 2);
        return parts.join('_') || cleanedFileName; // Fallback to original if splicing makes it empty
      }

      return cleanedFileName || 'Unknown File';

    } catch (e) {
      console.error('Error in getFileName (URL parsing or unexpected issue):', e);
      // Fallback if the URL constructor itself fails (e.g., if fileUrl is severely malformed)
      // In this case, just try the simple string manipulation without any URI decoding
      const simpleSplitName = fileUrl.split('/').pop()?.split('?')[0];
      return simpleSplitName ? simpleSplitName.replace(/\+/g, ' ') : 'Unknown File';
    }
  }

  // No longer navigates, just toggles the form
  addNewNote(): void {
    this.toggleUploadForm();
  }

  ngOnDestroy(): void {
    if (this.authStateSubscription) {
      this.authStateSubscription.unsubscribe();
    }
    if (this.notesSubscription) {
      this.notesSubscription(); // Unsubscribe the onSnapshot listener
    }
  }
}
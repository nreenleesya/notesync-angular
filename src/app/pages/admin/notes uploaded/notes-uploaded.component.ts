// src/app/pages/admin/notes uploaded/notes-uploaded.component.ts

import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Auth, user, User as FirebaseUser, onAuthStateChanged } from '@angular/fire/auth';
// FIX 3: Add addDoc and getDocs to imports
import { Firestore, collection, query, where, onSnapshot, doc, getDoc, getDocs, Timestamp, updateDoc, deleteDoc, QuerySnapshot, DocumentData, addDoc } from '@angular/fire/firestore';
import { Storage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from '@angular/fire/storage';
import { Observable, Subscription, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { NgIf, NgFor, DatePipe, DecimalPipe } from '@angular/common';

// Define your Note interface (make sure uploadedAt and updatedAt are Date | null)
interface Note {
  _id: string;
  title: string;
  subject: string;
  description: string;
  price: number;
  fileUrl: string;
  tags: string[];
  contributorId: string;
  uploadedAt: Date | null;
  updatedAt: Date | null;
  salesCount: number;
}

@Component({
  selector: 'app-notes-uploaded',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIf, NgFor, DatePipe, DecimalPipe],
  templateUrl: './notes-uploaded.component.html',
  styleUrls: ['./notes-uploaded.component.css']
})
export class NotesUploadedComponent implements OnInit, OnDestroy {
  private auth: Auth = inject(Auth);
  private firestore: Firestore = inject(Firestore);
  private storage: Storage = inject(Storage);

  currentUserUid: string | null = null;
  authStateSubscription: Subscription | null = null;
  notesSubscription: (() => void) | null = null;

  // For Note List Display
  notes: Note[] = [];
  isLoadingList: boolean = true;
  errorMessageList: string | null = null;

  // For Note Upload Form
  showUploadForm: boolean = false;
  noteTitle: string = '';
  noteSubject: string = '';
  noteDescription: string = '';
  notePrice: number = 0;
  noteTags: string = '';
  selectedFile: File | null = null;
  uploadProgress: number = 0;
  isLoadingUpload: boolean = false;
  uploadSuccessMessage: string | null = null;
  uploadErrorMessage: string | null = null;


  ngOnInit(): void {
    console.log('NotesUploadedComponent: Initializing...');
    this.authStateSubscription = new Observable<FirebaseUser | null>(observer => {
      onAuthStateChanged(this.auth, user => {
        observer.next(user);
      });
    }).pipe(
      switchMap(user => {
        if (user && user.uid) {
          this.currentUserUid = user.uid;
          console.log('NotesUploadedComponent: User logged in. UID:', this.currentUserUid);
          this.fetchNotes(user.uid);
          return of([]);
        } else {
          this.errorMessageList = 'You must be logged in to view your uploaded notes.';
          this.isLoadingList = false;
          this.notes = [];
          this.currentUserUid = null;
          console.log('NotesUploadedComponent: No user logged in or user logged out.');
          return of([]);
        }
      })
    ).subscribe({
      next: () => {
        console.log('NotesUploadedComponent: Auth state observable next triggered.');
      },
      error: (err) => {
        console.error('NotesUploadedComponent: Error in auth state or notes fetching pipeline:', err);
        this.errorMessageList = 'An error occurred while loading your notes.';
        this.isLoadingList = false;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.authStateSubscription) {
      this.authStateSubscription.unsubscribe();
    }
    if (this.notesSubscription) {
      this.notesSubscription();
    }
  }

  private fetchNotes(contributorId: string): void {
    console.log('NotesUploadedComponent: fetchNotes called for contributorId:', contributorId);
    this.isLoadingList = true;
    this.errorMessageList = null;
    this.notes = [];

    if (this.notesSubscription) {
      this.notesSubscription();
    }

    const notesCollectionRef = collection(this.firestore, 'notes');
    const q = query(notesCollectionRef, where('contributorId', '==', contributorId));

    this.notesSubscription = onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
      const fetchedNotes: Note[] = [];
      snapshot.forEach(doc => {
        const noteData = doc.data();
        fetchedNotes.push({
          _id: doc.id,
          title: noteData['title'],
          subject: noteData['subject'],
          description: noteData['description'],
          price: noteData['price'],
          fileUrl: noteData['fileUrl'],
          tags: noteData['tags'] || [],
          contributorId: noteData['contributorId'],
          uploadedAt: noteData['uploadedAt'] ? (noteData['uploadedAt'] as Timestamp).toDate() : null,
          updatedAt: noteData['updatedAt'] ? (noteData['updatedAt'] as Timestamp).toDate() : null,
          salesCount: noteData['salesCount'] || 0
        } as Note);
      });
      this.notes = fetchedNotes;
      this.isLoadingList = false;
      console.log('NotesUploadedComponent: Firestore snapshot received. Notes count:', this.notes.length);
      if (this.notes.length === 0) {
        this.errorMessageList = 'You have not uploaded any notes yet.';
        console.log('NotesUploadedComponent: No notes found for this user.');
      } else {
        this.errorMessageList = null;
        console.log('NotesUploadedComponent: Notes loaded successfully:', this.notes);
      }
    }, (error) => {
      console.error('NotesUploadedComponent: Error fetching notes from Firestore:', error);
      this.errorMessageList = 'Failed to load notes. Please try again.';
      this.isLoadingList = false;
    });
  }

  convertTimestampToDate(value: Date | Timestamp | null): Date | null {
    if (value instanceof Timestamp) {
      return value.toDate();
    }
    return value;
  }

  addNewNote(): void {
    this.showUploadForm = !this.showUploadForm;
    // Reset form fields when opening
    if (this.showUploadForm) {
      this.noteTitle = '';
      this.noteSubject = '';
      this.noteDescription = '';
      this.notePrice = 0;
      this.noteTags = '';
      this.selectedFile = null;
      this.uploadProgress = 0;
      this.isLoadingUpload = false;
      this.uploadSuccessMessage = null;
      this.uploadErrorMessage = null;
    }
  }

  onCancelUpload(): void {
    this.showUploadForm = false;
    // Clear any messages or progress
    this.uploadSuccessMessage = null;
    this.uploadErrorMessage = null;
    this.uploadProgress = 0;
    this.isLoadingUpload = false;
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file && (file.type === 'application/pdf' || file.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation')) {
      this.selectedFile = file;
      this.uploadErrorMessage = null;
    } else {
      this.selectedFile = null;
      this.uploadErrorMessage = 'Please select a valid PDF or PPTX file.';
    }
  }

  async onSubmitUpload(): Promise<void> {
    if (!this.selectedFile || !this.currentUserUid) {
      this.uploadErrorMessage = 'Please select a file and ensure you are logged in.';
      return;
    }

    this.isLoadingUpload = true;
    this.uploadSuccessMessage = null;
    this.uploadErrorMessage = null;

    try {
      const storageRef = ref(this.storage, `notes/${this.currentUserUid}/${this.selectedFile.name}`);
      const uploadTask = uploadBytesResumable(storageRef, this.selectedFile);

      uploadTask.on('state_changed',
        (snapshot) => {
          this.uploadProgress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        },
        (error) => {
          console.error('Upload failed', error);
          this.uploadErrorMessage = 'File upload failed: ' + error.message;
          this.isLoadingUpload = false;
          this.uploadProgress = 0;
        },
        async () => {
          const fileUrl = await getDownloadURL(uploadTask.snapshot.ref);
          const notesCollection = collection(this.firestore, 'notes');

          // FIX 1: Change getDoc to getDocs for query
          const q = query(notesCollection, where('contributorId', '==', this.currentUserUid), where('fileUrl', '==', fileUrl));
          const querySnapshot = await getDocs(q); // Corrected to getDocs

          let noteExists = false;
          if (!querySnapshot.empty) { // Check if any documents were returned
            noteExists = true;
          }

          if (noteExists) {
            this.uploadErrorMessage = 'A note with this file already exists for your account.';
            this.isLoadingUpload = false;
            this.uploadProgress = 0;
            return;
          }

          const newNote = {
            title: this.noteTitle,
            subject: this.noteSubject,
            description: this.noteDescription,
            price: this.notePrice,
            fileUrl: fileUrl,
            tags: this.noteTags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
            contributorId: this.currentUserUid,
            uploadedAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
            salesCount: 0
          };

          // FIX 3: addDoc is now imported and correctly used
          await addDoc(notesCollection, newNote);

          this.uploadSuccessMessage = 'Note uploaded successfully!';
          this.isLoadingUpload = false;
          this.uploadProgress = 0;
          this.showUploadForm = false; // Hide form after successful upload
          // FIX 4: Use non-null assertion as currentUserUid is checked above
          this.fetchNotes(this.currentUserUid!);
        }
      );
    } catch (error: any) {
      console.error('Error uploading note:', error);
      this.uploadErrorMessage = 'Error uploading note: ' + error.message;
      this.isLoadingUpload = false;
      this.uploadProgress = 0;
    }
  }


  // Helper to get file icon based on extension
  getFileIcon(fileUrl: string): string {
    const fileName = this.getFileName(fileUrl);
    if (fileName.toLowerCase().endsWith('.pdf')) {
      return '📄';
    } else if (fileName.toLowerCase().endsWith('.pptx')) {
      return '📊';
    }
    return '📁';
  }

  getFileName(fileUrl: string): string {
    try {
      const url = new URL(fileUrl);
      const path = url.pathname;
      const lastSlashIndex = path.lastIndexOf('/');
      const fileNameWithQuery = lastSlashIndex !== -1 ? path.substring(lastSlashIndex + 1) : path;
      const questionMarkIndex = fileNameWithQuery.indexOf('?');
      return questionMarkIndex !== -1 ? fileNameWithQuery.substring(0, questionMarkIndex) : fileNameWithQuery;
    } catch (e) {
      console.error('Error parsing file URL:', e);
      return fileUrl;
    }
  }
}
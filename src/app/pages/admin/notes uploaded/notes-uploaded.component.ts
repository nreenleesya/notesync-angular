// src/app/pages/admin/notes uploaded/notes-uploaded.component.ts

import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Auth, onAuthStateChanged, User as FirebaseUser } from '@angular/fire/auth';
import { Firestore, collection, query, where, onSnapshot, DocumentData, QuerySnapshot } from '@angular/fire/firestore';
import { Subscription, Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';


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
  uploadedAt: Date;
  updatedAt: Date;
  salesCount: number;
}

@Component({
  selector: 'app-notes-uploaded',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notes-uploaded.component.html',
  styleUrls: ['./notes-uploaded.component.css']
})
export class NotesUploadedComponent implements OnInit, OnDestroy {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private router = inject(Router);

  notes: Note[] = [];
  isLoading: boolean = true;
  errorMessage: string | null = null;
  private authStateSubscription: Subscription | undefined;
  private notesSubscription: (() => void | undefined) | undefined;

  currentUserUid: string | null = null;

  ngOnInit(): void {
    this.authStateSubscription = new Observable<FirebaseUser | null>(observer => {
      onAuthStateChanged(this.auth, user => {
        observer.next(user);
      });
    }).pipe(
      switchMap(user => {
        if (user && user.uid) {
          this.currentUserUid = user.uid;
          return this.fetchNotes(user.uid);
        } else {
          this.errorMessage = 'You must be logged in to view your uploaded notes.';
          this.isLoading = false;
          this.notes = [];
          return of([]);
        }
      })
    ).subscribe({
      next: () => {
        // Data is handled within fetchNotes and onSnapshot
      },
      error: (err) => {
        console.error('Error in auth state or notes fetching:', err);
        this.errorMessage = 'An error occurred while loading your notes.';
        this.isLoading = false;
      }
    });
  }

  private fetchNotes(contributorId: string): Observable<Note[]> {
    this.isLoading = true;
    this.errorMessage = null;
    this.notes = [];

    const notesCollectionRef = collection(this.firestore, 'notes');
    const q = query(notesCollectionRef, where('contributorId', '==', contributorId));

    this.notesSubscription = onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
      this.notes = [];
      snapshot.forEach(doc => {
        const noteData = doc.data();
        // Convert Firestore Timestamp to JavaScript Date objects if they exist
        const uploadedAtDate = noteData['uploadedAt'] ? noteData['uploadedAt'].toDate() : null;
        const updatedAtDate = noteData['updatedAt'] ? noteData['updatedAt'].toDate() : null;

        this.notes.push({
          _id: doc.id, // This will correctly map Firestore doc.id to your _id
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
      this.isLoading = false;
      if (this.notes.length === 0) {
        this.errorMessage = 'You have not uploaded any notes yet.';
      }
    }, (error) => {
      console.error('Error fetching notes:', error);
      this.errorMessage = 'Failed to load notes. Please try again.';
      this.isLoading = false;
    });

    return of(this.notes);
  }

  // Helper function to get file type icon
  getFileIcon(fileUrl: string): string {
    if (!fileUrl) return '📄'; // Default generic file icon

    const extension = fileUrl.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf': return '📄'; // PDF icon
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif': return '🖼️'; // Image icon
      case 'mp4':
      case 'mov':
      case 'avi': return '🎬'; // Video icon
      case 'doc':
      case 'docx': return '📝'; // Word document icon
      case 'xls':
      case 'xlsx': return '📊'; // Excel icon
      case 'ppt':
      case 'pptx': return ' présentation'; // PowerPoint icon
      default: return '📄'; // Default generic file icon
    }
  }

  // Helper function to get the file name from the URL
  getFileName(fileUrl: string): string {
    if (!fileUrl) return 'Unknown File';
    try {
      const url = new URL(fileUrl);
      const pathSegments = url.pathname.split('/');
      const lastSegment = pathSegments[pathSegments.length - 1];
      // Attempt to remove timestamp and UID if present from Firebase Storage path
      const cleanedName = lastSegment.split('_').slice(0, -1).join('_'); // Remove last underscore part (timestamp)
      return cleanedName.replace(/%20/g, ' ') || lastSegment.replace(/%20/g, ' '); // Decode spaces and fallback
    } catch (e) {
      return fileUrl.split('/').pop()?.split('?')[0].replace(/%20/g, ' ') || 'Unknown File';
    }
  }


  addNewNote(): void {
    this.router.navigate(['/dashboard/upload-note']);
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
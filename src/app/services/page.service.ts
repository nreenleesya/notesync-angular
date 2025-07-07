// src/app/services/page.service.ts

import { inject, Injectable } from '@angular/core';
import {
  Auth,
  authState, // Used for the user$ observable for real-time user state
  signInWithPopup,
  signOut,
  // Removed GoogleAuthProvider from here
  // Removed User from here
} from '@angular/fire/auth';
import {
  GoogleAuthProvider, // <-- Corrected: Import GoogleAuthProvider from 'firebase/auth'
  User,               // <-- Corrected: Import User type from 'firebase/auth'
} from 'firebase/auth'; // <-- Source for GoogleAuthProvider and User type
import {
  map,
  switchMap,
  firstValueFrom, // Utility to convert an Observable to a Promise, taking its first value
  filter, // RxJS operator to filter emissions from an Observable
  Observable, // Base type for reactive streams
  Subscription, // For managing subscriptions to prevent memory leaks
} from 'rxjs';
import {
  doc, // Creates a DocumentReference
  docData, // Returns an Observable of a document's data
  DocumentReference, // Type for a reference to a Firestore document
  Firestore, // Firebase Firestore service instance
  getDoc, // Fetches a single document
  setDoc, // Sets data to a document, overwriting if it exists
  updateDoc, // Updates data in a document
  collection, // Creates a CollectionReference
  addDoc, // Adds a new document to a collection with an auto-generated ID
  deleteDoc, // Deletes a document
  collectionData, // Returns an Observable of a collection's data
  Timestamp, // Firestore timestamp type
  serverTimestamp, // Special value for a timestamp set by the Firestore server
  query, // Creates a Firestore query
  orderBy, // Query constraint to order results
  limit, // Query constraint to limit the number of results
  onSnapshot, // Real-time listener for document/query changes
  DocumentData, // Generic type for Firestore document data
  FieldValue, // Type for Firestore field values (like serverTimestamp)
} from '@angular/fire/firestore';
import {
  Storage, // Firebase Storage service instance
  getDownloadURL, // Gets a public download URL for a file
  ref, // Creates a StorageReference
  uploadBytesResumable, // Uploads a file with resumable capabilities
} from '@angular/fire/storage';
import { getToken, Messaging, onMessage } from '@angular/fire/messaging'; // Firebase Cloud Messaging (FCM)
import { Router } from '@angular/router'; // Angular Router for navigation

/**
 * Type definition for a chat message object to be stored in Firestore.
 * Fields like `text` and `imageUrl` are optional for different message types.
 */
type ChatMessage = {
  name: string | null; // Display name of the user who sent the message
  profilePicUrl: string | null; // URL of the user's profile picture
  timestamp: FieldValue; // Server timestamp for when the message was created
  uid: string | null; // User ID of the sender
  text?: string; // Optional: Text content of the message
  imageUrl?: string; // Optional: URL of an image attached to the message
};

@Injectable({
  providedIn: 'root', // This makes PageService a singleton instance available application-wide
})
export class PageService {
  updateAuthProfile(currentUser: User, arg1: { displayName: string; email: string; }) {
    throw new Error('Method not implemented.');
  }
  // Inject Firebase services using Angular's `inject` function for standalone components.
  // This automatically provides the service instances that were configured in `app.config.ts`.
  firestore: Firestore = inject(Firestore);
  auth: Auth = inject(Auth);
  storage: Storage = inject(Storage);
  messaging: Messaging = inject(Messaging); // FCM instance
  router: Router = inject(Router); // Angular Router

  private provider = new GoogleAuthProvider(); // Instance of GoogleAuthProvider for pop-up sign-in.
  LOADING_IMAGE_URL = 'https://www.google.com/images/spin-32.gif?a'; // URL for a loading GIF/placeholder.

  // Observable stream representing the current user's authentication state.
  // `authState(this.auth)` emits the current Firebase User object (or null if signed out)
  // whenever the authentication state changes.
  public user$: Observable<User | null> = authState(this.auth);

  // A local variable to hold the current user's snapshot.
  // This is kept in sync by a subscription to `user$`.
  currentUser: User | null = null;
  private userSubscription: Subscription; // To manage the subscription to `user$`

  constructor() {
    // Subscribe to `user$` to keep `currentUser` updated in real-time.
    // This allows methods like `addMessage` to reliably access the current user.
    this.userSubscription = this.user$.subscribe((aUser: User | null) => {
      this.currentUser = aUser;
      if (aUser) {
        console.log('ChatService: User state updated - logged in:', aUser.uid);
        // Optional: Request notification permissions immediately after a user logs in
        // this.requestNotificationsPermissions();
      } else {
        console.log('ChatService: User state updated - logged out.');
      }
    });

    // Set up a listener for incoming Firebase Cloud Messages when the app is in the foreground.
    // This will log the payload and can be extended to display in-app notifications.
    onMessage(this.messaging, (payload) => {
      console.log('Message received. ', payload);
      // Example: Display a simple browser notification (requires permission)
      // if (payload.notification) {
      //   new Notification(payload.notification.title || 'New Message', {
      //     body: payload.notification.body,
      //     icon: payload.notification.icon,
      //   });
      // }
    });
  }

  /**
   * Initiates the Google Sign-In process using a pop-up window.
   * On successful authentication, it navigates the user to the '/chat' route.
   * @returns A Promise that resolves when the sign-in process completes (success or failure).
   */
  async login(): Promise<void> {
    try {
      // Calls Firebase's `signInWithPopup` method with the GoogleAuthProvider.
      const result = await signInWithPopup(this.auth, this.provider);
      // Retrieve the credential from the result (optional, useful for linking accounts).
      const credential = GoogleAuthProvider.credentialFromResult(result);
      console.log('Google Sign-In successful for user:', result.user.uid);

      // Navigate to the chat page upon successful login.
      // The `LoginPageComponent` also has a subscription to `user$` for navigation,
      // so this `router.navigate` might be redundant or act as a fallback.
      this.router.navigate(['/', 'chat']);
      // If needed, you could return the credential or user object to the calling component.
      // return credential;
    } catch (error: any) {
      console.error('Error during Google sign-in:', error);
      // Provide more specific error handling based on Firebase auth error codes.
      if (error.code === 'auth/popup-closed-by-user') {
        console.warn('Google sign-in popup was closed by the user.');
      } else if (error.code === 'auth/cancelled-popup-request') {
        console.warn('Multiple pop-up requests detected, possibly from rapid clicks.');
      }
      // Re-throw the error so that the calling component (LoginPageComponent) can handle it
      // and display messages to the user if necessary.
      throw error;
    }
  }

  /**
   * Logs out the currently authenticated user from Firebase.
   * On successful logout, it navigates the user back to the '/login' route.
   * @returns A Promise that resolves when the sign-out process completes.
   */
  async logout(): Promise<void> {
    try {
      await signOut(this.auth); // Calls Firebase's `signOut` method.
      console.log('User signed out successfully.');
      this.router.navigate(['/', 'login']); // Navigate to login page after logout.
    } catch (error) {
      console.error('Sign out error:', error);
      // Re-throw the error for component-level handling.
      throw error;
    }
  }

  /**
   * Adds a new chat message (text or image) to the 'messages' collection in Cloud Firestore.
   * Requires an authenticated user.
   * @param textMessage The optional text content of the message.
   * @param imageUrl The optional URL of an image associated with the message.
   * @returns A Promise that resolves with the DocumentReference of the newly added message,
   * or `void` if the message is empty or no user is signed in.
   */
  addMessage = async (
    textMessage: string | null,
    imageUrl: string | null
  ): Promise<void | DocumentReference<DocumentData>> => {
    // Basic validation: ignore messages without text or image.
    if (!textMessage && !imageUrl) {
      console.warn('addMessage was called without any content (text or image).');
      return;
    }

    // Ensure a user is authenticated before attempting to add a message.
    // `firstValueFrom` combined with `filter` ensures we wait for `user$` to emit a non-null user.
    let userForMessage: User | null = null;
    try {
      userForMessage = await firstValueFrom(
        this.user$.pipe(filter((user): user is User => user !== null))
      );
    } catch (error) {
      console.error('addMessage failed: No authenticated user found.', error);
      // This catch block handles cases where the observable completes without emitting a non-null user.
      return;
    }

    // If `userForMessage` is still null, it means no user is currently authenticated.
    if (!userForMessage) {
      console.error('addMessage requires a signed-in user, but none was available after waiting.');
      // You might want to redirect the user to the login page here or show a specific error.
      return;
    }

    // Construct the ChatMessage object using the authenticated user's details.
    const message: ChatMessage = {
      name: userForMessage.displayName,
      profilePicUrl: userForMessage.photoURL,
      timestamp: serverTimestamp(), // Use Firestore's server timestamp for consistency and ordering
      uid: userForMessage.uid,
    };

    // Conditionally add `text` or `imageUrl` properties if they exist.
    textMessage && (message.text = textMessage);
    imageUrl && (message.imageUrl = imageUrl);

    try {
      // Add the message object to the 'messages' collection in Firestore.
      const newMessageRef = await addDoc(
        collection(this.firestore, 'messages'),
        message
      );
      console.log('Message successfully added to Firestore with ID:', newMessageRef.id);
      return newMessageRef; // Return the reference to the newly created document.
    } catch (error) {
      console.error('Error writing new message to Firebase Database:', error);
      // Depending on the error, you might want to show a user-friendly message.
      return;
    }
  };

  /**
   * Saves a new text message to Cloud Firestore by calling `addMessage`.
   * @param messageText The text content of the message.
   * @returns A Promise that resolves to the DocumentReference of the new message, or void.
   */
  saveTextMessage = async (messageText: string): Promise<void | DocumentReference<DocumentData>> => {
    return this.addMessage(messageText, null);
  };

  /**
   * Loads chat message history and listens for upcoming messages in real-time.
   * The query fetches the last 12 messages, ordered by timestamp in descending order.
   * @returns An Observable that emits an array of DocumentData (chat messages) whenever the collection changes.
   */
  loadMessages = (): Observable<DocumentData[]> => {
    // Create a Firestore query: target the 'messages' collection, order by timestamp (descending), limit to 12.
    const recentMessagesQuery = query(
      collection(this.firestore, 'messages'),
      orderBy('timestamp', 'desc'), // Order by latest messages first
      limit(12) // Retrieve only the most recent 12 messages
    );
    // Use `collectionData` from `@angular/fire/firestore` to get an Observable
    // that automatically updates whenever the query results change in Firestore.
    return collectionData(recentMessagesQuery, { idField: 'id' }); // 'idField' adds the Firestore doc ID to each object
  };

  /**
   * Saves a new message containing an image to Firestore and uploads the image file to Firebase Storage.
   * A loading placeholder message is added first, then updated with the actual image URL after upload.
   * @param file The image file to be uploaded.
   * @returns A Promise that resolves when the operation is complete.
   */
  saveImageMessage = async (file: File): Promise<void> => {
    // Ensure a user is authenticated before attempting to save an image.
    if (!this.currentUser) {
      console.error('Cannot save image: No user signed in.');
      // You might want to redirect to login or display an error to the user.
      return;
    }

    try {
      // 1. Add a placeholder message with a loading icon.
      const messageRef = await this.addMessage(null, this.LOADING_IMAGE_URL);

      // Check if the placeholder message was successfully created.
      if (!messageRef) {
        console.error('Failed to create message placeholder for image upload.');
        return;
      }

      // 2. Define the path for the image in Firebase Storage.
      // Format: `users_uid/file_name` (e.g., `abc123xyz/my_photo.jpg`).
      const filePath = `${this.currentUser.uid}/${file.name}`;
      const newImageRef = ref(this.storage, filePath); // Create a storage reference.

      // 3. Upload the image file to Cloud Storage.
      const fileSnapshot = await uploadBytesResumable(newImageRef, file);
      console.log('Image uploaded to Storage:', fileSnapshot.metadata.fullPath);

      // 4. Get the public download URL for the uploaded image.
      const publicImageUrl = await getDownloadURL(newImageRef);
      console.log('Public image URL:', publicImageUrl);

      // 5. Update the placeholder message in Firestore with the actual image URL and storage path.
      await updateDoc(messageRef, {
        imageUrl: publicImageUrl,
        storageUri: fileSnapshot.metadata.fullPath, // Store the full path for auditing/deletion.
      });
      console.log('Message updated with image URL.');
    } catch (error) {
      console.error('There was an error uploading an image file to Cloud Storage:', error);
      // Provide user-friendly feedback on upload failure.
    }
  };

  // --- Generic Firestore Data Manipulation Methods (Optional, but useful) ---

  /**
   * Updates an existing document in Firestore.
   * @param path The Firestore path to the document (e.g., 'users/user123').
   * @param data The data to update in the document.
   * @returns A Promise that resolves when the update is complete.
   */
  async updateData(path: string, data: any): Promise<void> {
    try {
      const docRef = doc(this.firestore, path);
      await updateDoc(docRef, data);
      console.log(`Document at ${path} updated successfully.`);
    } catch (error) {
      console.error(`Error updating document at ${path}:`, error);
      throw error; // Re-throw for handling by calling code.
    }
  }

  /**
   * Deletes a document from Firestore.
   * @param path The Firestore path to the document to delete.
   * @returns A Promise that resolves when the deletion is complete.
   */
  async deleteData(path: string): Promise<void> {
    try {
      const docRef = doc(this.firestore, path);
      await deleteDoc(docRef);
      console.log(`Document at ${path} deleted successfully.`);
    } catch (error) {
      console.error(`Error deleting document at ${path}:`, error);
      throw error; // Re-throw for handling by calling code.
    }
  }

  /**
   * Fetches a single document's data from Firestore in real-time.
   * @param path The Firestore path to the document.
   * @returns An Observable that emits the document's data (or undefined if not found).
   */
  getDocData(path: string): Observable<DocumentData | undefined> {
    const docRef = doc(this.firestore, path);
    return docData(docRef);
  }

  /**
   * Fetches data from a Firestore collection in real-time.
   * @param path The Firestore path to the collection.
   * @param queryConstraints Optional: An array of Firestore query constraints (e.g., `where`, `orderBy`, `limit`).
   * @returns An Observable that emits an array of DocumentData.
   */
  getCollectionData(path: string, queryConstraints: any[] = []): Observable<DocumentData[]> {
    const collectionRef = collection(this.firestore, path);
    const q = query(collectionRef, ...queryConstraints); // Apply any provided query constraints.
    return collectionData(q, { idField: 'id' }); // Also add the document ID to each object.
  }

  /**
   * General purpose method to upload a file to Firebase Storage.
   * @param path The desired path in Firebase Storage (e.g., 'uploads/my_file.pdf').
   * @param file The file object to upload.
   * @param contentType The MIME type of the file (e.g., 'image/jpeg', 'application/pdf').
   * @returns A Promise that resolves with the download URL of the uploaded file, or null on error.
   * NOTE: This method is a more general version; `saveImageMessage` is tailored for chat images.
   */
  async uploadToStorage(path: string, file: File, contentType: string): Promise<string | null> {
    try {
      const storageRef = ref(this.storage, path);
      // Use `uploadBytesResumable` for larger files to enable pause/resume (though not implemented here).
      const uploadTask = uploadBytesResumable(storageRef, file, { contentType });
      await uploadTask; // Wait for the upload to complete.
      const downloadURL = await getDownloadURL(storageRef); // Get the public URL.
      console.log('File uploaded to storage:', downloadURL);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading file to storage:', error);
      return null;
    }
  }
    async addDocToCollection(collectionPath: string, data: DocumentData): Promise<DocumentReference<DocumentData>> {
    try {
      const docRef = await addDoc(collection(this.firestore, collectionPath), data);
      console.log(`Document added to ${collectionPath} with ID:`, docRef.id);
      return docRef;
    } catch (error) {
      console.error(`Error adding document to collection ${collectionPath}:`, error);
      throw error; // Re-throw for handling in the component
    }
  }

  // --- Firebase Cloud Messaging (FCM) related methods ---

  /**
   * Requests permission from the user to display browser notifications.
   * If permission is granted, it calls `saveMessagingDeviceToken` to get and save the FCM token.
   * @returns A Promise that resolves when the permission request and token saving are complete.
   */
  requestNotificationsPermissions = async (): Promise<void> => {
    // Check if the browser supports the Notification API.
    if ('Notification' in window) {
      // Request permission from the user.
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        console.log('Notification permission granted.');
        await this.saveMessagingDeviceToken(); // Save the device token if permission is granted.
      } else {
        console.warn('Notification permission denied.');
      }
    } else {
      console.warn('This browser does not support web notifications.');
    }
  };

  /**
   * Retrieves the Firebase Cloud Messaging (FCM) device registration token.
   * This token is unique to the device and can be used to send targeted notifications.
   * The token is then optionally saved to Firestore.
   * Requires a VAPID key configured in your Firebase project.
   * @returns A Promise that resolves when the token is retrieved and/or saved.
   */
  saveMessagingDeviceToken = async (): Promise<void> => {
    try {
      // Get the FCM registration token for the current device.
      // IMPORTANT: Replace 'YOUR_PUBLIC_VAPID_KEY_HERE' with your actual public VAPID key.
      // Find this key in your Firebase Console: Project settings > Cloud Messaging > Web configuration > Certificates.
      const currentToken = await getToken(this.messaging, {
        vapidKey: 'YOUR_PUBLIC_VAPID_KEY_HERE', // <<<--- REMEMBER TO REPLACE THIS
      });

      if (currentToken) {
        console.log('FCM Registration Token obtained:', currentToken);
        // TODO: Implement logic to save this token to your Firestore database.
        // A common practice is to store tokens in a subcollection under the user's document
        // to manage multiple devices per user, e.g., `users/{uid}/fcmTokens/{token_id}`.
        // This requires appropriate Firestore security rules for write access.
        /*
        if (this.currentUser) {
          await setDoc(doc(this.firestore, `users/${this.currentUser.uid}/fcmTokens`, currentToken), {
            token: currentToken,
            timestamp: serverTimestamp(),
            // Add any other relevant device info like user agent, etc.
          });
          console.log('FCM token saved to Firestore for user:', this.currentUser.uid);
        }
        */
      } else {
        console.warn('No FCM registration token available. User permission may not have been granted, or browser is not supported.');
      }
    } catch (err) {
      console.error('An error occurred while retrieving or saving FCM token: ', err);
    }
  };

  // --- Lifecycle Hook for Cleanup ---
  // Note: While ChatService is `providedIn: 'root'`, it's good practice for any service
  // that holds subscriptions to manage their cleanup if they were created manually
  // and the service lifecycle could be tied to a specific component's destruction (less common for root services).
  // For `userSubscription`, it runs for the lifetime of the application, so explicit `ngOnDestroy`
  // on the service itself isn't strictly necessary unless you have other dynamic subscriptions.
  // However, I've kept the pattern in LoginPageComponent.
  // If you had a component that conditionally injected ChatService, then it would be important.
}
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-notesale', // This is the tag used to embed the component in other templates
  templateUrl: './landing-page.html', // Points to your HTML structure
  styleUrls: ['./landing-page.css'] // Points to component-specific styles (if any)
})
export class LandingPageComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    // Initialization logic for the component goes here.
    // For a static landing page, you might not need much here.
    console.log('LandingPageComponent initialized!');
  }

  // You can add methods here for any interactive elements on your landing page
  // For example, if you have a "Sell Your Notes" button that triggers an Angular function:
  onSellNotesClick(): void {
    console.log('Sell Notes button clicked!');
    // Implement navigation or other logic here
    // Example: this.router.navigate(['/sell']);
  }
}

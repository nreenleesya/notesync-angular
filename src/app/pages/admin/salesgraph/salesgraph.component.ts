import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-sales-graph',
  templateUrl: './sales.html',
  styleUrls: ['./sales.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class SalesGraphComponent implements OnInit {

  todayDate: string; // To hold today's date in 'YYYY-MM-DD' format
  startDate: string; // To hold the selected start date
  endDate: string; // To hold the selected end date

  constructor() {
    const today = new Date();
    this.todayDate = this.formatDate(today);

    // Initialize start and end dates to today's date
    // This ensures both calendars initially show and restrict to today.
    this.startDate = this.todayDate;
    this.endDate = this.todayDate;
  }

  ngOnInit() {
    // This part ensures that if initial values were somehow problematic, they are rectified.
    if (this.startDate > this.todayDate) {
        this.startDate = this.todayDate;
    }
    if (this.endDate > this.todayDate) { // Ensure endDate is also not in the future
        this.endDate = this.todayDate;
    }
    if (this.endDate < this.startDate) {
        this.endDate = this.startDate;
    }
  }

  // Helper function to format date to YYYY-MM-DD
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2); // Months are 0-indexed
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  onStartDateChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.startDate = inputElement.value;
    // When start date changes, ensure end date is not before it
    if (this.endDate < this.startDate) {
      this.endDate = this.startDate;
    }
  }

  onEndDateChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.endDate = inputElement.value;
    // No specific logic needed here beyond updating, as [min] and [max] handle most validation.
    // If you need custom error messages, this is where you'd add them.
  }

  generateChart(): void {
    console.log('Generating chart from:', this.startDate, 'to:', this.endDate);
  }
}
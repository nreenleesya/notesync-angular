import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';

@Component({
  selector: 'app-sales-graph',
  templateUrl: './sales.html',
  styleUrls: ['./sales.css'],
  standalone: true,
  imports: [CommonModule],
})
export class SalesGraphComponent {
  // You can inject services or use other Angular features here if needed
  // For example, if you have a service to fetch sales data, you can inject it here
  // private salesService: SalesService = inject(SalesService);

  constructor() {
    // Initialization logic can go here
  }

  // You can define methods to handle user interactions or fetch data
  // For example:
  // fetchSalesData() {
  //   this.salesService.getSalesData().subscribe(data => {
  //     // Handle the fetched data
  //   });
  // }
}

import { Component } from '@angular/core';
import { Router } from '@angular/router'; // Import Router

@Component({
  selector: 'app-landing-page',
  templateUrl: './sales.html',
  styleUrls: ['./sales.css']
})
export class SalesGraphComponent {

  constructor(private router: Router) { } // Inject Router

}
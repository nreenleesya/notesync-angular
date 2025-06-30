import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LandingPageComponent } from './landing.component';

describe('LandingPageComponent', () => {
  let component: LandingPageComponent;
  let fixture: ComponentFixture<LandingPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LandingPageComponent ]
      // If your component uses other modules (e.g., Router, HttpClient),
      // you would import them here:
      // imports: [ RouterTestingModule, HttpClientTestingModule ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LandingPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // Triggers change detection and ngOnInit
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Example test: check if a specific element exists after rendering
  it('should have a main title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1.notesale-green')?.textContent).toContain('NOTESALE');
  });

  // Example test for a method call
  it('should call onSellNotesClick when button is clicked', () => {
    spyOn(component, 'onSellNotesClick'); // Spy on the method
    const compiled = fixture.nativeElement as HTMLElement;
    // --- FIX START ---
    // Cast the element to HTMLElement to access the click() method
    const button = compiled.querySelector('.green-button') as HTMLElement;
    // --- FIX END ---
    button?.click(); // Use optional chaining in case button is null
    expect(component.onSellNotesClick).toHaveBeenCalled();
  });
});

import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PreferencesService } from './services/preferences.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  title = 'my-app';

  constructor(private preferencesService: PreferencesService) {}
}
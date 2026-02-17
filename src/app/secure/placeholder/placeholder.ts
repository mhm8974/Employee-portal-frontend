import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-placeholder',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="placeholder-container">
      <div class="placeholder-card">
        <div class="placeholder-icon"></div>
        <h2 class="placeholder-title">{{ pageTitle }}</h2>
      </div>
    </div>
  `,
  styles: [`
    .placeholder-container {
      padding: 60px 48px;
      max-width: 800px;
      margin: 0 auto;
      display: flex;
      justify-content: center;
    }
    .placeholder-card {
      text-align: center;
      padding: 60px 40px;
      background: #ffffff;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
      border: 1px solid #f1f5f9;
      border-radius: 12px;
      width: 100%;
    }
    .placeholder-icon {
      font-size: 48px;
      margin-bottom: 20px;
    }
    .placeholder-title {
      font-size: 24px;
      font-weight: 300;
      color: #000;
      margin: 0 0 12px 0;
      text-transform: uppercase;
      letter-spacing: 0.8px;
    }
    .placeholder-text {
      font-size: 14px;
      color: #888;
      margin: 0;
    }
  `]
})
export class PlaceholderComponent {
  pageTitle = '';

  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe(data => {
      this.pageTitle = data['title'] || 'Coming Soon';
    });
  }
}

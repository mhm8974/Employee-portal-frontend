import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class User {
  getUsers() {
    return ['Juvas', 'Alex', 'Riya'];
  }
}

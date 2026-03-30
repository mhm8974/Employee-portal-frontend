import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class ProfileComponent implements OnInit {
  // We use placeholder data to populate the extra details 
  // until a backend API delivers the full suite of data.
  employeeData = {
    name: 'Blah Blah',
    section: 'SECTION-A',
    dob: '15 - 05 - 1990',
    designation: 'Senior Software Engineer',
    appointmentDate: '02 - 05 - 2017',
    retirementDate: '30 - 01 - 2041',
    cpfNo: 'CPF-12345678',
    // Added Extra Details per User Request
    gender: 'Male',
    phone: '+91 98765 43210',
    email: 'employee@sikkim.gov.in',
    location: 'Secretariat, Gangtok'
  };

  constructor() { }

  ngOnInit(): void {
    // Attempt to load basic data from localStorage if available 
    // to make it dynamic.
    const storedData = localStorage.getItem('user_data');
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        if (parsed.full_name || parsed.first_name) {
          this.employeeData.name = parsed.full_name || `${parsed.first_name} ${parsed.last_name}`;
        }
        if (parsed.designation || parsed.position) {
          this.employeeData.designation = parsed.designation || parsed.position;
        }
        if (parsed.department || parsed.section) {
          this.employeeData.section = parsed.department || parsed.section;
        }
      } catch (e) {
        console.error('Error parsing stored user data', e);
      }
    }
  }

  getInitials(): string {
    if (!this.employeeData.name) return 'BB';
    const parts = this.employeeData.name.split(' ');
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  }
}

import { EmployeeData, PaySlipData } from './secure';

export const MOCK_EMPLOYEE: EmployeeData = {
    id: 1,
    employee_id: '20240101000001',
    first_name: 'Amit',
    last_name: 'Sharma',
    full_name: 'Amit Sharma',
    department: 'Engineering',
    position: 'Senior Software Engineer',
    email: 'amit.sharma@example.com',
    mobile: '9876543210',
    date_of_birth: '1990-05-15',
    status: 'active',
    hire_date: '2020-01-01'
};

export const MOCK_PAYSLIP: PaySlipData = {
    id: 101,
    employee_id: '20240101000001',
    year: 2024,
    month: 'January',
    pay_period: 'January 2024',
    basic_salary: 50000,
    house_rent_allowance: 20000,
    travel_allowance: 2000,
    medical_allowance: 1500,
    special_allowance: 5000,
    gross_salary: 78500,
    provident_fund: 1800,
    professional_tax: 200,
    income_tax: 2500,
    other_deductions: 0,
    total_deductions: 4500,
    net_salary: 74000,
    payment_date: '2024-01-31',
    status: 'Paid'
};

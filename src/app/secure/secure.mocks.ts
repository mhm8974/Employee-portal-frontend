import { EmployeeData, PaySlipData } from './profile-view/profile-view';

export const MOCK_EMPLOYEE: EmployeeData = {
    id: 1,
    employee_id: '20240101000001',
    first_name: 'Amit',
    last_name: 'Sharma',
    full_name: 'Amit Sharma',
    department: 'Engineering',
    section: 'SECTION-A',
    position: 'Senior Software Engineer',
    designation: 'Senior Software Engineer',
    email: 'amit.sharma@example.com',
    mobile: '9876543210',
    date_of_birth: '1990-05-15',
    appointment_date: '2017-05-02',
    retirement_date: '2041-01-30',
    cpf_no: 'CPF-12345678',
    status: 'active',
    hire_date: '2020-01-01'
};

export const MOCK_PAYSLIP: PaySlipData = {
    id: 101,
    employee_id: '20240101000001',
    year: 2026,
    month: 'January',
    pay_period: 'January 2026',
    // ... rest of data
    basic_salary: 16200.00,
    da: 8910.00,
    hraws: 3500.00,
    npa: 0.00,
    sbca: 1296.00,
    ta: 500.00,
    cpf_state: 2511.00,
    gis_state: 30.00,
    professional_tax: 150.00,
    stamp_duty: 5.00,
    gross_salary: 30406.00,
    total_deductions: 2696.00,
    net_salary: 27710.00,
    payment_date: '2026-01-31',
    status: 'Paid'
};

export const MOCK_PAYSLIP_MARCH_2024: PaySlipData = {
    id: 102,
    employee_id: '20240101000001',
    year: 2024,
    month: 'March',
    pay_period: 'March 2024',
    basic_salary: 15800.00,
    da: 8690.00,
    hraws: 3400.00,
    npa: 0.00,
    sbca: 1264.00,
    ta: 500.00,
    cpf_state: 2449.00,
    gis_state: 30.00,
    professional_tax: 150.00,
    stamp_duty: 5.00,
    gross_salary: 29654.00,
    total_deductions: 2634.00,
    net_salary: 27020.00,
    payment_date: '2024-03-31',
    status: 'Paid'
};

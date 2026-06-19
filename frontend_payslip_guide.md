# Integration Guide: Dynamic Payslip Rendering for Frontend

This guide explains the backend payslip data structure and the exact changes needed in the frontend Angular code to render all allowances and deductions dynamically.

---

## 1. The Problem
The frontend payslip component currently has hardcoded keys for allowances and deductions in its layout and typescript interface (e.g. `paySlipData.da`, `paySlipData.cpf_state`, etc.). 

However, the backend fetches dynamic data from a government C# API. To avoid breaking when new allowances or deductions are introduced, the backend returns these items grouped under structured dictionary objects (`earnings` and `deductions`). Because the frontend expected flat properties at the root level, only `basic_salary` and `gross_salary` (which are at the root level) were displaying.

---

## 2. Backend Reference (What to look at in the GitHub repo)
To see how the payslip payload is generated and served, look at these two files in the backend repository:

1. **[app/data_service.py](file:///d:/Pranali/EmployeePortal/app/data_service.py#L281-L321)**: See `_api_get_payslip()`. It constructs the payload by grouping dynamic allowances into `earnings` and deductions into `deductions`.
2. **[app/main.py](file:///d:/Pranali/EmployeePortal/app/main.py#L290-L299)**: See `@app.get("/api/payslips")`. It calls the data service and returns the payload in the following format:

### JSON Payload Structure:
```json
{
  "success": true,
  "data": {
    "basic_salary": 16200.00,
    "gross_salary": 30406.00,
    "total_deductions": 2696.00,
    "net_salary": 27710.00,
    "earnings": {
      "DA": 8910.00,
      "HRAWS": 3500.00,
      "SBCA": 1296.00,
      "TA": 500.00
    },
    "deductions": {
      "CPF State": 2511.00,
      "GIS State": 30.00,
      "Professional Tax": 150.00,
      "Stamp Duty": 5.00
    }
  }
}
```

---

## 3. Required Frontend Changes

To make the payslip page fully dynamic and future-proof, update the following files in the Angular project:

### File 1: `src/app/secure/payslip/payslip.ts`
1. Update the `PaySlipData` interface to include `earnings` and `deductions` dictionary signatures (while keeping the old keys optional to preserve mock data compatibility).
2. Modify the getters `totalAllowances` and `totalDeductions` to sum up dynamic fields.

```typescript
export interface PaySlipData {
    id?: number;
    employee_id: string;
    year: number;
    month: string;
    pay_period?: string;
    
    // Totals
    basic_salary: number;
    gross_salary: number;
    total_deductions: number;
    net_salary: number;
    payment_date?: string;
    status?: string;

    // Optional legacy fields (for mock data)
    da?: number;
    hraws?: number;
    npa?: number;
    sbca?: number;
    ta?: number;
    cpf_state?: number;
    gis_state?: number;
    professional_tax?: number;
    stamp_duty?: number;

    // Dynamic dictionaries matching backend payload
    earnings?: { [key: string]: number };
    deductions?: { [key: string]: number };
}
```

And update the getter logic:
```typescript
get totalAllowances(): number {
    if (!this.paySlipData) return 0;
    if (this.paySlipData.earnings) {
        const earnings = this.paySlipData.earnings;
        return Object.keys(earnings).reduce((sum, key) => sum + (earnings[key] || 0), 0);
    }
    return (this.paySlipData.da || 0) + (this.paySlipData.hraws || 0) +
        (this.paySlipData.npa || 0) + (this.paySlipData.sbca || 0) + (this.paySlipData.ta || 0);
}

get totalDeductions(): number {
    if (!this.paySlipData) return 0;
    if (this.paySlipData.deductions) {
        const deductions = this.paySlipData.deductions;
        return Object.keys(deductions).reduce((sum, key) => sum + (deductions[key] || 0), 0);
    }
    return (this.paySlipData.cpf_state || 0) + (this.paySlipData.gis_state || 0) +
        (this.paySlipData.professional_tax || 0) + (this.paySlipData.stamp_duty || 0);
}
```

---

### File 2: `src/app/secure/payslip/payslip.html`
Replace the hardcoded `*ngIf` table rows with dynamic lists using Angular’s `keyvalue` pipe.

**For the EARNINGS table:**
```html
<tbody>
    <tr>
        <td>Basic Pay</td>
        <td>{{ formatCurrency(paySlipData.basic_salary) }}</td>
    </tr>
    <!-- Dynamically loop over backend earnings -->
    <tr *ngFor="let item of paySlipData.earnings | keyvalue">
        <td>{{ item.key }}</td>
        <td>{{ formatCurrency($any(item.value)) }}</td>
    </tr>
</tbody>
```

**For the DEDUCTIONS table:**
```html
<tbody>
    <!-- Dynamically loop over backend deductions -->
    <tr *ngFor="let item of paySlipData.deductions | keyvalue">
        <td>{{ item.key }}</td>
        <td>{{ formatCurrency($any(item.value)) }}</td>
    </tr>
</tbody>
```
*(Using `$any(item.value)` guarantees compatibility with Angular's strict template type checking).*

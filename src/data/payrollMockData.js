// Mock data for Compensation, Payroll, and Salary History
// Each employee has a salary structure with all components:
// Basic, HRA, Allowances, Pay Band, Deductions, etc.

export const payBands = [
  { id: 'P1', label: 'Entry Level', range: '₹4L - ₹8L', color: '#10b981' },
  { id: 'P2', label: 'Associate', range: '₹8L - ₹14L', color: '#0ea5e9' },
  { id: 'P3', label: 'Mid-Senior', range: '₹14L - ₹22L', color: '#6366f1' },
  { id: 'P4', label: 'Senior', range: '₹22L - ₹35L', color: '#a855f7' },
  { id: 'P5', label: 'Lead / Manager', range: '₹35L - ₹55L', color: '#ec4899' },
  { id: 'P6', label: 'Director', range: '₹55L+', color: '#f59e0b' },
];

// Salary structure for each employee (monthly values in INR)
export const salaryStructures = [
  {
    employeeId: 1,
    payBand: 'P4',
    payGrade: 'Senior',
    ctc: 2400000,
    effectiveDate: '2025-04-01',
    bankAccount: 'XXXX 4521',
    components: {
      basic: 80000,
      hra: 36000,
      specialAllowance: 24000,
      conveyanceAllowance: 3200,
      medicalAllowance: 1250,
      lta: 8333,
      performanceBonus: 15000,
      employerPF: 9600,
      employerESI: 0,
      gratuity: 3846,
    },
    deductions: {
      pf: 9600,
      professionalTax: 200,
      incomeTax: 18500,
      insurance: 2500,
    },
  },
  {
    employeeId: 2,
    payBand: 'P5',
    payGrade: 'Lead',
    ctc: 3200000,
    effectiveDate: '2025-01-15',
    bankAccount: 'XXXX 8890',
    components: {
      basic: 105000,
      hra: 47250,
      specialAllowance: 32000,
      conveyanceAllowance: 3200,
      medicalAllowance: 1250,
      lta: 10938,
      performanceBonus: 20000,
      employerPF: 12600,
      employerESI: 0,
      gratuity: 5048,
    },
    deductions: {
      pf: 12600,
      professionalTax: 200,
      incomeTax: 26500,
      insurance: 3200,
    },
  },
  {
    employeeId: 3,
    payBand: 'P3',
    payGrade: 'Mid-Senior',
    ctc: 1800000,
    effectiveDate: '2025-06-01',
    bankAccount: 'XXXX 7734',
    components: {
      basic: 60000,
      hra: 27000,
      specialAllowance: 18000,
      conveyanceAllowance: 3200,
      medicalAllowance: 1250,
      lta: 6250,
      performanceBonus: 12000,
      employerPF: 7200,
      employerESI: 0,
      gratuity: 2885,
    },
    deductions: {
      pf: 7200,
      professionalTax: 200,
      incomeTax: 12800,
      insurance: 2000,
    },
  },
  {
    employeeId: 4,
    payBand: 'P2',
    payGrade: 'Associate',
    ctc: 1100000,
    effectiveDate: '2025-03-01',
    bankAccount: 'XXXX 1290',
    components: {
      basic: 38000,
      hra: 17100,
      specialAllowance: 11000,
      conveyanceAllowance: 3200,
      medicalAllowance: 1250,
      lta: 3958,
      performanceBonus: 8000,
      employerPF: 4560,
      employerESI: 0,
      gratuity: 1827,
    },
    deductions: {
      pf: 4560,
      professionalTax: 200,
      incomeTax: 6800,
      insurance: 1500,
    },
  },
];

// Payroll records for the last 6 months
const months = ['2026-02', '2026-03', '2026-04', '2026-05', '2026-06', '2026-07'];

function buildPayrollRecords() {
  const records = [];
  let id = 1;
  months.forEach((month, monthIndex) => {
    salaryStructures.forEach((structure) => {
      const { components, deductions } = structure;
      const grossEarnings = Object.values(components).reduce((sum, v) => sum + v, 0);
      const totalDeductions = Object.values(deductions).reduce((sum, v) => sum + v, 0);
      const netPay = grossEarnings - totalDeductions;

      // Simulate a small bonus in some months
      const hasBonus = monthIndex === 2 || monthIndex === 5;
      const bonusAmount = hasBonus ? Math.round(structure.ctc / 120) : 0;

      records.push({
        id: id++,
        employeeId: structure.employeeId,
        month,
        status: monthIndex === 5 ? 'Paid' : 'Paid',
        generatedOn: `${month}-28`,
        paymentDate: `${month}-01`,
        earnings: {
          ...components,
          performanceBonus: components.performanceBonus + bonusAmount,
        },
        deductions: { ...deductions },
        grossEarnings: grossEarnings + bonusAmount,
        totalDeductions,
        netPay: netPay + bonusAmount,
        bankAccount: structure.bankAccount,
      });
    });
  });
  return records;
}

export const payrollRecords = buildPayrollRecords();

// Salary revision / history timeline
export const salaryHistory = [
  {
    id: 1,
    employeeId: 1,
    effectiveDate: '2023-04-01',
    previousCTC: 1400000,
    newCTC: 1800000,
    revisionType: 'Annual Appraisal',
    payBand: 'P3',
    reason: 'Strong performance and delivery of key frontend initiatives.',
    approvedBy: 'HR Lead',
  },
  {
    id: 2,
    employeeId: 1,
    effectiveDate: '2024-04-01',
    previousCTC: 1800000,
    newCTC: 2100000,
    revisionType: 'Annual Appraisal',
    payBand: 'P3',
    reason: 'Consistent high performance and mentorship contributions.',
    approvedBy: 'HR Lead',
  },
  {
    id: 3,
    employeeId: 1,
    effectiveDate: '2025-04-01',
    previousCTC: 2100000,
    newCTC: 2400000,
    revisionType: 'Promotion',
    payBand: 'P4',
    reason: 'Promoted to Senior Frontend Engineer for exceptional leadership.',
    approvedBy: 'HR Lead',
  },
  {
    id: 4,
    employeeId: 2,
    effectiveDate: '2023-07-01',
    previousCTC: 2200000,
    newCTC: 2600000,
    revisionType: 'Annual Appraisal',
    payBand: 'P4',
    reason: 'Outstanding people analytics and strategy execution.',
    approvedBy: 'HR Lead',
  },
  {
    id: 5,
    employeeId: 2,
    effectiveDate: '2025-01-15',
    previousCTC: 2600000,
    newCTC: 3200000,
    revisionType: 'Promotion',
    payBand: 'P5',
    reason: 'Promoted to HR Business Partner Lead.',
    approvedBy: 'HR Lead',
  },
  {
    id: 6,
    employeeId: 3,
    effectiveDate: '2024-06-01',
    previousCTC: 1300000,
    newCTC: 1550000,
    revisionType: 'Annual Appraisal',
    payBand: 'P3',
    reason: 'Excellent design system contributions and user research.',
    approvedBy: 'HR Lead',
  },
  {
    id: 7,
    employeeId: 3,
    effectiveDate: '2025-06-01',
    previousCTC: 1550000,
    newCTC: 1800000,
    revisionType: 'Annual Appraisal',
    payBand: 'P3',
    reason: 'Promoted to Senior Product Designer track.',
    approvedBy: 'HR Lead',
  },
  {
    id: 8,
    employeeId: 4,
    effectiveDate: '2024-03-01',
    previousCTC: 800000,
    newCTC: 950000,
    revisionType: 'Annual Appraisal',
    payBand: 'P2',
    reason: 'Strong revenue performance and client relationship growth.',
    approvedBy: 'HR Lead',
  },
  {
    id: 9,
    employeeId: 4,
    effectiveDate: '2025-03-01',
    previousCTC: 950000,
    newCTC: 1100000,
    revisionType: 'Annual Appraisal',
    payBand: 'P2',
    reason: 'Exceeded annual quota and expanded enterprise accounts.',
    approvedBy: 'HR Lead',
  },
];

// Payroll summary metrics for dashboard
export const payrollSummary = {
  totalMonthlyGross: 0, // computed
  totalMonthlyNet: 0, // computed
  totalAnnualCTC: 0, // computed
  avgSalary: 0, // computed
  payrollRunDate: '2026-08-01',
  nextPayrollDate: '2026-09-01',
  totalEmployeesOnPayroll: 4,
  pendingApprovals: 2,
  taxDeductedThisMonth: 0, // computed
};

// Compute summary values
salaryStructures.forEach((s) => {
  const gross = Object.values(s.components).reduce((sum, v) => sum + v, 0);
  const deductions = Object.values(s.deductions).reduce((sum, v) => sum + v, 0);
  payrollSummary.totalMonthlyGross += gross;
  payrollSummary.totalMonthlyNet += gross - deductions;
  payrollSummary.totalAnnualCTC += s.ctc;
  payrollSummary.taxDeductedThisMonth += s.deductions.incomeTax;
});
payrollSummary.avgSalary = Math.round(payrollSummary.totalAnnualCTC / salaryStructures.length);
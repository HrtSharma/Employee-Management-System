// Payroll database simulation with localStorage persistence
// Handles salary structures, payroll records, and salary history

import { salaryStructures, payrollRecords, salaryHistory, payBands, payrollSummary } from './payrollMockData';

const STORAGE_KEY = 'payroll-db-data';

class PayrollDB {
  constructor() {
    this.data = this._loadFromStorage() || {
      salaryStructures,
      payrollRecords,
      salaryHistory,
      payBands,
      payrollSummary,
    };
  }

  _loadFromStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load payroll data from localStorage:', error);
    }
    return null;
  }

  _saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (error) {
      console.error('Failed to save payroll data to localStorage:', error);
    }
  }

  _delay(ms = 250) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // ===== Salary Structures =====

  async getSalaryStructures() {
    await this._delay(150);
    return this.data.salaryStructures.map((s) => ({ ...s, components: { ...s.components }, deductions: { ...s.deductions } }));
  }

  async getSalaryStructureByEmployeeId(employeeId) {
    await this._delay(100);
    const structure = this.data.salaryStructures.find((s) => s.employeeId === Number(employeeId));
    return structure ? { ...structure, components: { ...structure.components }, deductions: { ...structure.deductions } } : null;
  }

  async updateSalaryStructure(employeeId, updates) {
    await this._delay();
    const index = this.data.salaryStructures.findIndex((s) => s.employeeId === Number(employeeId));
    if (index === -1) {
      throw new Error(`Salary structure for employee ${employeeId} not found`);
    }
    this.data.salaryStructures[index] = {
      ...this.data.salaryStructures[index],
      ...updates,
      employeeId: Number(employeeId),
    };
    this._saveToStorage();
    return { ...this.data.salaryStructures[index] };
  }

  // Admin: Update complete salary structure (components + deductions + pay band + CTC)
  async saveSalaryStructure(employeeId, payload) {
    await this._delay();
    const index = this.data.salaryStructures.findIndex((s) => s.employeeId === Number(employeeId));
    if (index === -1) {
      throw new Error(`Salary structure for employee ${employeeId} not found`);
    }

    const current = this.data.salaryStructures[index];
    const newComponents = { ...current.components, ...(payload.components || {}) };
    const newDeductions = { ...current.deductions, ...(payload.deductions || {}) };

    const gross = Object.values(newComponents).reduce((sum, v) => sum + (Number(v) || 0), 0);
    const totalDeductions = Object.values(newDeductions).reduce((sum, v) => sum + (Number(v) || 0), 0);

    this.data.salaryStructures[index] = {
      ...current,
      ...payload,
      employeeId: Number(employeeId),
      components: newComponents,
      deductions: newDeductions,
      grossEarnings: gross,
      netPay: gross - totalDeductions,
    };

    this._saveToStorage();
    return {
      ...this.data.salaryStructures[index],
      components: { ...newComponents },
      deductions: { ...newDeductions },
    };
  }

  // Create a default salary structure for a new employee
  async createDefaultSalaryStructure(employeeId, employeeData = {}) {
    await this._delay();
    const existing = this.data.salaryStructures.find((s) => s.employeeId === Number(employeeId));
    if (existing) {
      return { ...existing, components: { ...existing.components }, deductions: { ...existing.deductions } };
    }

    // Determine pay band based on designation/experience
    const designation = (employeeData.designation || '').toLowerCase();
    let payBand = 'P1';
    let ctc = 500000;
    if (designation.includes('senior') || designation.includes('lead') || designation.includes('manager')) {
      payBand = 'P4';
      ctc = 2200000;
    } else if (designation.includes('engineer') || designation.includes('designer') || designation.includes('analyst')) {
      payBand = 'P3';
      ctc = 1500000;
    } else if (designation.includes('executive') || designation.includes('associate')) {
      payBand = 'P2';
      ctc = 900000;
    }

    const basic = Math.round(ctc / 12 * 0.4);
    const hra = Math.round(basic * 0.45);
    const specialAllowance = Math.round(ctc / 12 * 0.2);
    const conveyanceAllowance = 3200;
    const medicalAllowance = 1250;
    const lta = Math.round(basic / 9.6);
    const performanceBonus = Math.round(ctc / 12 * 0.08);
    const employerPF = Math.round(basic * 0.12);
    const gratuity = Math.round(basic * 0.0481);

    const newStructure = {
      employeeId: Number(employeeId),
      payBand,
      payGrade: payBand === 'P1' ? 'Entry Level' : payBand === 'P2' ? 'Associate' : payBand === 'P3' ? 'Mid-Senior' : 'Senior',
      ctc,
      effectiveDate: new Date().toISOString().slice(0, 10),
      bankAccount: `XXXX ${String(1000 + Number(employeeId)).slice(-4)}`,
      components: {
        basic,
        hra,
        specialAllowance,
        conveyanceAllowance,
        medicalAllowance,
        lta,
        performanceBonus,
        employerPF,
        employerESI: 0,
        gratuity,
      },
      deductions: {
        pf: employerPF,
        professionalTax: 200,
        incomeTax: Math.round(ctc / 12 * 0.1),
        insurance: 1500,
      },
    };

    this.data.salaryStructures.push(newStructure);

    // Update summary metrics
    const gross = Object.values(newStructure.components).reduce((sum, v) => sum + v, 0);
    const deductions = Object.values(newStructure.deductions).reduce((sum, v) => sum + v, 0);
    this.data.payrollSummary.totalEmployeesOnPayroll += 1;
    this.data.payrollSummary.totalMonthlyGross += gross;
    this.data.payrollSummary.totalMonthlyNet += gross - deductions;
    this.data.payrollSummary.totalAnnualCTC += ctc;
    this.data.payrollSummary.avgSalary = Math.round(this.data.payrollSummary.totalAnnualCTC / this.data.payrollSummary.totalEmployeesOnPayroll);
    this.data.payrollSummary.taxDeductedThisMonth += newStructure.deductions.incomeTax;

    this._saveToStorage();
    return { ...newStructure, components: { ...newStructure.components }, deductions: { ...newStructure.deductions } };
  }

  // ===== Payroll Records =====

  async getPayrollRecords() {
    await this._delay(150);
    return this.data.payrollRecords.map((r) => ({
      ...r,
      earnings: { ...r.earnings },
      deductions: { ...r.deductions },
    }));
  }

  async getPayrollRecordsByEmployee(employeeId) {
    await this._delay(100);
    return this.data.payrollRecords
      .filter((r) => r.employeeId === Number(employeeId))
      .map((r) => ({ ...r, earnings: { ...r.earnings }, deductions: { ...r.deductions } }));
  }

  async getPayrollRecordById(id) {
    await this._delay(100);
    const record = this.data.payrollRecords.find((r) => r.id === Number(id));
    return record ? { ...record, earnings: { ...record.earnings }, deductions: { ...record.deductions } } : null;
  }

  // ===== Salary History =====

  async getSalaryHistory() {
    await this._delay(150);
    return this.data.salaryHistory.map((h) => ({ ...h }));
  }

  async getSalaryHistoryByEmployee(employeeId) {
    await this._delay(100);
    return this.data.salaryHistory
      .filter((h) => h.employeeId === Number(employeeId))
      .map((h) => ({ ...h }));
  }

  async addSalaryRevision(revision) {
    await this._delay();
    const newRevision = {
      id: Math.max(...this.data.salaryHistory.map((h) => h.id), 0) + 1,
      ...revision,
    };
    this.data.salaryHistory.push(newRevision);
    this._saveToStorage();
    return { ...newRevision };
  }

  // ===== Pay Bands =====

  async getPayBands() {
    await this._delay(100);
    return this.data.payBands.map((p) => ({ ...p }));
  }

  // ===== Summary =====

  async getPayrollSummary() {
    await this._delay(100);
    return { ...this.data.payrollSummary };
  }

  // Reset to seed data
  async resetPayrollData() {
    await this._delay();
    this.data = {
      salaryStructures,
      payrollRecords,
      salaryHistory,
      payBands,
      payrollSummary,
    };
    this._saveToStorage();
    return { success: true };
  }
}

// Singleton instance
export const payrollDB = new PayrollDB();
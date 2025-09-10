import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmployeeProfile } from "./employee-profile";
import { SalarySlipForm } from "./salary-slip-form";
import { ExpenseTracker } from "./expense-tracker";
import { MonthlySummary } from "./monthly-summary";
import { YearlySummary } from "./yearly-summary";
import { DataManagement } from "./data-management";
import { PeriodNavigator } from "./period-navigator";
import { User, Calculator, Receipt, BarChart3 } from "lucide-react";

interface EmployeeInfo {
  name: string;
  employeeId: string;
  department: string;
  position: string;
}

interface SalaryData {
  basicSalary: number;
  generalAllowance: number;
  medical: number;
  phoneAllowance: number;
  transport: number;
  rent: number;
  actingAllowance: number;
  overtime: number;
  incentivePay: number;
  bonus: number;
  nassitEmployee: number;
  paye: number;
  salaryAdvance: number;
  productPhoneRepayment: number;
  transportDeduction: number;
  rentDeduction: number;
  hubBalance: number;
  stockDeduction: number;
  loanRepayment: number;
  expensesAdvanceOthers: number;
  nassitEmployer: number;
}

interface ExpenseItem {
  id: string;
  name: string;
  amount: number;
  isSavings?: boolean;
}

// Default expenses to use if none are in localStorage
const defaultExpenses: ExpenseItem[] = [
  { id: "1", name: "Internet", amount: 800 },
  { id: "2", name: "Netflix", amount: 260 },
  { id: "3", name: "Apple Music", amount: 250 },
  { id: "4", name: "Little Sis", amount: 350 },
  { id: "5", name: "Mummy", amount: 200 },
  { id: "6", name: "John", amount: 1000 },
  { id: "7", name: "Savings", amount: 1000, isSavings: true },
];

// Helper functions for localStorage
const saveToLocalStorage = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving to localStorage: ${error}`);
  }
};

const loadFromLocalStorage = <T,>(key: string, defaultValue: T): T => {
  try {
    const savedData = localStorage.getItem(key);
    return savedData ? JSON.parse(savedData) : defaultValue;
  } catch (error) {
    console.error(`Error loading from localStorage: ${error}`);
    return defaultValue;
  }
};

export function ComprehensiveFinancialDashboard() {
  const [employeeInfo, setEmployeeInfo] = useState<EmployeeInfo>(() => 
    loadFromLocalStorage('employeeInfo', {
      name: "",
      employeeId: "",
      department: "",
      position: "",
    })
  );

  const [currentPeriod, setCurrentPeriod] = useState(() =>
    loadFromLocalStorage('currentPeriod', new Date().toISOString().slice(0, 7)) // YYYY-MM format
  );

  const [salaryData, setSalaryData] = useState<SalaryData>(() =>
    loadFromLocalStorage('salaryData', {
      basicSalary: 0,
      generalAllowance: 0,
      medical: 0,
      phoneAllowance: 0,
      transport: 0,
      rent: 0,
      actingAllowance: 0,
      overtime: 0,
      incentivePay: 0,
      bonus: 0,
      nassitEmployee: 0,
      paye: 0,
      salaryAdvance: 0,
      productPhoneRepayment: 0,
      transportDeduction: 0,
      rentDeduction: 0,
      hubBalance: 0,
      stockDeduction: 0,
      loanRepayment: 0,
      expensesAdvanceOthers: 0,
      nassitEmployer: 0,
    })
  );

  // Store expenses by period (month/year)
  const [expensesByPeriod, setExpensesByPeriod] = useState<Record<string, ExpenseItem[]>>(() =>
    loadFromLocalStorage('expensesByPeriod', { [currentPeriod]: defaultExpenses })
  );
  
  // Get expenses for the current period
  const expenses = expensesByPeriod[currentPeriod] || [];
  
  // Function to update expenses for the current period
  const setExpenses = (newExpenses: ExpenseItem[]) => {
    setExpensesByPeriod(prev => ({
      ...prev,
      [currentPeriod]: newExpenses
    }));
  };

  // Save data to localStorage whenever it changes
  useEffect(() => {
    saveToLocalStorage('employeeInfo', employeeInfo);
  }, [employeeInfo]);

  useEffect(() => {
    saveToLocalStorage('currentPeriod', currentPeriod);
  }, [currentPeriod]);

  useEffect(() => {
    saveToLocalStorage('salaryData', salaryData);
  }, [salaryData]);

  useEffect(() => {
    saveToLocalStorage('expensesByPeriod', expensesByPeriod);
  }, [expensesByPeriod]);

  // Calculate totals
  const grossPay = Object.keys(salaryData)
    .filter(key => [
      'basicSalary', 'generalAllowance', 'medical', 'phoneAllowance', 
      'transport', 'rent', 'actingAllowance', 'overtime', 'incentivePay', 'bonus'
    ].includes(key))
    .reduce((sum, key) => sum + salaryData[key as keyof SalaryData], 0);

  const totalDeductions = Object.keys(salaryData)
    .filter(key => [
      'nassitEmployee', 'paye', 'salaryAdvance', 'productPhoneRepayment',
      'transportDeduction', 'rentDeduction', 'hubBalance', 'stockDeduction',
      'loanRepayment', 'expensesAdvanceOthers'
    ].includes(key))
    .reduce((sum, key) => sum + salaryData[key as keyof SalaryData], 0);

  const netPay = grossPay - totalDeductions;
  
  // Calculate total expenses (excluding savings)
  const totalExpenses = expenses.reduce((sum, expense) => {
    // Only add to total expenses if it's not a savings item
    if (expense.isSavings === undefined) {
      console.log('Expense missing isSavings property:', expense);
      return sum + expense.amount; // Default to regular expense
    }
    return expense.isSavings ? sum : sum + expense.amount;
  }, 0);
  
  // Calculate total savings
  const totalSavings = expenses.reduce((sum, expense) => {
    // Only add to total savings if it's a savings item
    if (expense.isSavings === undefined) {
      return sum; // Default to not a savings item
    }
    return expense.isSavings ? sum + expense.amount : sum;
  }, 0);
  
  const handleUpdateExpenses = (updatedExpenses: ExpenseItem[]) => {
    console.log('Dashboard received updated expenses for period:', currentPeriod, updatedExpenses);
    // Update expenses for the current period
    setExpenses([...updatedExpenses]);
  };

  // Log values for debugging
  console.log('Dashboard - Total Expenses:', totalExpenses);
  console.log('Dashboard - Total Savings:', totalSavings);
  console.log('Dashboard - Expenses for period:', currentPeriod, expenses);
  console.log('Dashboard - All periods:', Object.keys(expensesByPeriod));

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="text-center md:text-left space-y-2">
            <h1 className="text-4xl font-bold text-foreground">
              Salary & Expense Tracking System
            </h1>
            <p className="text-muted-foreground text-lg">
              Complete payroll and expense management dashboard
            </p>
          </div>
          <DataManagement />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Employee Profile - Always visible */}
          <div className="md:col-span-2">
            <EmployeeProfile
              employeeInfo={employeeInfo}
              onUpdateEmployee={setEmployeeInfo}
              currentPeriod={currentPeriod}
              onUpdatePeriod={setCurrentPeriod}
            />
          </div>
          
          {/* Period Navigator */}
          <div className="md:col-span-1">
            <PeriodNavigator
              currentPeriod={currentPeriod}
              onUpdatePeriod={setCurrentPeriod}
              availablePeriods={Object.keys(expensesByPeriod).sort().reverse()}
            />
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="summary" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="salary" className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Salary Slip
            </TabsTrigger>
            <TabsTrigger value="expenses" className="flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              Expenses
            </TabsTrigger>
            <TabsTrigger value="summary" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Summary
            </TabsTrigger>
          </TabsList>

          <TabsContent value="salary" className="space-y-6">
            <SalarySlipForm
              salaryData={salaryData}
              onUpdateSalary={setSalaryData}
            />
          </TabsContent>

          <TabsContent value="expenses" className="space-y-6">
            <ExpenseTracker
              expenses={expenses}
              onUpdateExpenses={setExpenses}
            />
          </TabsContent>

          <TabsContent value="summary" className="space-y-6">
            {/* Force re-render with key based on expenses length */}
            <MonthlySummary
              key={expenses.length}
              netPay={netPay}
              totalExpenses={totalExpenses}
              totalSavings={totalSavings}
              currentPeriod={currentPeriod}
            />
            <YearlySummary expensesByPeriod={expensesByPeriod} />
            <div className="text-xs text-muted-foreground">
              Debug: Net Pay: {netPay}, Expenses: {totalExpenses}, Savings: {totalSavings}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
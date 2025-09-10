import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Database, Trash2 } from "lucide-react";
import { useState } from "react";
import * as XLSX from 'xlsx';

export function DataManagement() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const clearAllData = () => {
    try {
      // Clear all application data from localStorage
      localStorage.removeItem('employeeInfo');
      localStorage.removeItem('currentPeriod');
      localStorage.removeItem('salaryData');
      localStorage.removeItem('expenses');
      localStorage.removeItem('expensesByPeriod');
      
      toast({
        title: "Data cleared",
        description: "All saved data has been removed. Refresh the page to see changes.",
      });
      
      setOpen(false);
    } catch (error) {
      console.error('Error clearing data:', error);
      toast({
        title: "Error",
        description: "Failed to clear data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const exportData = () => {
    try {
      // Collect all data from localStorage
      const employeeInfo = JSON.parse(localStorage.getItem('employeeInfo') || '{}');
      const currentPeriod = localStorage.getItem('currentPeriod');
      const salaryData = JSON.parse(localStorage.getItem('salaryData') || '{}');
      const expensesByPeriod = JSON.parse(localStorage.getItem('expensesByPeriod') || '{}');
      
      // Create a new workbook
      const workbook = XLSX.utils.book_new();
      
      // Employee Info Sheet
      const employeeSheet = XLSX.utils.json_to_sheet([{
        'Employee Name': employeeInfo.name || '',
        'Employee ID': employeeInfo.employeeId || '',
        'Department': employeeInfo.department || '',
        'Position': employeeInfo.position || '',
        'Current Period': currentPeriod || ''
      }]);
      XLSX.utils.book_append_sheet(workbook, employeeSheet, 'Employee Info');
      
      // Salary Data Sheet
      const salarySheet = XLSX.utils.json_to_sheet([{
        'Basic Salary': salaryData.basicSalary || 0,
        'General Allowance': salaryData.generalAllowance || 0,
        'Medical': salaryData.medical || 0,
        'Phone Allowance': salaryData.phoneAllowance || 0,
        'Transport': salaryData.transport || 0,
        'Rent': salaryData.rent || 0,
        'Acting Allowance': salaryData.actingAllowance || 0,
        'Overtime': salaryData.overtime || 0,
        'Incentive Pay': salaryData.incentivePay || 0,
        'Bonus': salaryData.bonus || 0,
        'NASSIT Employee': salaryData.nassitEmployee || 0,
        'PAYE': salaryData.paye || 0,
        'Salary Advance': salaryData.salaryAdvance || 0,
        'Product Phone Repayment': salaryData.productPhoneRepayment || 0,
        'Transport Deduction': salaryData.transportDeduction || 0,
        'Rent Deduction': salaryData.rentDeduction || 0,
        'Hub Balance': salaryData.hubBalance || 0,
        'Stock Deduction': salaryData.stockDeduction || 0,
        'Loan Repayment': salaryData.loanRepayment || 0,
        'Expenses Advance Others': salaryData.expensesAdvanceOthers || 0,
        'NASSIT Employer': salaryData.nassitEmployer || 0
      }]);
      XLSX.utils.book_append_sheet(workbook, salarySheet, 'Salary Data');
      
      // Expenses by Period Sheet
      const expensesData = [];
      Object.entries(expensesByPeriod).forEach(([period, expenses]) => {
        expenses.forEach((expense) => {
          expensesData.push({
            'Period': period,
            'Expense Name': expense.name,
            'Amount': expense.amount,
            'Type': expense.isSavings ? 'Savings' : 'Expense'
          });
        });
      });
      
      if (expensesData.length > 0) {
        const expensesSheet = XLSX.utils.json_to_sheet(expensesData);
        XLSX.utils.book_append_sheet(workbook, expensesSheet, 'Expenses by Period');
      }
      
      // Generate filename with current date
      const exportFileDefaultName = `pocket-pocket-data-${new Date().toISOString().slice(0, 10)}.xlsx`;
      
      // Write and download the file
      XLSX.writeFile(workbook, exportFileDefaultName);
      
      toast({
        title: "Data exported",
        description: "Your data has been exported as Excel file successfully.",
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: "Export failed",
        description: "Could not export data. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-1"
        onClick={exportData}
      >
        <Database className="h-4 w-4" />
        Export Data
      </Button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            Clear Data
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear all saved data?</DialogTitle>
            <DialogDescription>
              This action will remove all your saved information including employee details, salary data, and expenses.
              This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={clearAllData}>Delete All Data</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
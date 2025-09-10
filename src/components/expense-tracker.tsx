import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useExpenses } from "@/hooks/useExpenses";
import { Trash2, Plus, Receipt, Edit2 } from "lucide-react";
import { format } from "date-fns";
import { Database } from "@/lib/database.types";

export function ExpenseTracker() {
  const { expenses, loading, addExpense, updateExpense, deleteExpense } = useExpenses();
  const [newExpenseName, setNewExpenseName] = useState('');
  const [newExpenseAmount, setNewExpenseAmount] = useState('');
  const [newExpenseCategory, setNewExpenseCategory] = useState('general');
  const { toast } = useToast();

  const handleAddExpense = async () => {
    if (!newExpenseName || !newExpenseAmount) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      await addExpense({
        name: newExpenseName,
        amount: parseFloat(newExpenseAmount),
        category: newExpenseCategory,
        date: format(new Date(), 'yyyy-MM-dd'),
      });

      setNewExpenseName('');
      setNewExpenseAmount('');
      setNewExpenseCategory('general');

      toast({
        title: 'Success',
        description: 'Expense added successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add expense',
        variant: 'destructive',
      });
    }
  };

  const totalExpenses = expenses.reduce((sum, expense) => {
    return sum + expense.amount;
  }, 0);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Expense Tracker</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-4">
            <p>Loading expenses...</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // No need for savings calculation with the new database schema
  const totalSavings = 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-SL', {
      style: 'currency',
      currency: 'SLL',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const [editingExpense, setEditingExpense] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editCategory, setEditCategory] = useState('');

  const handleStartEdit = (expense: Database['public']['Tables']['expenses']['Row']) => {
    setEditingExpense(expense.id);
    setEditName(expense.name);
    setEditAmount(expense.amount.toString());
    setEditCategory(expense.category);
  };

  const handleCancelEdit = () => {
    setEditingExpense(null);
  };

  const handleSaveEdit = async () => {
    if (!editingExpense) return;
    
    try {
      await updateExpense(editingExpense, {
        name: editName,
        amount: parseFloat(editAmount),
        category: editCategory
      });
      
      setEditingExpense(null);
      toast({
        title: "Success",
        description: "Expense updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update expense",
        variant: "destructive",
      });
    }
  };

  // This function is no longer needed as we're using the useExpenses hook

  // All the old functions have been replaced with the new implementation using useExpenses hook

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expense Tracker</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-4">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="name">Name</Label>
              <Input
                type="text"
                id="name"
                placeholder="Enter expense name"
                value={newExpenseName}
                onChange={(e) => setNewExpenseName(e.target.value)}
              />
            </div>
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="amount">Amount</Label>
              <Input
                type="number"
                id="amount"
                placeholder="Enter amount"
                value={newExpenseAmount}
                onChange={(e) => setNewExpenseAmount(e.target.value)}
              />
            </div>
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="category">Category</Label>
              <Input
                type="text"
                id="category"
                placeholder="Enter category"
                value={newExpenseCategory}
                onChange={(e) => setNewExpenseCategory(e.target.value)}
              />
            </div>
            <Button
              className="w-full"
              onClick={handleAddExpense}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Expense
            </Button>
          </div>

          <Separator />

          <div className="space-y-4">
            {expenses.map((expense) => (
              <div
                key={expense.id}
                className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50"
              >
                {editingExpense === expense.id ? (
                  <div className="flex-1 space-y-2">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Expense name"
                      className="mb-1"
                    />
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={editAmount}
                        onChange={(e) => setEditAmount(e.target.value)}
                        placeholder="Amount"
                        className="w-1/2"
                      />
                      <Input
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value)}
                        placeholder="Category"
                        className="w-1/2"
                      />
                    </div>
                    <div className="flex justify-end gap-2 mt-2">
                      <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                        Cancel
                      </Button>
                      <Button size="sm" onClick={handleSaveEdit}>
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center space-x-4">
                      <Receipt className="h-4 w-4" />
                      <div className="flex flex-col">
                        <span className="font-medium">{expense.name}</span>
                        <span className="text-sm text-muted-foreground">{expense.category}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono">{formatCurrency(expense.amount)}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleStartEdit(expense)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={async () => {
                          try {
                            await deleteExpense(expense.id);
                            toast({
                              title: "Success",
                              description: "Expense deleted successfully",
                            });
                          } catch (error) {
                            toast({
                              title: "Error",
                              description: "Failed to delete expense",
                              variant: "destructive",
                            });
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          <Separator />

          <div className="flex items-center justify-between font-medium">
            <span>Total Expenses</span>
            <span className="font-mono">{formatCurrency(totalExpenses)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
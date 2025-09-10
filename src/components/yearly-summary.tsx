import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCard } from "@/components/ui/stats-card";
import { Calendar, PiggyBank, TrendingDown, TrendingUp } from "lucide-react";

interface ExpenseItem {
  id: string;
  name: string;
  amount: number;
  isSavings?: boolean;
}

interface YearlySummaryProps {
  expensesByPeriod: Record<string, ExpenseItem[]>;
}

export function YearlySummary({ expensesByPeriod }: YearlySummaryProps) {
  // Calculate yearly totals
  const yearlyData = Object.entries(expensesByPeriod).reduce(
    (acc, [period, expenses]) => {
      // Get year from period (YYYY-MM)
      const year = period.split('-')[0];
      
      if (!acc[year]) {
        acc[year] = {
          totalExpenses: 0,
          totalSavings: 0,
          months: new Set(),
        };
      }
      
      // Add this period's expenses and savings
      expenses.forEach(expense => {
        if (expense.isSavings) {
          acc[year].totalSavings += expense.amount;
        } else {
          acc[year].totalExpenses += expense.amount;
        }
      });
      
      // Track months for this year
      acc[year].months.add(period.split('-')[1]);
      
      return acc;
    },
    {} as Record<string, { totalExpenses: number; totalSavings: number; months: Set<string> }>
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-SL', {
      style: 'currency',
      currency: 'SLL',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Get current year
  const currentYear = new Date().getFullYear().toString();
  
  // If we have data for the current year, show it
  const currentYearData = yearlyData[currentYear];

  if (!currentYearData) {
    return (
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Yearly Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No data available for the current year.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Yearly Summary ({currentYear})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Months Tracked"
            value={currentYearData.months.size.toString()}
            icon={<Calendar className="h-6 w-6" />}
            variant="default"
          />
          <StatsCard
            title="Total Yearly Expenses"
            value={formatCurrency(currentYearData.totalExpenses)}
            icon={<TrendingDown className="h-6 w-6" />}
            variant="warning"
          />
          <StatsCard
            title="Total Yearly Savings"
            value={formatCurrency(currentYearData.totalSavings)}
            icon={<PiggyBank className="h-6 w-6" />}
            variant="success"
          />
          <StatsCard
            title="Monthly Average Expenses"
            value={formatCurrency(currentYearData.totalExpenses / Math.max(1, currentYearData.months.size))}
            icon={<TrendingUp className="h-6 w-6" />}
            variant="default"
          />
        </div>
      </CardContent>
    </Card>
  );
}
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

interface PeriodNavigatorProps {
  currentPeriod: string; // Format: YYYY-MM
  onUpdatePeriod: (period: string) => void;
  availablePeriods: string[];
}

export function PeriodNavigator({ 
  currentPeriod, 
  onUpdatePeriod, 
  availablePeriods 
}: PeriodNavigatorProps) {
  // Format period for display
  const formatPeriod = (period: string) => {
    return new Date(period + "-01").toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  // Navigate to previous month
  const goToPreviousMonth = () => {
    const [year, month] = currentPeriod.split('-').map(Number);
    let newMonth = month - 1;
    let newYear = year;
    
    if (newMonth < 1) {
      newMonth = 12;
      newYear -= 1;
    }
    
    const newPeriod = `${newYear}-${newMonth.toString().padStart(2, '0')}`;
    onUpdatePeriod(newPeriod);
  };

  // Navigate to next month
  const goToNextMonth = () => {
    const [year, month] = currentPeriod.split('-').map(Number);
    let newMonth = month + 1;
    let newYear = year;
    
    if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    }
    
    const newPeriod = `${newYear}-${newMonth.toString().padStart(2, '0')}`;
    onUpdatePeriod(newPeriod);
  };

  // Handle direct period selection
  const handlePeriodChange = (value: string) => {
    onUpdatePeriod(value);
  };

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="h-5 w-5 text-primary" />
          Period Navigation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={goToPreviousMonth}
            className="flex-shrink-0"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          
          <div className="flex-grow">
            <Select value={currentPeriod} onValueChange={handlePeriodChange}>
              <SelectTrigger>
                <SelectValue placeholder={formatPeriod(currentPeriod)} />
              </SelectTrigger>
              <SelectContent>
                {availablePeriods.length > 0 ? (
                  availablePeriods.map((period) => (
                    <SelectItem key={period} value={period}>
                      {formatPeriod(period)}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value={currentPeriod}>
                    {formatPeriod(currentPeriod)}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={goToNextMonth}
            className="flex-shrink-0"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
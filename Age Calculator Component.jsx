import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';

const AgeCalculator = () => {
  const [formData, setFormData] = useState({
    day: '',
    month: '',
    year: ''
  });
  
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    const currentDate = new Date();
    const inputDate = new Date(
      parseInt(formData.year),
      parseInt(formData.month) - 1,
      parseInt(formData.day)
    );

    // Empty field validation
    if (!formData.day) newErrors.day = 'Day is required';
    if (!formData.month) newErrors.month = 'Month is required';
    if (!formData.year) newErrors.year = 'Year is required';

    // Range validation
    if (formData.day && (formData.day < 1 || formData.day > 31)) {
      newErrors.day = 'Day must be between 1-31';
    }
    if (formData.month && (formData.month < 1 || formData.month > 12)) {
      newErrors.month = 'Month must be between 1-12';
    }

    // Future date validation
    if (inputDate > currentDate) {
      newErrors.general = 'Date cannot be in the future';
    }

    // Invalid date validation (e.g., 31/04/1991)
    if (inputDate.toString() === 'Invalid Date') {
      newErrors.general = 'Invalid date';
    }

    return newErrors;
  };

  const calculateAge = async () => {
    const errors = validateForm();
    setErrors(errors);

    if (Object.keys(errors).length === 0) {
      setIsLoading(true);
      try {
        const response = await fetch('/api/calculate-age', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        
        if (!response.ok) throw new Error('Failed to calculate age');
        
        const data = await response.json();
        setResult(data);
      } catch (error) {
        setErrors({ general: 'Failed to calculate age. Please try again.' });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <Card className="w-full max-w-lg p-6 space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">DAY</label>
          <Input
            type="number"
            placeholder="DD"
            value={formData.day}
            onChange={(e) => setFormData({ ...formData, day: e.target.value })}
            className={errors.day ? 'border-red-500' : ''}
          />
          {errors.day && <p className="text-red-500 text-xs mt-1">{errors.day}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">MONTH</label>
          <Input
            type="number"
            placeholder="MM"
            value={formData.month}
            onChange={(e) => setFormData({ ...formData, month: e.target.value })}
            className={errors.month ? 'border-red-500' : ''}
          />
          {errors.month && <p className="text-red-500 text-xs mt-1">{errors.month}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">YEAR</label>
          <Input
            type="number"
            placeholder="YYYY"
            value={formData.year}
            onChange={(e) => setFormData({ ...formData, year: e.target.value })}
            className={errors.year ? 'border-red-500' : ''}
          />
          {errors.year && <p className="text-red-500 text-xs mt-1">{errors.year}</p>}
        </div>
      </div>

      {errors.general && (
        <Alert variant="destructive">
          <AlertDescription>{errors.general}</AlertDescription>
        </Alert>
      )}

      <div className="relative py-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center">
          <Button 
            onClick={calculateAge}
            disabled={isLoading}
            className="rounded-full bg-purple-600 hover:bg-purple-700"
          >
            {isLoading ? 'Calculating...' : 'Calculate'}
          </Button>
        </div>
      </div>

      {result && (
        <div className="space-y-2 text-5xl font-bold italic">
          <p><span className="text-purple-600">{result.years}</span> years</p>
          <p><span className="text-purple-600">{result.months}</span> months</p>
          <p><span className="text-purple-600">{result.days}</span> days</p>
        </div>
      )}
    </Card>
  );
};

export default AgeCalculator;

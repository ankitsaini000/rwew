'use client';

import React from 'react';

interface OnboardingProgressBarProps {
  currentStep: number;
}

export const OnboardingProgressBar: React.FC<OnboardingProgressBarProps> = ({ currentStep }) => {
  const steps = [
    { number: 1, label: 'Personal Info' },
    { number: 2, label: 'Professional Info' },
    { number: 3, label: 'Description & FAQ' },
    { number: 4, label: 'Social Media' },
    { number: 5, label: 'Pricing' },
    { number: 6, label: 'Gallery & Portfolio' },
    { number: 7, label: 'Publish' }
  ];

  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex justify-center">
          <ol className="relative flex items-center justify-between w-full max-w-5xl">
            {steps.map((step, index) => {
              const isActive = step.number === currentStep;
              const isCompleted = step.number < currentStep;
              const isLast = index === steps.length - 1;

              return (
                <React.Fragment key={step.number}>
                  <li className="flex items-center">
                    <div 
                      className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium ${
                        isActive 
                          ? 'bg-blue-600 text-white border-2 border-blue-600' 
                          : isCompleted 
                            ? 'bg-green-500 text-white' 
                            : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {isCompleted ? (
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                      ) : (
                        step.number
                      )}
                    </div>
                    <span 
                      className={`hidden sm:block ml-2 text-xs ${
                        isActive ? 'text-blue-600 font-medium' : isCompleted ? 'text-green-500' : 'text-gray-500'
                      }`}
                    >
                      {step.label}
                    </span>
                  </li>
                  
                  {!isLast && (
                    <div 
                      className={`flex-1 h-0.5 mx-2 ${
                        isCompleted || (index === currentStep - 2) ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                    ></div>
                  )}
                </React.Fragment>
              );
            })}
          </ol>
        </div>
      </div>
    </div>
  );
}; 
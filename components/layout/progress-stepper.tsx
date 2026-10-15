import React from "react";
import { Stepper, type StepperProps } from "@/components/ui/stepper";

export function ProgressStepper({ currentStep, className = "" }: StepperProps) {
  return <Stepper currentStep={currentStep} className={className} />;
}

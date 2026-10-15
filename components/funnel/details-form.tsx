"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { detailsSchema, type DetailsFormValues } from "@/features/assessment/schema";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { NumberField } from "@/components/ui/number-field";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { useFunnelState } from "@/hooks/use-funnel-state";

export function DetailsForm() {
  const router = useRouter();
  const { details, updateDetails, hydrated } = useFunnelState();
  const [measurementModalOpen, setMeasurementModalOpen] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm<DetailsFormValues>({
    resolver: zodResolver(detailsSchema),
    mode: "onChange",
    defaultValues: {
      gender: "male",
      age: undefined,
      heightCm: undefined,
      weightKg: undefined,
      waistIn: undefined,
      neckIn: undefined,
      hipIn: undefined,
    },
  });

  // Hydrate form from sessionStorage on mount
  useEffect(() => {
    if (hydrated && details.gender) {
      reset({
        gender: details.gender,
        age: details.age,
        heightCm: details.heightCm,
        weightKg: details.weightKg,
        waistIn: details.waistIn,
        neckIn: details.neckIn,
        hipIn: details.hipIn,
      });
    }
  }, [hydrated, details, reset]);

  const currentGender = watch("gender");

  const onSubmit = (data: DetailsFormValues) => {
    updateDetails(data);
    router.push("/goal");
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="p-6 sm:p-8 space-y-6">
          {/* Gender Segmented Control */}
          <Controller
            control={control}
            name="gender"
            render={({ field }) => (
              <SegmentedControl
                label="Gender (Biological Sex)"
                value={field.value}
                onChange={(val) => {
                  field.onChange(val);
                  updateDetails({ gender: val });
                }}
                options={[
                  {
                    value: "male",
                    label: "Male",
                    icon: (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    ),
                  },
                  {
                    value: "female",
                    label: "Female",
                    icon: (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    ),
                  },
                ]}
                error={errors.gender?.message}
              />
            )}
          />

          {/* Age & Height */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Controller
              control={control}
              name="age"
              render={({ field }) => (
                <NumberField
                  label="Age"
                  placeholder="25"
                  unit="yrs"
                  value={field.value ?? ""}
                  onChange={(e) => {
                    const val = e.target.value === "" ? undefined : Number(e.target.value);
                    field.onChange(val);
                    updateDetails({ age: val });
                  }}
                  error={errors.age?.message}
                  helperText="Must be 18 to 80 years"
                />
              )}
            />

            <Controller
              control={control}
              name="heightCm"
              render={({ field }) => (
                <NumberField
                  label="Height"
                  placeholder="175"
                  unit="cm"
                  value={field.value ?? ""}
                  onChange={(e) => {
                    const val = e.target.value === "" ? undefined : Number(e.target.value);
                    field.onChange(val);
                    updateDetails({ heightCm: val });
                  }}
                  error={errors.heightCm?.message}
                  helperText="Range: 120 - 230 cm"
                />
              )}
            />
          </div>

          {/* Weight */}
          <div>
            <Controller
              control={control}
              name="weightKg"
              render={({ field }) => (
                <NumberField
                  label="Weight"
                  placeholder="70"
                  unit="kg"
                  value={field.value ?? ""}
                  onChange={(e) => {
                    const val = e.target.value === "" ? undefined : Number(e.target.value);
                    field.onChange(val);
                    updateDetails({ weightKg: val });
                  }}
                  error={errors.weightKg?.message}
                  helperText="Range: 30 - 300 kg"
                />
              )}
            />
          </div>

          {/* Tape measurements section with guide modal trigger */}
          <div className="pt-4 border-t border-surface-200 dark:border-surface-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-ink dark:text-white">
                  Circumference Measurements
                </h4>
                <p className="text-xs text-ink-muted dark:text-surface-400">
                  Required for US Navy Body Fat % estimate (in inches)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMeasurementModalOpen(true)}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>How to measure?</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Controller
                control={control}
                name="waistIn"
                render={({ field }) => (
                  <NumberField
                    label="Waist (at navel)"
                    placeholder="34"
                    unit="inches"
                    value={field.value ?? ""}
                    onChange={(e) => {
                      const val = e.target.value === "" ? undefined : Number(e.target.value);
                      field.onChange(val);
                      updateDetails({ waistIn: val });
                    }}
                    error={errors.waistIn?.message}
                    helperText={currentGender === "male" ? "Must be greater than neck" : undefined}
                  />
                )}
              />

              <Controller
                control={control}
                name="neckIn"
                render={({ field }) => (
                  <NumberField
                    label="Neck (below larynx)"
                    placeholder="15"
                    unit="inches"
                    value={field.value ?? ""}
                    onChange={(e) => {
                      const val = e.target.value === "" ? undefined : Number(e.target.value);
                      field.onChange(val);
                      updateDetails({ neckIn: val });
                    }}
                    error={errors.neckIn?.message}
                  />
                )}
              />
            </div>

            {/* Female Hip Field - Strictly ONLY rendered for females */}
            {currentGender === "female" && (
              <div className="mt-4 pt-4 border-t border-surface-100 dark:border-surface-800 animate-slide-up">
                <Controller
                  control={control}
                  name="hipIn"
                  render={({ field }) => (
                    <NumberField
                      label="Hip (widest circumference)"
                      placeholder="38"
                      unit="inches"
                      value={field.value ?? ""}
                      onChange={(e) => {
                        const val = e.target.value === "" ? undefined : Number(e.target.value);
                        field.onChange(val);
                        updateDetails({ hipIn: val });
                      }}
                      error={errors.hipIn?.message}
                      helperText="Required for female body fat calculation (waist + hip > neck)"
                    />
                  )}
                />
              </div>
            )}
          </div>
        </Card>

        {/* Desktop and Mobile CTA button */}
        <div className="pt-2">
          <Button
            type="submit"
            size="lg"
            fullWidth
            disabled={!isValid || isSubmitting}
            className="shadow-float"
          >
            <span>Continue to Fitness Goal (Step 2)</span>
            <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Button>
        </div>
      </form>

      {/* Measurement Guidance Modal */}
      <Modal
        isOpen={measurementModalOpen}
        onClose={() => setMeasurementModalOpen(false)}
        title="How to take accurate tape measurements"
      >
        <div className="space-y-4 text-xs sm:text-sm text-ink-muted dark:text-surface-300 leading-relaxed">
          <p>
            Use a standard flexible measuring tape. Keep the tape level and snug against the skin without compressing the soft tissue.
          </p>
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700">
              <strong className="text-ink dark:text-white block font-bold mb-1">1. Waist (at navel / belly button):</strong>
              Stand relaxed and measure horizontally across your belly button after exhaling gently. Do not suck in your stomach.
            </div>
            <div className="p-3 rounded-xl bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700">
              <strong className="text-ink dark:text-white block font-bold mb-1">2. Neck (below larynx):</strong>
              Measure just below your Adam&apos;s apple (larynx), with the tape sloping slightly downward to the front. Look straight ahead.
            </div>
            {currentGender === "female" && (
              <div className="p-3 rounded-xl bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700">
                <strong className="text-ink dark:text-white block font-bold mb-1">3. Hip (widest point of buttocks):</strong>
                Measure horizontally around the widest part of your hips and glutes with your feet placed close together.
              </div>
            )}
          </div>
          <div className="pt-2">
            <Button
              type="button"
              variant="primary"
              size="sm"
              fullWidth
              onClick={() => setMeasurementModalOpen(false)}
            >
              Got it, continue
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

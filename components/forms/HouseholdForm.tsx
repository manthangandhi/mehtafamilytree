'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { FamilyMemberRepeater } from './FamilyMemberRepeater';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import type { HouseholdFormData, FamilyMemberRow } from '@/lib/validations/household';

interface Props {
  household: HouseholdFormData;
  members: FamilyMemberRow[];
  onHouseholdChange: (h: HouseholdFormData) => void;
  onMembersChange: (m: FamilyMemberRow[]) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitLabel?: string;
  isSubmitting?: boolean;
  mode?: 'admin' | 'member-request';
  onCancel?: () => void;
}

export function HouseholdForm({
  household,
  members,
  onHouseholdChange,
  onMembersChange,
  onSubmit,
  submitLabel = 'Save Household',
  isSubmitting,
  mode = 'admin',
  onCancel,
}: Props) {
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);
  
  const updateH = (field: keyof HouseholdFormData, value: any) => {
    onHouseholdChange({ ...household, [field]: value });
  };

  const nextStep = () => setCurrentStep(s => Math.min(2, s + 1));
  const prevStep = () => setCurrentStep(s => Math.max(0, s - 1));

  const steps = [
    { title: 'Basic Info', id: 0 },
    { title: 'Contact & Addresses', id: 1 },
    { title: 'Family Members', id: 2 }
  ];

  return (
    <div className="space-y-6">
      {/* Wizard Progress Indicator */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className={`flex flex-col items-center gap-2 ${currentStep === step.id ? 'text-primary' : currentStep > step.id ? 'text-primary/60' : 'text-gray-300'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-colors duration-300 ${currentStep === step.id ? 'border-primary bg-primary text-white shadow-md' : currentStep > step.id ? 'border-primary bg-primary/10 text-primary' : 'border-gray-200 bg-gray-50 text-gray-400'}`}>
                {currentStep > step.id ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                ) : (
                  step.id + 1
                )}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${currentStep === step.id ? 'font-bold' : ''}`}>{step.title}</span>
            </div>
            {index < steps.length - 1 && (
              <div className={`flex-1 h-1 mx-2 rounded-full transition-colors duration-300 ${currentStep > step.id ? 'bg-primary/30' : 'bg-gray-100'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      <form 
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.target as HTMLElement).tagName !== 'TEXTAREA' && (e.target as HTMLElement).tagName !== 'BUTTON') {
            e.preventDefault();
            if (currentStep < 2) {
              nextStep();
            } else {
              onSubmit(e as unknown as React.FormEvent);
            }
          }
        }}
        className="space-y-8 bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm relative min-h-[400px]"
      >
        {/* Step 0: Basic Info */}
        <div className={`transition-opacity duration-300 ${currentStep === 0 ? 'block animate-fade-in' : 'hidden'}`}>
          <h3 className="section-title mb-1">{t('householdDetails')}</h3>
          <p className="text-xs text-muted mb-6">{t('enterPrimaryHousehold') || 'Enter the primary household information.'}</p>
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
            <Input
              label={t('primaryMemberName')}
              value={household.primary_member_name}
              onChange={(e) => updateH('primary_member_name', e.target.value)}
              required
            />
            <Input
              label={t('householdCode')}
              value={household.household_code || ''}
              onChange={(e) => updateH('household_code', e.target.value)}
              placeholder="HH-DEL-001"
            />
            <Input
              label={t('nativePlace')}
              value={household.native_place || ''}
              onChange={(e) => updateH('native_place', e.target.value)}
            />
            <Input label={t('currentCity')} value={household.city || ''} onChange={(e) => updateH('city', e.target.value)} />
            <Input label={t('state')} value={household.state || ''} onChange={(e) => updateH('state', e.target.value)} />
            <Input label={t('country')} value={household.country || 'India'} onChange={(e) => updateH('country', e.target.value)} />
            
            <div className="md:col-span-2 pt-2">
              <label className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-100 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors w-fit">
                <input
                  type="checkbox"
                  checked={household.verified}
                  onChange={(e) => updateH('verified', e.target.checked)}
                  className="w-4 h-4 text-primary focus:ring-primary rounded border-gray-300"
                />
                <span className="text-sm font-medium text-gray-700">Mark as verified family record</span>
              </label>
            </div>
          </div>
        </div>

        {/* Step 1: Contact & Addresses */}
        <div className={`transition-opacity duration-300 ${currentStep === 1 ? 'block animate-fade-in' : 'hidden'}`}>
          <h3 className="section-title mb-1">{t('contactDetails')} & Addresses</h3>
          <p className="text-xs text-muted mb-6">Contact fields are private to approved members only.</p>
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
            <Input label={t('phoneLandline')} value={household.phone_number || ''} onChange={(e) => updateH('phone_number', e.target.value)} />
            <Input label={t('email')} type="email" value={household.email || ''} onChange={(e) => updateH('email', e.target.value)} />
            <PhoneInput label={t('mobile')} value={household.mobile_number || ''} onChange={(val) => updateH('mobile_number', val)} />
            <PhoneInput label={t('whatsapp')} value={household.whatsapp_number || ''} onChange={(val) => updateH('whatsapp_number', val)} />

            <div className="md:col-span-2 mt-4">
              <Textarea label="Residence Address" value={household.residence_address || ''} onChange={(e) => updateH('residence_address', e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <Textarea label="Business Address" value={household.business_address || ''} onChange={(e) => updateH('business_address', e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <Textarea label="Notes (private)" value={household.notes || ''} onChange={(e) => updateH('notes', e.target.value)} />
            </div>
          </div>
        </div>

        {/* Step 2: Family Members */}
        <div className={`transition-opacity duration-300 ${currentStep === 2 ? 'block animate-fade-in' : 'hidden'}`}>
          <h3 className="section-title mb-1">{t('familyMembersSection')}</h3>
          <p className="mb-6 text-xs text-muted">
            {t('startWithHead')}
          </p>
          <FamilyMemberRepeater
            members={members}
            onChange={onMembersChange}
            allowSelf={mode === 'admin'}
          />
          {mode === 'member-request' && (
            <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-xl">
              <p className="text-center text-sm font-medium text-primary">
                This will be submitted as a pending request for admin review. It will not appear in the family directory until approved.
              </p>
            </div>
          )}
        </div>

        {/* Dynamic Footer Actions */}
        <div className="flex items-center justify-between pt-8 mt-4 border-t border-gray-100">
          <div>
            {currentStep > 0 ? (
              <Button type="button" variant="secondary" onClick={prevStep} disabled={isSubmitting} className="rounded-full px-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 -ml-1"><path d="m15 18-6-6 6-6"/></svg>
                Back
              </Button>
            ) : (
              onCancel && (
                <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting} className="rounded-full px-6">
                  Cancel
                </Button>
              )
            )}
          </div>
          
          <div>
            {currentStep < 2 ? (
              <Button type="button" variant="primary" onClick={nextStep} disabled={!household.primary_member_name} className="rounded-full px-8 shadow-md">
                Next Step
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2 -mr-1"><path d="m9 18 6-6-6-6"/></svg>
              </Button>
            ) : (
              <Button 
                type="button" 
                variant="primary" 
                onClick={(e) => onSubmit(e as unknown as React.FormEvent)} 
                disabled={isSubmitting} 
                className="rounded-full px-8 shadow-lg"
              >
                {isSubmitting ? 'Saving...' : submitLabel}
                {!isSubmitting && <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2 -mr-1"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

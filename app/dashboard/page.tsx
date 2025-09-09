'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Heart, 
  Brain,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import CohortView from '@/components/Dashboard/CohortView';
import PatientDetail from '@/components/Dashboard/PatientDetail';
import ModelPerformance from '@/components/Charts/ModelPerformance';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('cohort');
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const tabs = [
    { id: 'cohort', label: 'Cohort Overview', icon: Users },
    { id: 'patient', label: 'Patient Detail', icon: Heart },
    { id: 'performance', label: 'Model Performance', icon: Brain }
  ];

  const handlePatientSelect = (patientId: string) => {
    setSelectedPatient(patientId);
    setActiveTab('patient');
  };

  const handleBackToCohort = () => {
    setActiveTab('cohort');
    setSelectedPatient(null);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'cohort':
        return (
          <CohortView 
            onPatientSelect={handlePatientSelect}
            selectedPatient={selectedPatient}
          />
        );
      case 'patient':
        return selectedPatient ? (
          <PatientDetail 
            patientId={selectedPatient}
            onBack={handleBackToCohort}
          />
        ) : (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Please select a patient from the cohort view</p>
          </div>
        );
      case 'performance':
        return <ModelPerformance />;
      default:
        return (
          <CohortView 
            onPatientSelect={handlePatientSelect}
            selectedPatient={selectedPatient}
          />
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-white border-r border-gray-200 transition-all duration-300`}>
        <div className="p-4">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <h1 className="text-xl font-bold text-gray-900">Healthcare AI</h1>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        
        <nav className="mt-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center px-4 py-3 text-left hover:bg-gray-100 transition-colors ${
                  activeTab === tab.id ? 'bg-blue-50 border-r-2 border-blue-500 text-blue-700' : 'text-gray-700'
                }`}
              >
                <Icon className="h-5 w-5" />
                {!sidebarCollapsed && (
                  <span className="ml-3 font-medium">{tab.label}</span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {tabs.find(tab => tab.id === activeTab)?.label}
            </h2>
            <p className="text-gray-600">
              {activeTab === 'cohort' && 'Monitor patient populations and risk distributions'}
              {activeTab === 'patient' && 'Detailed patient analysis and care recommendations'}
              {activeTab === 'performance' && 'AI model metrics and performance tracking'}
            </p>
          </div>
          
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import RiskBadge from '@/components/Dashboard/RiskBadge';
import EvidenceCard from '@/components/Dashboard/EvidenceCard';
import RecommendationCard from '@/components/Dashboard/RecommendationCard';
import TimelineChart from '@/components/Dashboard/TimelineChart';
import TopBar from '@/components/Dashboard/TopBar';
import { 
  Heart, 
  Activity, 
  Droplets, 
  Brain, 
  AlertCircle, 
  Clock, 
  User, 
  FileText, 
  MessageCircle, 
  Settings, 
  Menu,
  BookOpen,
  Apple,
  Pill,
  Calendar,
  Stethoscope,
  Send,
  Home,
  Target
} from 'lucide-react';

// Mock data for the dashboard
const mockPatient = {
  id: "SJ-2024-001",
  name: "Sarah Johnson",
  age: 45,
  mrn: "MRN-789456",
  riskLevel: "Medium" as const,
  lastVisit: "2024-03-15",
  riskScore: 72,
  conditions: [
    { name: "Type 2 Diabetes", risk: "Medium", score: 68, trend: "stable", trendValue: "No change" },
    { name: "Hypertension", risk: "High", score: 78, trend: "up", trendValue: "+5 points" },
    { name: "Heart Disease", risk: "Low", score: 32, trend: "down", trendValue: "-3 points" }
  ],
  vitals: {
    bloodPressure: "142/89",
    heartRate: 78,
    bloodSugar: 156,
    weight: 165
  }
};

const mockClinician = {
  name: "Dr. Michael Chen",
  role: "Primary Care Physician",
  department: "Internal Medicine"
};

const mockEvidence = [
  {
    title: "ADA Guidelines for Diabetes Management",
    description: "Current evidence supports HbA1c targets <7% for most adults with diabetes to reduce microvascular complications.",
    evidenceLevel: "A" as const,
    source: "American Diabetes Association, 2024",
    type: "guideline" as const,
    url: "#"
  },
  {
    title: "Framingham Heart Study Risk Assessment",
    description: "10-year cardiovascular risk calculation based on age, gender, cholesterol levels, and blood pressure readings.",
    evidenceLevel: "A" as const,
    source: "Framingham Heart Study, 2023",
    type: "study" as const,
    url: "#"
  },
  {
    title: "DASH Diet for Hypertension Control",
    description: "Dietary approaches to stop hypertension show significant reduction in systolic BP (8-14 mmHg reduction).",
    evidenceLevel: "B" as const,
    source: "NEJM Hypertension Research, 2023",
    type: "research" as const,
    url: "#"
  }
];

const mockRecommendations = [
  {
    title: "Reduce Sodium Intake",
    description: "Limit daily sodium to <2,300mg. Focus on fresh foods and read nutrition labels carefully.",
    category: "diet" as const,
    priority: "high" as const,
    timeframe: "Start immediately",
    completed: false
  },
  {
    title: "30-Minute Daily Walking",
    description: "Moderate aerobic exercise 5 days per week to improve cardiovascular health and glucose control.",
    category: "exercise" as const,
    priority: "high" as const,
    timeframe: "Begin this week",
    completed: false
  },
  {
    title: "Metformin Adherence Check",
    description: "Ensure consistent timing and dosage. Schedule medication review with pharmacist if needed.",
    category: "medication" as const,
    priority: "medium" as const,
    timeframe: "Next 2 weeks",
    completed: true
  },
  {
    title: "Blood Pressure Monitoring",
    description: "Daily home BP monitoring for 2 weeks, then 3x weekly. Log readings in health app.",
    category: "lifestyle" as const,
    priority: "high" as const,
    timeframe: "Start tomorrow",
    completed: false
  }
];

const mockTimelineEvents = [
  {
    date: "March 15, 2024",
    type: "assessment" as const,
    title: "Quarterly Health Assessment",
    description: "Comprehensive metabolic panel, HbA1c, and cardiovascular risk evaluation completed.",
    value: 7.2,
    trend: "stable" as const
  },
  {
    date: "February 28, 2024",
    type: "intervention" as const,
    title: "Nutrition Counseling Session",
    description: "Met with registered dietitian to develop personalized meal plan for diabetes management."
  },
  {
    date: "February 10, 2024",
    type: "alert" as const,
    title: "Elevated Blood Pressure Reading",
    description: "Home monitoring showed consistent readings >140/90. Medication adjustment recommended.",
    value: 148,
    trend: "up" as const
  },
  {
    date: "January 20, 2024",
    type: "milestone" as const,
    title: "Weight Loss Goal Achieved",
    description: "Successfully lost 10 pounds through dietary changes and increased physical activity.",
    value: 165,
    trend: "down" as const
  }
];

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: <Home className="w-5 h-5" /> },
    { id: 'risk-assessment', label: 'Risk Assessment', icon: <AlertCircle className="w-5 h-5" /> },
    { id: 'explainability', label: 'AI Insights', icon: <Brain className="w-5 h-5" /> },
    { id: 'evidence', label: 'Evidence', icon: <BookOpen className="w-5 h-5" /> },
    { id: 'recommendations', label: 'Recommendations', icon: <Target className="w-5 h-5" /> },
    { id: 'timeline', label: 'Timeline', icon: <Clock className="w-5 h-5" /> },
    { id: 'chat', label: 'Chat', icon: <MessageCircle className="w-5 h-5" /> },
    { id: 'audit', label: 'Audit Trail', icon: <FileText className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <TopBar 
        currentPatient={mockPatient}
        clinicianName={mockClinician.name}
        onPatientSelect={() => console.log('Patient selector clicked')}
        onNotifications={() => console.log('Notifications clicked')}
        onSettings={() => console.log('Settings clicked')}
      />
      
      <div className="flex">
        {/* Sidebar */}
        <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col min-h-[calc(100vh-73px)]`}>
          {/* Sidebar Header */}
          <div className="p-6 border-b border-gray-100">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="w-full justify-start text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            >
              <Menu className="w-5 h-5" />
              {!sidebarCollapsed && <span className="ml-3 font-medium">Menu</span>}
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <div className="space-y-1">
              {sidebarItems.map((item) => (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? "default" : "ghost"}
                  className={`w-full justify-start transition-all duration-200 ${
                    activeTab === item.id 
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm' 
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  onClick={() => setActiveTab(item.id)}
                >
                  {item.icon}
                  {!sidebarCollapsed && <span className="ml-3 font-medium">{item.label}</span>}
                </Button>
              ))}
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Patient Summary */}
                <div className="bg-white rounded-2xl border border-gray-200 p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Patient Overview</h2>
                    <div className="flex items-center space-x-3">
                      <Button variant="outline" size="sm" className="text-gray-600">
                        <FileText className="w-4 h-4 mr-2" />
                        Export Report
                      </Button>
                      <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        New Alert
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Vitals Cards */}
                    <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 border border-red-200">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center">
                          <Heart className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-red-800">Blood Pressure</h3>
                          <p className="text-xs text-red-600">Systolic/Diastolic</p>
                        </div>
                      </div>
                      <p className="text-3xl font-bold text-red-800">{mockPatient.vitals.bloodPressure}</p>
                      <p className="text-sm text-red-600 mt-1">mmHg</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                          <Activity className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-blue-800">Heart Rate</h3>
                          <p className="text-xs text-blue-600">Beats per minute</p>
                        </div>
                      </div>
                      <p className="text-3xl font-bold text-blue-800">{mockPatient.vitals.heartRate}</p>
                      <p className="text-sm text-blue-600 mt-1">bpm</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                          <Droplets className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-purple-800">Blood Sugar</h3>
                          <p className="text-xs text-purple-600">Glucose level</p>
                        </div>
                      </div>
                      <p className="text-3xl font-bold text-purple-800">{mockPatient.vitals.bloodSugar}</p>
                      <p className="text-sm text-purple-600 mt-1">mg/dL</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-6 border border-emerald-200">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-emerald-800">Weight</h3>
                          <p className="text-xs text-emerald-600">Current weight</p>
                        </div>
                      </div>
                      <p className="text-3xl font-bold text-emerald-800">{mockPatient.vitals.weight}</p>
                      <p className="text-sm text-emerald-600 mt-1">lbs</p>
                    </div>
                  </div>
                </div>
                
                {/* Risk Assessment Cards */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Risk Assessment Overview</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {mockPatient.conditions.map((condition, index) => (
                      <RiskBadge
                        key={index}
                        condition={condition.name}
                        score={condition.score}
                        level={condition.risk as 'Low' | 'Medium' | 'High'}
                        trend={condition.trend as 'up' | 'down' | 'stable'}
                        trendValue={condition.trendValue}
                        icon={
                          condition.name.includes('Diabetes') ? <Droplets className="w-5 h-5" /> :
                          condition.name.includes('Hypertension') ? <Heart className="w-5 h-5" /> :
                          <Activity className="w-5 h-5" />
                        }
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'risk-assessment' && (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Risk Assessment</h2>
                  <p className="text-gray-600">AI-powered chronic disease risk analysis</p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {mockPatient.conditions.map((condition, index) => (
                    <RiskBadge
                      key={index}
                      condition={condition.name}
                      score={condition.score}
                      level={condition.risk as 'Low' | 'Medium' | 'High'}
                      trend={condition.trend as 'up' | 'down' | 'stable'}
                      trendValue={condition.trendValue}
                      icon={
                        condition.name.includes('Diabetes') ? <Droplets className="w-5 h-5" /> :
                        condition.name.includes('Hypertension') ? <Heart className="w-5 h-5" /> :
                        <Activity className="w-5 h-5" />
                      }
                      className="h-full"
                    />
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'explainability' && (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">AI Model Insights</h2>
                  <p className="text-gray-600">Understanding the AI decision-making process</p>
                </div>
                
                <div className="bg-white rounded-2xl border border-gray-200 p-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                      <Brain className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">Model Confidence</h3>
                      <p className="text-gray-600">87% confidence in current assessment</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-4">Key Risk Factors</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                          <span className="text-sm text-gray-700">Elevated BP (142/89)</span>
                          <Badge className="bg-red-100 text-red-800 text-xs">+15 points</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                          <span className="text-sm text-gray-700">Age Factor (45 years)</span>
                          <Badge className="bg-amber-100 text-amber-800 text-xs">+8 points</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                          <span className="text-sm text-gray-700">BMI 30</span>
                          <Badge className="bg-amber-100 text-amber-800 text-xs">+12 points</Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-4">Protective Factors</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                          <span className="text-sm text-gray-700">No Smoking History</span>
                          <Badge className="bg-emerald-100 text-emerald-800 text-xs">-5 points</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                          <span className="text-sm text-gray-700">Regular Exercise</span>
                          <Badge className="bg-emerald-100 text-emerald-800 text-xs">-3 points</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                          <span className="text-sm text-gray-700">Medication Adherence</span>
                          <Badge className="bg-emerald-100 text-emerald-800 text-xs">-7 points</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'evidence' && (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Clinical Evidence</h2>
                  <p className="text-gray-600">Research supporting treatment recommendations</p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {mockEvidence.map((evidence, index) => (
                    <EvidenceCard
                      key={index}
                      title={evidence.title}
                      description={evidence.description}
                      evidenceLevel={evidence.evidenceLevel}
                      source={evidence.source}
                      type={evidence.type}
                      url={evidence.url}
                    />
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'recommendations' && (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Treatment Recommendations</h2>
                  <p className="text-gray-600">Personalized care plan</p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {mockRecommendations.map((recommendation, index) => (
                    <RecommendationCard
                      key={index}
                      title={recommendation.title}
                      description={recommendation.description}
                      category={recommendation.category}
                      priority={recommendation.priority}
                      timeframe={recommendation.timeframe}
                      completed={recommendation.completed}
                      onToggle={() => console.log(`Toggle recommendation ${index}`)}
                    />
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'timeline' && (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Patient Timeline</h2>
                  <p className="text-gray-600">Health journey and milestones</p>
                </div>
                
                <TimelineChart events={mockTimelineEvents} />
              </div>
            )}

            {activeTab === 'chat' && (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">AI Health Assistant</h2>
                  <p className="text-gray-600">Ask questions about patient care</p>
                </div>
                
                <div className="bg-white rounded-2xl border border-gray-200 p-8 h-96">
                  <div className="flex flex-col h-full">
                    <div className="flex-1 space-y-4 mb-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                          <Brain className="w-4 h-4 text-white" />
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 max-w-xs">
                          <p className="text-sm text-gray-700">Hello! I'm here to help you with questions about Sarah's care plan. What would you like to know?</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Input 
                        placeholder="Ask about patient care, medications, or treatment options..."
                        className="flex-1"
                      />
                      <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'audit' && (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Audit Trail</h2>
                  <p className="text-gray-600">System activity and compliance tracking</p>
                </div>
                
                <div className="bg-white rounded-2xl border border-gray-200 p-8">
                  <div className="space-y-4">
                    {[
                      { time: "2024-03-15 14:30", user: "Dr. Michael Chen", action: "Viewed patient risk assessment", type: "view" },
                      { time: "2024-03-15 14:25", user: "System", action: "Updated risk scores based on new lab results", type: "update" },
                      { time: "2024-03-15 14:20", user: "Dr. Michael Chen", action: "Added new medication recommendation", type: "create" },
                      { time: "2024-03-15 14:15", user: "Sarah Johnson", action: "Patient portal login", type: "login" },
                      { time: "2024-03-15 14:10", user: "System", action: "Automated risk assessment completed", type: "system" }
                    ].map((entry, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-2 h-2 rounded-full ${
                            entry.type === 'view' ? 'bg-blue-500' :
                            entry.type === 'update' ? 'bg-amber-500' :
                            entry.type === 'create' ? 'bg-emerald-500' :
                            entry.type === 'login' ? 'bg-purple-500' :
                            'bg-gray-500'
                          }`}></div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{entry.action}</p>
                            <p className="text-xs text-gray-500">{entry.user}</p>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">{entry.time}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

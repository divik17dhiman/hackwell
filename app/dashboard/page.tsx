'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Activity, 
  TrendingUp, 
  AlertTriangle, 
  Heart, 
  Brain,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';


const mockCohortData = {
  totalPatients: 1247,
  highRisk: 89,
  mediumRisk: 234,
  lowRisk: 924,
  avgRiskScore: 6.2,
  trendsData: [
    { month: 'Jan', highRisk: 76, mediumRisk: 198, lowRisk: 856 },
    { month: 'Feb', highRisk: 82, mediumRisk: 215, lowRisk: 889 },
    { month: 'Mar', highRisk: 89, mediumRisk: 234, lowRisk: 924 }
  ]
};

const mockPatients = [
  {
    id: 'P001',
    name: 'Sarah Johnson',
    age: 45,
    riskScore: 8.7,
    riskLevel: 'high',
    conditions: ['Type 2 Diabetes', 'Hypertension'],
    lastVisit: '2024-03-15',
    vitals: {
      bloodPressure: '145/92',
      glucose: '180 mg/dL',
      weight: '78 kg',
      heartRate: '88 bpm'
    },
    recommendations: [
      'Schedule endocrinologist consultation',
      'Increase medication adherence monitoring',
      'Implement dietary counseling'
    ]
  },
  {
    id: 'P002',
    name: 'Michael Chen',
    age: 62,
    riskScore: 7.3,
    riskLevel: 'high',
    conditions: ['Heart Failure', 'Diabetes'],
    lastVisit: '2024-03-18',
    vitals: {
      bloodPressure: '138/85',
      glucose: '165 mg/dL',
      weight: '85 kg',
      heartRate: '92 bpm'
    },
    recommendations: [
      'Cardiology follow-up required',
      'Monitor fluid retention',
      'Adjust ACE inhibitor dosage'
    ]
  },
  {
    id: 'P003',
    name: 'Emily Davis',
    age: 38,
    riskScore: 4.2,
    riskLevel: 'medium',
    conditions: ['Pre-diabetes'],
    lastVisit: '2024-03-20',
    vitals: {
      bloodPressure: '125/78',
      glucose: '110 mg/dL',
      weight: '68 kg',
      heartRate: '72 bpm'
    },
    recommendations: [
      'Lifestyle modification program',
      'Quarterly glucose monitoring',
      'Nutritionist referral'
    ]
  }
];

const mockModelPerformance = {
  accuracy: 94.2,
  precision: 91.8,
  recall: 89.5,
  f1Score: 90.6,
  lastUpdated: '2024-03-20',
  predictionsToday: 156,
  modelsRunning: 3,
  dataQuality: 96.8
};

function CohortOverview() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockCohortData.totalPatients}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{mockCohortData.highRisk}</div>
            <p className="text-xs text-muted-foreground">
              +8% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Medium Risk</CardTitle>
            <Activity className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{mockCohortData.mediumRisk}</div>
            <p className="text-xs text-muted-foreground">
              +5% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Risk Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockCohortData.avgRiskScore}</div>
            <p className="text-xs text-muted-foreground">
              -0.3 from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Risk Distribution Trends</CardTitle>
          <CardDescription>Patient risk levels over the last 3 months</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockCohortData.trendsData.map((data, index) => (
              <div key={data.month} className="flex items-center space-x-4">
                <div className="w-12 text-sm font-medium">{data.month}</div>
                <div className="flex-1 flex space-x-1">
                  <div 
                    className="bg-red-500 h-6 rounded-l" 
                    style={{ width: `${(data.highRisk / mockCohortData.totalPatients) * 100}%` }}
                  />
                  <div 
                    className="bg-yellow-500 h-6" 
                    style={{ width: `${(data.mediumRisk / mockCohortData.totalPatients) * 100}%` }}
                  />
                  <div 
                    className="bg-green-500 h-6 rounded-r" 
                    style={{ width: `${(data.lowRisk / mockCohortData.totalPatients) * 100}%` }}
                  />
                </div>
                <div className="text-sm text-muted-foreground w-16">
                  {data.highRisk + data.mediumRisk + data.lowRisk}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PatientDetail({ patient }: { patient: typeof mockPatients[0] }) {
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">{patient.name}</CardTitle>
              <CardDescription>Patient ID: {patient.id} • Age: {patient.age}</CardDescription>
            </div>
            <Badge className={getRiskColor(patient.riskLevel)}>
              {patient.riskLevel.toUpperCase()} RISK ({patient.riskScore})
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Conditions</h4>
              <div className="space-y-1">
                {patient.conditions.map((condition, index) => (
                  <Badge key={index} variant="outline">{condition}</Badge>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Last Visit</h4>
              <p className="text-sm text-muted-foreground">{patient.lastVisit}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current Vitals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <Heart className="h-6 w-6 mx-auto mb-2 text-red-500" />
              <div className="text-sm font-medium">Blood Pressure</div>
              <div className="text-lg font-bold">{patient.vitals.bloodPressure}</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Activity className="h-6 w-6 mx-auto mb-2 text-blue-500" />
              <div className="text-sm font-medium">Glucose</div>
              <div className="text-lg font-bold">{patient.vitals.glucose}</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-500" />
              <div className="text-sm font-medium">Weight</div>
              <div className="text-lg font-bold">{patient.vitals.weight}</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Heart className="h-6 w-6 mx-auto mb-2 text-purple-500" />
              <div className="text-sm font-medium">Heart Rate</div>
              <div className="text-lg font-bold">{patient.vitals.heartRate}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AI Recommendations</CardTitle>
          <CardDescription>Personalized care suggestions based on risk analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {patient.recommendations.map((rec, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                <Brain className="h-5 w-5 text-blue-600 mt-0.5" />
                <p className="text-sm">{rec}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ModelPerformance() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accuracy</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{mockModelPerformance.accuracy}%</div>
            <p className="text-xs text-muted-foreground">
              +2.1% from last week
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Precision</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{mockModelPerformance.precision}%</div>
            <p className="text-xs text-muted-foreground">
              +1.8% from last week
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recall</CardTitle>
            <Activity className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{mockModelPerformance.recall}%</div>
            <p className="text-xs text-muted-foreground">
              +1.2% from last week
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">F1 Score</CardTitle>
            <Brain className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{mockModelPerformance.f1Score}%</div>
            <p className="text-xs text-muted-foreground">
              +1.5% from last week
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Today's Activity</CardTitle>
          <CardDescription>Real-time model performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{mockModelPerformance.predictionsToday}</div>
              <p className="text-sm text-muted-foreground">Predictions Made</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{mockModelPerformance.modelsRunning}</div>
              <p className="text-sm text-muted-foreground">Models Running</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{mockModelPerformance.dataQuality}%</div>
              <p className="text-sm text-muted-foreground">Data Quality</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Model Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-medium">Diabetes Risk Predictor</h4>
                <p className="text-sm text-muted-foreground">Last updated: {mockModelPerformance.lastUpdated}</p>
              </div>
              <Badge className="bg-green-100 text-green-800">Active</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-medium">Heart Failure Classifier</h4>
                <p className="text-sm text-muted-foreground">Last updated: {mockModelPerformance.lastUpdated}</p>
              </div>
              <Badge className="bg-green-100 text-green-800">Active</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-medium">Medication Adherence Scorer</h4>
                <p className="text-sm text-muted-foreground">Last updated: {mockModelPerformance.lastUpdated}</p>
              </div>
              <Badge className="bg-green-100 text-green-800">Active</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('cohort');
  const [selectedPatient, setSelectedPatient] = useState(mockPatients[0]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const tabs = [
    { id: 'cohort', label: 'Cohort Overview', icon: Users },
    { id: 'patient', label: 'Patient Detail', icon: Heart },
    { id: 'performance', label: 'Model Performance', icon: Brain }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'cohort':
        return <CohortOverview />;
      case 'patient':
        return <PatientDetail patient={selectedPatient} />;
      case 'performance':
        return <ModelPerformance />;
      default:
        return <CohortOverview />;
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

        {/* Patient Quick Select */}
        {!sidebarCollapsed && activeTab === 'patient' && (
          <div className="mt-8 px-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Select</h3>
            <div className="space-y-2">
              {mockPatients.map((patient) => (
                <button
                  key={patient.id}
                  onClick={() => setSelectedPatient(patient)}
                  className={`w-full text-left p-2 rounded-lg text-sm transition-colors ${
                    selectedPatient.id === patient.id ? 'bg-blue-100 text-blue-900' : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="font-medium">{patient.name}</div>
                  <div className="text-xs text-gray-500">Risk: {patient.riskScore}</div>
                </button>
              ))}
            </div>
          </div>
        )}
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

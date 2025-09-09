"use client";

import React from 'react';
import { 
  Eye, 
  Heart, 
  Brain, 
  Activity, 
  Users, 
  Zap, 
  Target, 
  Globe,
  ArrowRight,
  Play
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';

export default function Homepage() {
  const router = useRouter();
  const healthMetrics = [
    {
      score: 80,
      title: "Vitamin D",
      subtitle: "Optimal",
      image: "https://images.pexels.com/photos/3768131/pexels-photo-3768131.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop"
    },
    {
      score: 93,
      title: "Heart Rate",
      subtitle: "Excellent", 
      image: "https://images.pexels.com/photos/3768997/pexels-photo-3768997.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop"
    },
    {
      score: 74,
      title: "Sleep Quality",
      subtitle: "Good",
      image: "https://images.pexels.com/photos/3771069/pexels-photo-3771069.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop"
    }
  ];

    const features = [
    {
      icon: <Eye className="w-6 h-6" />,
      title: "AI-Powered Health Analysis",
      description: "Advanced algorithms analyze your biomarkers to provide personalized health insights and recommendations."
    },
    {
      icon: <Brain className="w-6 h-6" />,
      title: "Predictive Health Intelligence", 
      description: "Machine learning models predict potential health risks before they become problems, enabling proactive care."
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Precision Medicine",
      description: "Tailored treatment plans based on your unique genetic profile, lifestyle, and health history."
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Global Health Network",
      description: "Connect with healthcare providers worldwide and access the latest medical research and treatments."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-50 px-6 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center">
              <Heart className="w-5 h-5 text-blue-900" />
            </div>
            <span className="text-white font-semibold text-lg">HealthFlow</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8 text-white/90">
            <a href="#" className="hover:text-white transition-colors">Platform</a>
            <a href="#" className="hover:text-white transition-colors">Research</a>
            <a href="#" className="hover:text-white transition-colors">About</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>

          <Button onClick={() => {router.push('/dashboard')}} className="bg-white text-gray-900 hover:bg-gray-100">
            Get Started
          </Button>
        </div>
      </nav>

            {/* Hero Section */}
      <div className="relative h-screen flex items-center">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('https://images.pexels.com/photos/3768131/pexels-photo-3768131.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop')`
          }}
        />
        
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="max-w-2xl">
            <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
              See Beyond.
              <br />
              Unlock Your Health
            </h1>
            
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Your body holds the answers — we help you see them.
            </p>

            <div className="flex items-center space-x-4">
              <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-4 text-lg">
                Start Your Journey
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4 text-lg">
                <Play className="w-5 h-5 mr-2" />
                Watch Demo
              </Button>
            </div>
          </div>
        </div>

        {/* Floating Health Cards - positioned relative to hero section */}
        <div className="absolute bottom-8 left-6 space-y-6 hidden lg:block z-20">
          <div className="flex items-center space-x-3 text-gray-400">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <Activity className="w-4 h-4 text-grey-400" />
            </div>
            <div>
              <div className="text-sm font-medium">Real-Time Analysis</div>
              <div className="text-xs text-white/70">Fast, actionable insights without long wait times</div>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-gray-400">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <Target className="w-4 h-4 text-gray-400" />
            </div>
            <div>
              <div className="text-sm font-medium">Personalized Health Insights</div>
              <div className="text-xs text-white/70">Tailored recommendations based on your unique biomarkers</div>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-gray-400">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <Heart className="w-4 h-4 text-gray-400" />
            </div>
            <div>
              <div className="text-sm font-medium">Holistic Health Monitoring</div>
              <div className="text-xs text-white/70">Combining physical, nutritional, and mental data for a complete picture</div>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Description */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-4xl">
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-8 leading-tight">
              A Predictive, Personalised Health Platform—for People and Practitioners.
            </h2>
          </div>
        </div>
      </section>

      {/* Health Metrics Cards */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {healthMetrics.map((metric, index) => (
              <Card key={index} className="overflow-hidden group hover:shadow-xl transition-all duration-300">
                <div className="relative h-64">
                  <img 
                    src={metric.image}
                    alt={metric.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  
                  {/* Score Badge */}
                  <div className="absolute top-4 left-4">
                    <div className="bg-white rounded-lg px-3 py-2">
                      <div className="text-2xl font-bold text-gray-900">{metric.score}</div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide">Score</div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h3 className="text-xl font-semibold mb-1">{metric.title}</h3>
                    <p className="text-white/90">{metric.subtitle}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

            {/* Statistics */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Anyone. Anywhere.
            </h2>
            <p className="text-xl text-gray-600">
              290+ markers, 160+ patterns.
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-100 transition-colors">
                  <div className="text-gray-700 group-hover:text-blue-700 transition-colors">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

            {/* Bottom Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                For Practitioners: No Waiting
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Get instant access to comprehensive health analytics and patient insights. No more waiting for lab results or manual analysis.
              </p>
            </div>

            <div className="lg:col-span-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Smarter Than Standalone Tests
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Our integrated approach combines multiple biomarkers and lifestyle factors for more accurate health assessments than traditional single tests.
              </p>
            </div>

            <div className="lg:col-span-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Delivered in Your Language
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Complex medical data translated into clear, actionable insights that both practitioners and patients can understand and act upon.
              </p>
            </div>

            <div className="lg:col-span-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Proven in Quantified Self
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Validated through extensive research and real-world applications in the quantified self movement and clinical practice.
              </p>
            </div>
          </div>
        </div>
      </section>

            {/* CTA Section */}
      <section className="py-24 bg-blue-900">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Health?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of people and practitioners who are already using our platform to unlock better health outcomes.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Button size="lg" className="bg-white text-blue-900 hover:bg-gray-100 px-8 py-4 text-lg">
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-900 px-8 py-4 text-lg">
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <span className="font-semibold text-lg">HealthFlow</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Empowering better health outcomes through advanced analytics and personalized insights.
              </p>
            </div>

                        <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Dashboard</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Analytics</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Reports</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Reference</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Research</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between">
            <p className="text-gray-400 text-sm">
              © 2025 HealthFlow. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Users className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Activity className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Globe className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

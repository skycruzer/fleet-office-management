"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity,
  BarChart3,
  LineChart,
  PieChart as PieChartIcon,
  TrendingUp,
  Users,
  Shield,
  AlertTriangle,
  Calendar,
  Zap,
  MousePointer2,
  Eye,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Import our enhanced components
import { FleetOverviewCardsEnhanced } from "@/components/dashboard/fleet-overview-cards-enhanced";
import { ComplianceOverviewChart } from "@/components/dashboard/charts/compliance-overview-chart";
import { PilotPerformanceChart } from "@/components/dashboard/charts/pilot-performance-chart";
import { CertificationTimelineChart } from "@/components/dashboard/charts/certification-timeline-chart";
import { DrillDownModal } from "@/components/dashboard/drill-down-modal";

/**
 * Interactive Demo Page
 * Showcases all the enhanced data visualization features with interactive examples
 */
export default function InteractiveDemoPage() {
  const [activeFeature, setActiveFeature] = React.useState<string>("overview");
  const [interactionCount, setInteractionCount] = React.useState(0);
  const [lastInteraction, setLastInteraction] = React.useState<string>("");

  const trackInteraction = (interaction: string) => {
    setInteractionCount(prev => prev + 1);
    setLastInteraction(interaction);
  };

  const features = [
    {
      id: "overview",
      name: "Enhanced Overview Cards",
      description: "Interactive metric cards with hover effects and mini-charts",
      icon: Activity,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    },
    {
      id: "compliance",
      name: "Compliance Analytics",
      description: "Interactive pie charts, timelines, and compliance tracking",
      icon: Shield,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    },
    {
      id: "performance",
      name: "Pilot Performance",
      description: "Scatter plots, age distributions, and performance metrics",
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
    },
    {
      id: "timeline",
      name: "Certification Timeline",
      description: "Timeline projections, alert summaries, and check type analysis",
      icon: Calendar,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
    },
    {
      id: "drilldown",
      name: "Drill-Down Capabilities",
      description: "Modal-based detailed exploration with filtering and search",
      icon: Eye,
      color: "text-teal-600",
      bgColor: "bg-teal-50",
      borderColor: "border-teal-200",
    },
  ];

  const interactionExamples = [
    "Hover over metric cards to see mini-charts",
    "Click on chart segments for detailed breakdowns",
    "Use tab navigation to explore different views",
    "Filter and search through data tables",
    "View real-time tooltips on chart elements",
    "Access drill-down modals for detailed analysis",
  ];

  return (
    <div className="min-h-screen bg-background p-6 space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Zap className="h-8 w-8 text-primary" />
          <h1 className="aviation-page-header">Interactive Data Visualization Demo</h1>
        </div>
        <p className="text-aviation-subtitle max-w-3xl mx-auto">
          Experience the enhanced Fleet Office Management dashboard with interactive charts,
          drill-down capabilities, hover effects, and real-time data exploration.
          All components follow FAA color standards for aviation compliance.
        </p>

        {/* Interaction Tracker */}
        <div className="flex items-center justify-center gap-4 p-4 bg-muted/20 rounded-lg border">
          <div className="flex items-center gap-2">
            <MousePointer2 className="h-4 w-4 text-primary" />
            <span className="text-aviation-sm font-medium">Interactions: {interactionCount}</span>
          </div>
          {lastInteraction && (
            <Badge variant="outline" className="text-aviation-xs">
              Last: {lastInteraction}
            </Badge>
          )}
        </div>
      </div>

      {/* Feature Navigation */}
      <Card>
        <CardHeader>
          <CardTitle className="aviation-section-header flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Interactive Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              const isActive = activeFeature === feature.id;

              return (
                <button
                  key={feature.id}
                  onClick={() => {
                    setActiveFeature(feature.id);
                    trackInteraction(`feature_${feature.id}_selected`);
                  }}
                  className={cn(
                    "p-4 rounded-lg border text-left space-y-2 transition-all duration-200",
                    "aviation-card-hover aviation-interactive",
                    isActive ? `${feature.bgColor} ${feature.borderColor} scale-105 shadow-md` : "hover:shadow-md"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Icon className={cn("h-5 w-5", isActive ? feature.color : "text-muted-foreground")} />
                    <span className={cn(
                      "font-medium text-aviation-sm",
                      isActive ? feature.color : ""
                    )}>
                      {feature.name}
                    </span>
                  </div>
                  <p className="text-aviation-xs text-muted-foreground">
                    {feature.description}
                  </p>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Demo Content */}
      <div className="space-y-8">
        {activeFeature === "overview" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="aviation-section-header">Enhanced Overview Cards</CardTitle>
                <p className="text-aviation-subtitle">
                  Hover over the metric cards below to see interactive mini-charts and enhanced visual feedback.
                  Click on cards for detailed drill-down views.
                </p>
              </CardHeader>
              <CardContent>
                <FleetOverviewCardsEnhanced />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-aviation-base">Key Interactive Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg border bg-muted/20">
                    <h4 className="font-medium text-aviation-sm mb-2">Hover Effects</h4>
                    <p className="text-aviation-xs text-muted-foreground">
                      Cards scale and show mini-charts when you hover over them
                    </p>
                  </div>
                  <div className="p-4 rounded-lg border bg-muted/20">
                    <h4 className="font-medium text-aviation-sm mb-2">Visual Feedback</h4>
                    <p className="text-aviation-xs text-muted-foreground">
                      Icons animate and colors respond to interactions
                    </p>
                  </div>
                  <div className="p-4 rounded-lg border bg-muted/20">
                    <h4 className="font-medium text-aviation-sm mb-2">Data Integration</h4>
                    <p className="text-aviation-xs text-muted-foreground">
                      Real-time data from Supabase with chart integration
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeFeature === "compliance" && (
          <div className="space-y-6">
            <ComplianceOverviewChart />
            <Card>
              <CardHeader>
                <CardTitle className="text-aviation-base">Compliance Features</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-aviation-sm">
                  <li className="flex items-center gap-2">
                    <PieChartIcon className="h-4 w-4 text-primary" />
                    Interactive pie charts with FAA color coding
                  </li>
                  <li className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    Timeline bar charts for expiry projection
                  </li>
                  <li className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    Real-time compliance status indicators
                  </li>
                  <li className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-primary" />
                    Tabbed interface for different compliance views
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        )}

        {activeFeature === "performance" && (
          <div className="space-y-6">
            <PilotPerformanceChart />
            <Card>
              <CardHeader>
                <CardTitle className="text-aviation-base">Performance Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-aviation-sm">
                  <li className="flex items-center gap-2">
                    <LineChart className="h-4 w-4 text-primary" />
                    Age distribution area charts
                  </li>
                  <li className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    Role-based performance metrics
                  </li>
                  <li className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    Service vs certification scatter plots
                  </li>
                  <li className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-primary" />
                    Fleet averages and performance summaries
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        )}

        {activeFeature === "timeline" && (
          <div className="space-y-6">
            <CertificationTimelineChart />
            <Card>
              <CardHeader>
                <CardTitle className="text-aviation-base">Timeline Features</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-aviation-sm">
                  <li className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    12-month certification expiry projection
                  </li>
                  <li className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    Check type distribution analysis
                  </li>
                  <li className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-primary" />
                    Automated alert summaries and recommendations
                  </li>
                  <li className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-primary" />
                    Stacked area charts with gradient fills
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        )}

        {activeFeature === "drilldown" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="aviation-section-header">Drill-Down Capabilities</CardTitle>
                <p className="text-aviation-subtitle">
                  Click the buttons below to experience interactive drill-down modals with detailed data exploration.
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <DrillDownModal
                    title="Compliance Details"
                    description="Detailed compliance analysis with filtering and search"
                    dataType="compliance"
                    triggerElement={
                      <Button
                        className="h-auto p-4 flex flex-col items-center gap-2 aviation-button-primary"
                        onClick={() => trackInteraction('compliance_drilldown_opened')}
                      >
                        <Shield className="h-6 w-6" />
                        <span>Compliance Analysis</span>
                      </Button>
                    }
                  />

                  <DrillDownModal
                    title="Urgent Actions Required"
                    description="Detailed view of all urgent certification actions"
                    dataType="urgent_actions"
                    triggerElement={
                      <Button
                        className="h-auto p-4 flex flex-col items-center gap-2 aviation-button-primary"
                        onClick={() => trackInteraction('urgent_actions_drilldown_opened')}
                      >
                        <AlertTriangle className="h-6 w-6" />
                        <span>Urgent Actions</span>
                      </Button>
                    }
                  />

                  <DrillDownModal
                    title="Pilot Performance Analysis"
                    description="Individual pilot performance metrics and comparisons"
                    dataType="pilot_performance"
                    triggerElement={
                      <Button
                        className="h-auto p-4 flex flex-col items-center gap-2 aviation-button-primary"
                        onClick={() => trackInteraction('pilot_performance_drilldown_opened')}
                      >
                        <Users className="h-6 w-6" />
                        <span>Pilot Performance</span>
                      </Button>
                    }
                  />

                  <DrillDownModal
                    title="Certification Overview"
                    description="Complete certification database with advanced filtering"
                    dataType="certifications"
                    triggerElement={
                      <Button
                        className="h-auto p-4 flex flex-col items-center gap-2 aviation-button-primary"
                        onClick={() => trackInteraction('certifications_drilldown_opened')}
                      >
                        <Calendar className="h-6 w-6" />
                        <span>All Certifications</span>
                      </Button>
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-aviation-base">Drill-Down Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-aviation-sm mb-3">Modal Features</h4>
                    <ul className="space-y-2 text-aviation-sm">
                      <li className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-primary" />
                        Full-screen modal interface
                      </li>
                      <li className="flex items-center gap-2">
                        <Settings className="h-4 w-4 text-primary" />
                        Advanced filtering and sorting
                      </li>
                      <li className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-primary" />
                        Summary charts and statistics
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-aviation-sm mb-3">Data Exploration</h4>
                    <ul className="space-y-2 text-aviation-sm">
                      <li className="flex items-center gap-2">
                        <MousePointer2 className="h-4 w-4 text-primary" />
                        Interactive data tables
                      </li>
                      <li className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-primary" />
                        Export capabilities
                      </li>
                      <li className="flex items-center gap-2">
                        <LineChart className="h-4 w-4 text-primary" />
                        Real-time search and filtering
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Interaction Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="aviation-section-header">Interaction Guide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {interactionExamples.map((example, index) => (
              <div
                key={index}
                className="p-3 rounded border bg-muted/10 flex items-start gap-2"
              >
                <MousePointer2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-aviation-sm">{example}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Technical Details */}
      <Card>
        <CardHeader>
          <CardTitle className="aviation-section-header">Technical Implementation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <h4 className="font-medium text-aviation-sm mb-2">Charting Library</h4>
              <p className="text-aviation-xs text-muted-foreground mb-2">Recharts 3.2.1</p>
              <ul className="text-aviation-xs text-muted-foreground space-y-1">
                <li>• React-native components</li>
                <li>• Responsive design</li>
                <li>• Animation support</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-aviation-sm mb-2">Color Standards</h4>
              <p className="text-aviation-xs text-muted-foreground mb-2">FAA Compliance</p>
              <ul className="text-aviation-xs text-muted-foreground space-y-1">
                <li>• Red for critical/expired</li>
                <li>• Yellow/Amber for warnings</li>
                <li>• Green for current/compliant</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-aviation-sm mb-2">Interactions</h4>
              <p className="text-aviation-xs text-muted-foreground mb-2">Enhanced UX</p>
              <ul className="text-aviation-xs text-muted-foreground space-y-1">
                <li>• Hover effects with charts</li>
                <li>• Click-through drill-downs</li>
                <li>• Tooltip interactions</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-aviation-sm mb-2">Performance</h4>
              <p className="text-aviation-xs text-muted-foreground mb-2">Optimized</p>
              <ul className="text-aviation-xs text-muted-foreground space-y-1">
                <li>• Lazy loading</li>
                <li>• Memoized components</li>
                <li>• Efficient data queries</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, BookOpen, Clock, Users, Award, Target, Wrench } from 'lucide-react';

interface BootcampProps {
  onNavigate: (page: string) => void;
}

export function Bootcamp({ onNavigate }: BootcampProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Header */}
      <header className="sticky top-0 bg-background/80 backdrop-blur-sm border-b border-border/50 z-10">
        <div className="container mx-auto px-4 py-4">
          <Button 
            variant="ghost" 
            onClick={() => onNavigate('landing')}
            className="mb-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-4 text-sm font-medium">
              🎓 Career Transformation Program
            </Badge>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-hero bg-clip-text text-transparent leading-tight">
              Welcome to Your New Career
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              Join our €900 2-week bootcamp today for just €500. Become a certified robotics technician 
              and be free to choose when you work, how you work, and make up to €5,000 per month.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button variant="hero" size="lg" className="text-lg px-8 py-6 h-auto">
                <Award className="mr-2 h-5 w-5" />
                Enroll Now - €500
              </Button>
              <div className="text-muted-foreground">
                <span className="line-through">€900</span> 
                <span className="ml-2 text-destructive font-semibold">Save €400!</span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-md mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">2 Weeks</div>
                <div className="text-sm text-muted-foreground">Duration</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">€5,000</div>
                <div className="text-sm text-muted-foreground">Monthly Potential</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">100%</div>
                <div className="text-sm text-muted-foreground">Job Ready</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Course Overview */}
      <section className="py-16 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Field Robotics Technician Training – Level 1</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Master the skills needed to work with autonomous service robots and launch your freelance career
            </p>
          </div>

          {/* Objectives */}
          <Card className="max-w-4xl mx-auto mb-12">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Course Objectives
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                  <span>Understand the structure and logic of autonomous service robots</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                  <span>Identify, test, and replace key components: sensors, motors, drivers, boards</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                  <span>Interpret system behavior using basic diagnostics tools</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                  <span>Gain confidence working with IPC, ECU, PDB, IMU, LiDAR, Sonars, Cameras</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                  <span>Learn the fundamentals of ROS, SLAM, and sensor fusion</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Course Modules */}
          <div className="grid gap-6 max-w-6xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Module 1: Introduction to Service Robotics
                  <Badge variant="outline" className="ml-auto">4 hours</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Topics:</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Types of service robots (cleaning, delivery, inspection, etc.)</li>
                      <li>• Typical architecture: IPC, ECU, PDB, actuators, and sensors</li>
                      <li>• Basic safety concepts, voltage ranges, brushless vs brushed motors</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Hands-On:</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Tear-down of a generic robot</li>
                      <li>• Identify parts: motor drivers, ECU, IPC, battery, fuse, connectors</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-primary" />
                  Module 2: Electronics & Control Units
                  <Badge variant="outline" className="ml-auto">8 hours</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Topics:</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• IPC (Industrial PC): role, common OS, connectivity</li>
                      <li>• PDB (Power Distribution Board): voltage regulation</li>
                      <li>• ECU (Electronic Control Unit): motor control, sensor input</li>
                      <li>• IMU: gyros, accelerometers, interpreting data</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Hands-On:</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Simulate replacing a failed ECU</li>
                      <li>• Multimeter testing: voltage, continuity, motor driver output</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Module 3: Sensors & Perception
                  <Badge variant="outline" className="ml-auto">12 hours</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Topics:</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• 2D & 3D LiDAR: how they work, FOV, range, mounting</li>
                      <li>• Depth Cameras / RGB-D: SLAM support, indoor use</li>
                      <li>• Sonars & Bumpers: obstacle detection, redundancy</li>
                      <li>• Wheel encoders: odometry, limitations</li>
                      <li>• IMU data fusion</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Hands-On:</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Connect and visualize LiDAR + camera data in RViz</li>
                      <li>• Mount and align a 2D LiDAR</li>
                      <li>• Replace a faulty sonar sensor and test it</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Module 4: Navigation & Localization
                  <Badge variant="outline" className="ml-auto">8 hours</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Topics:</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• VSLAM vs LiDAR SLAM vs Visual-Inertial Odometry</li>
                      <li>• Sensor fusion basics (LiDAR + IMU + Encoders)</li>
                      <li>• Limitations in GPS-denied environments</li>
                      <li>• Map building and localization concepts</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Hands-On:</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Run a VSLAM demo using open-source packages</li>
                      <li>• Simulate robot navigation using 2D LiDAR + encoders</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Module 5: Maintenance, Troubleshooting & ROS Basics
                  <Badge variant="outline" className="ml-auto">8 hours</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Topics:</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Overview of ROS: nodes, topics, tf</li>
                      <li>• Common failure points in robots</li>
                      <li>• Software update process</li>
                      <li>• Diagnostic tools (serial logs, LEDs, error codes)</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Hands-On:</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• SSH into IPC, view ROS nodes and logs</li>
                      <li>• Replace a vacuum motor and test driver feedback</li>
                      <li>• Install & configure ROS on Ubuntu</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* CTA */}
          <div className="text-center mt-16">
            <Card className="max-w-2xl mx-auto bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <h3 className="text-2xl font-bold mb-4">Ready to Start Your Journey?</h3>
                <p className="text-muted-foreground mb-6">
                  Join hundreds of successful graduates who are now earning €3,000-€5,000 monthly as freelance robotics technicians.
                </p>
                <Button variant="hero" size="lg" className="text-lg px-8 py-6 h-auto">
                  <Award className="mr-2 h-5 w-5" />
                  Secure Your Spot - €500
                </Button>
                <p className="text-sm text-muted-foreground mt-4">
                  Limited time offer. Regular price €900.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
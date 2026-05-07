import { Link } from "react-router";
import { 
  Shield, 
  Clock, 
  TrendingDown, 
  Network, 
  CheckCircle2, 
  ArrowRight,
  Camera,
  MapPin,
  Cloud
} from "lucide-react";
import { AlertTriangle } from "lucide-react";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import heroImg from '../../../assets/Gemini_Generated_Image_a4956ga4956ga495.png';

export default function Home() {
  const features = [
    {
      icon: Shield,
      title: "Improved Safety",
      description: "Early crack detection significantly reduces the risk of derailments and accidents",
    },
    {
      icon: Clock,
      title: "Real-Time Monitorinyg",
      description: "Enables immediate alerts and faster decision-making for maintenance teams",
    },
    {
      icon: TrendingDown,
      title: "Reduced Human Risk",
      description: "Minimizes the need for manual track inspections in dangerous environments",
    },
    {
      icon: Network,
      title: "Cost-Effective",
      description: "Prevents minor defects from developing into major infrastructure failures",
    },
  ];

  const detectionFeatures = [
    {
      icon: Camera,
      title: "Visual Capture",
      description: "Onboard camera captures clear images of defects",
    },
    {
      icon: MapPin,
      title: "GPS Tracking",
      description: "Precise location data for every detected issue",
    },
    {
      icon: Cloud,
      title: "Cloud Integration",
      description: "Instant data upload to monitoring dashboard",
    },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section
        className="relative text-white overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(to bottom right, rgba(15,23,42,0.8), rgba(2,6,23,0.7)), url(${heroImg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600/20 to-cyan-500/12 backdrop-blur-sm border border-cyan-600/30 rounded-full px-4 py-2 mb-6">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-white">IoT-Powered Railway Safety</span>
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Autonomous Railway Track
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
                  Crack Detection
                </span>
              </h1>
              
              <p className="text-xl text-slate-300 mb-8 leading-relaxed">
                Real-time monitoring system that detects track defects early, reducing accidents and maintenance costs through IoT automation.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/architecture"
                  className="relative inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-cyan-500 hover:to-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-transform transform hover:-translate-y-0.5 shadow-lg hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-cyan-300 group"
                >
                  <span className="absolute inset-0 rounded-lg bg-white/5 opacity-0 group-hover:opacity-20 transition-opacity" aria-hidden="true"></span>
                  <span className="inline-flex items-center gap-2 relative z-10">
                    See Architecture
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl blur-2xl opacity-20"></div>
              <div className="relative rounded-2xl shadow-2xl w-full h-72 md:h-96" aria-hidden="true"></div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-8 md:gap-24 lg:gap-32 auto-rows-min">
            {/* Challenge */}
            <div className="p-6 bg-white rounded-2xl shadow-lg border border-slate-200 min-h-0 flex flex-col justify-start">
              <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">The Challenge</span>
              <h3 className="text-2xl font-bold text-slate-900 mt-3 mb-3">Real-World Problem</h3>
              <p className="text-slate-600 text-lg mb-4">Railway track failures caused by cracks, wear, and structural defects are a major reason for train derailments and service disruptions worldwide.</p>

              <ul className="space-y-4">
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 text-lg">Manual Inspection Limitations</h4>
                    <p className="text-slate-600 text-base">Traditional methods are time-consuming, expensive, and expose workers to dangerous environments.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 text-lg">Early Detection Failures</h4>
                    <p className="text-slate-600 text-base">Often fail to detect small or early-stage cracks, allowing defects to worsen and increasing accident risk.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 text-lg">Slow Response Times</h4>
                    <p className="text-slate-600 text-base">Lack of real-time monitoring makes it difficult for teams to respond quickly and efficiently.</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Solution */}
            <div className="p-6 bg-gradient-to-br from-blue-50 to-slate-50 rounded-2xl shadow-lg border border-slate-200 min-h-0 flex flex-col justify-start">
              <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">Our Solution</span>
              <h3 className="text-2xl font-bold text-slate-900 mt-3 mb-3">Intelligent Detection System</h3>
              <p className="text-slate-600 text-lg mb-4">An autonomous IoT-based robot that continuously monitors railway tracks using advanced sensors and provides real-time alerts through cloud integration.</p>

              <div className="grid md:grid-cols-1 gap-4">
                {detectionFeatures.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div key={index} className="bg-white p-3 rounded-lg shadow-sm border border-slate-200 flex items-start gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Icon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 text-lg">{feature.title}</h4>
                        <p className="text-slate-600 text-base">{feature.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Impact */}
            <div className="p-6 bg-white rounded-2xl shadow-lg border border-slate-200 min-h-0 flex flex-col justify-start">
              <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">Impact</span>
              <h3 className="text-2xl font-bold text-slate-900 mt-3 mb-3">Key Benefits</h3>
              <p className="text-slate-600 text-lg mb-4">Our system delivers measurable improvements in safety, efficiency, and cost reduction.</p>

              <div className="grid md:grid-cols-2 lg:grid-cols-1 gap-4 mb-6">
                {features.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div key={index} className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center mb-0 shadow-lg">
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 text-lg">{feature.title}</h4>
                        <p className="text-slate-600 text-base">{feature.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-4 text-white">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-xl font-bold">24/7</div>
                    <p className="text-sm text-blue-100">Continuous Monitoring</p>
                  </div>
                  <div>
                    <div className="text-xl font-bold">95%+</div>
                    <p className="text-sm text-blue-100">Detection Accuracy</p>
                  </div>
                  <div>
                    <div className="text-xl font-bold">60%</div>
                    <p className="text-sm text-blue-100">Cost Reduction</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Scalability */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-5xl lg:text-6xl font-bold mb-6">Scalable Solution</h2>
              <p className="text-slate-300 text-xl mb-6 leading-relaxed">
                Designed to be deployed across large railway networks and seamlessly integrated with existing maintenance management systems.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-7 h-7 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-200 text-lg">Compatible with all standard gauge tracks</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-7 h-7 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-200 text-lg">Cloud-based centralized monitoring</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-7 h-7 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-200 text-lg">API integration with existing systems</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-7 h-7 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-200 text-lg">Modular design for easy maintenance</span>
                </li>
              </ul>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl blur-2xl opacity-20"></div>
              <div className="relative rounded-2xl shadow-2xl w-full h-64 md:h-80 lg:h-96 bg-transparent" aria-hidden="true"></div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-blue-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Learn More?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Explore the technical details, architecture, and implementation of this innovative solution.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/tech-stack"
              className="relative inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-cyan-500 hover:to-blue-600 text-white px-8 py-4 rounded-lg font-semibold transition-transform transform hover:-translate-y-0.5 shadow-lg hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-blue-300 group"
            >
              <span className="absolute inset-0 rounded-lg bg-white/5 opacity-0 group-hover:opacity-20 transition-opacity" aria-hidden="true"></span>
              <span className="inline-flex items-center gap-2 relative z-10">
                View Tech Stack
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

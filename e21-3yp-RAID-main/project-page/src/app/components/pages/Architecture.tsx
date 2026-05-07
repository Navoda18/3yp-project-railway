import { Layers, Database, Wifi, Cloud, Shield, Activity } from "lucide-react";
import systemArchImg from "../../../assets/system-arch.png";

export default function Architecture() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl font-bold mb-4">Solution Architecture</h1>
          <p className="text-xl text-blue-100 max-w-3xl">
            Comprehensive system design showcasing the interaction between hardware, software, and cloud components.
          </p>
        </div>
      </section>

      {/* High-Level Architecture */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-8">High-Level System Overview</h2>
          
          <div className="bg-white rounded-xl border border-slate-200 p-8 mb-8">
            <p className="text-slate-600 mb-8 leading-relaxed">
              The RailGuard system is built on a three-tier architecture consisting of the Edge Layer (robot hardware), 
              Communication Layer (IoT connectivity), and Cloud & Backend Layer (data processing and visualization). This design 
              ensures real-time data collection, reliable transmission, and comprehensive analysis via Java Spring Boot.
            </p>

            {/* Architecture Diagram Image */}
            <div className="mb-12 flex justify-center">
              <img 
                src={systemArchImg} 
                alt="System Architecture Diagram" 
                className="w-full max-w-4xl rounded-xl shadow-lg border border-slate-200"
              />
            </div>

            {/* Architecture Diagram */}
            <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-8 border-2 border-blue-200">
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Layer 1: Edge */}
                <div className="space-y-4">
                  <div className="text-center mb-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-3">
                      <Layers className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-bold text-lg text-slate-900">Edge Layer</h3>
                    <p className="text-sm text-slate-600">Physical Hardware</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
                      <div className="font-medium text-slate-900 text-sm mb-1">IR Sensors</div>
                      <div className="text-xs text-slate-600">Surface crack detection</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
                      <div className="font-medium text-slate-900 text-sm mb-1">Ultrasonic Sensors</div>
                      <div className="text-xs text-slate-600">Depth measurement</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
                      <div className="font-medium text-slate-900 text-sm mb-1">Camera Module</div>
                      <div className="text-xs text-slate-600">Visual documentation</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
                      <div className="font-medium text-slate-900 text-sm mb-1">GPS Module</div>
                      <div className="text-xs text-slate-600">Location tracking</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
                      <div className="font-medium text-slate-900 text-sm mb-1">ESP32 Controller</div>
                      <div className="text-xs text-slate-600">Data processing</div>
                    </div>
                  </div>
                </div>

                {/* Layer 2: Communication */}
                <div className="space-y-4">
                  <div className="text-center mb-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-3">
                      <Wifi className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-bold text-lg text-slate-900">Communication Layer</h3>
                    <p className="text-sm text-slate-600">Data Transmission</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
                      <div className="font-medium text-slate-900 text-sm mb-1">4G LTE Module</div>
                      <div className="text-xs text-slate-600">Primary connectivity</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
                      <div className="font-medium text-slate-900 text-sm mb-1">Wi-Fi Backup</div>
                      <div className="text-xs text-slate-600">Secondary connection</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
                      <div className="font-medium text-slate-900 text-sm mb-1">MQTT Protocol</div>
                      <div className="text-xs text-slate-600">Lightweight messaging</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
                      <div className="font-medium text-slate-900 text-sm mb-1">SSL/TLS Encryption</div>
                      <div className="text-xs text-slate-600">Secure transmission</div>
                    </div>
                  </div>
                </div>

                {/* Layer 3: Cloud & Backend */}
                <div className="space-y-4">
                  <div className="text-center mb-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600 rounded-full mb-3">
                      <Cloud className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-bold text-lg text-slate-900">Cloud & Backend</h3>
                    <p className="text-sm text-slate-600">Processing & Storage</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
                      <div className="font-medium text-slate-900 text-sm mb-1">AWS IoT Core</div>
                      <div className="text-xs text-slate-600">MQTT Broker</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
                      <div className="font-medium text-slate-900 text-sm mb-1">Java Spring Boot</div>
                      <div className="text-xs text-slate-600">Backend Processing</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
                      <div className="font-medium text-slate-900 text-sm mb-1">AWS DynamoDB & S3</div>
                      <div className="text-xs text-slate-600">NoSQL & Object Storage</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
                      <div className="font-medium text-slate-900 text-sm mb-1">React Web Dashboard</div>
                      <div className="text-xs text-slate-600">Frontend UI (Vite/Tailwind)</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
                      <div className="font-medium text-slate-900 text-sm mb-1">Supabase</div>
                      <div className="text-xs text-slate-600">Authentication</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Flow Arrows */}
              <div className="mt-6 flex justify-center items-center gap-4 text-sm text-slate-600">
                <span>Edge</span>
                <span className="text-2xl text-blue-600">→</span>
                <span>Communication</span>
                <span className="text-2xl text-blue-600">→</span>
                <span>Cloud & Backend</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Data Flow */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-8">Data Flow Architecture</h2>
          
          <div className="space-y-6">
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 mb-2">Data Acquisition</h3>
                  <p className="text-slate-600 text-sm mb-3">
                    Sensors continuously scan the railway track and collect data at 10Hz sampling rate. 
                    IR sensors detect surface anomalies while ultrasonic sensors measure depth variations.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                      IR Sensor Data
                    </span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                      Ultrasonic Data
                    </span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                      GPS Coordinates
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl border border-slate-200 p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 mb-2">Edge Processing</h3>
                  <p className="text-slate-600 text-sm mb-3">
                    ESP32 microcontroller performs initial data filtering and anomaly detection using threshold-based algorithms. 
                    When a potential crack is detected, the camera is triggered automatically.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      Noise Filtering
                    </span>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      Threshold Detection
                    </span>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      Image Capture
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl border border-slate-200 p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-amber-600 rounded-full flex items-center justify-center text-white font-bold">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 mb-2">Data Transmission</h3>
                  <p className="text-slate-600 text-sm mb-3">
                    Detected defects are packaged as JSON payloads and transmitted via MQTT over 4G LTE. 
                    Images are compressed before transmission to optimize bandwidth usage.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                      MQTT Protocol
                    </span>
                    <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                      Image Compression
                    </span>
                    <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                      SSL Encryption
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl border border-slate-200 p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  4
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 mb-2">Backend Processing</h3>
                  <p className="text-slate-600 text-sm mb-3">
                    AWS IoT Core routes data to a Java Spring Boot backend server. The backend processes the telemetry, 
                    handles imagery uploads, classifies defect severity, and persistently stores results in AWS DynamoDB and S3.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                      Java Spring Boot
                    </span>
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                      Data Processing
                    </span>
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                      DynamoDB Storage
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl border border-slate-200 p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-bold">
                  5
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 mb-2">Alert & Visualization</h3>
                  <p className="text-slate-600 text-sm mb-3">
                    A Next.js/React web dashboard streams data via WebSockets (STOMP) for real-time visualization on an 
                    interactive map. Critical defects trigger immediate UI alerts and log notifications for rapid response. User auth is handled via Supabase.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                      React Dashboard
                    </span>
                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                      WebSocket Streaming
                    </span>
                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                      Supabase Auth
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security Architecture */}
      <section className="py-16 bg-gradient-to-br from-slate-900 to-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-8">
            <Shield className="w-10 h-10 text-blue-400" />
            <h2 className="text-3xl font-bold">Security Architecture</h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6">
              <h3 className="font-semibold mb-3">Device Authentication</h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>• X.509 certificate-based authentication</li>
                <li>• Unique device identifiers</li>
                <li>• AWS IoT device registry</li>
              </ul>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6">
              <h3 className="font-semibold mb-3">Data Encryption</h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>• TLS 1.3 for data in transit</li>
                <li>• AES-256 encryption at rest</li>
                <li>• End-to-end encrypted communication</li>
              </ul>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6">
              <h3 className="font-semibold mb-3">Access Control</h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>• Role-based access control (RBAC)</li>
                <li>• Multi-factor authentication</li>
                <li>• Audit logging for all actions</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

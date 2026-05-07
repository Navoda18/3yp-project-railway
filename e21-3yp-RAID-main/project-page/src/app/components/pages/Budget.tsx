import { TrendingDown, Package } from "lucide-react";

export default function Budget() {
  const hardwareCosts = [
    {
      category: "Microcontroller & Camera",
      items: [
        { name: "ESP32 Development Board (Dual-Core 240MHz, 520KB SRAM, 4MB Flash)", unitPrice: 1340, quantity: 1, total: 1340 },
        { name: "ESP32-CAM Module (5MP, 1080p, 160° FOV, Night Vision IR)", unitPrice: 2190, quantity: 1, total: 2190 },
      ],
    },
    {
      category: "Sensors",
      items: [
        { name: "Ultrasonic Sensors HC-SR04 (Range: 2–400cm, 40kHz)", unitPrice: 230, quantity: 6, total: 1380 },
      ],
    },
    {
      category: "Motors & Mechanical",
      items: [
        { name: "DC Geared Motors / BO Motors 100-200 RPM (x4)", unitPrice: 1290, quantity: 4, total: 5160 },
        { name: "Motor Driver Module (L298N or L293D)", unitPrice: 440, quantity: 1, total: 440 },
        { name: "Robot Chassis Kit (Custom for rail line width)", unitPrice: 0, quantity: 1, total: 0 },
      ],
    },
    {
      category: "GPS",
      items: [
        { name: "GPS Module (±2.5m CEP, GPS/GLONASS/Galileo, 1–10Hz)", unitPrice: 2590, quantity: 1, total: 2590 },
      ],
    },
    {
      category: "Power System",
      items: [
        {
          name: "Rechargeable Battery - 12V 20Ah Li-ion (8–10h runtime, solar compatible 50W)",
          unitPrice: 8000,
          quantity: 1,
          total: 8000
        },
        { name: "Buck Converter DC-DC Step-Down Module", unitPrice: 1275, quantity: 1, total: 1275 },
      ],
    },
    {
      category: "Electronics & Wiring",
      items: [
        { name: "PCB / Mini Breadboard or Perfboard", unitPrice: 1000, quantity: 1, total: 1000 },
        { name: "Switch or Power Button", unitPrice: 85, quantity: 1, total: 85 },
      ],
    },
    {
      category: "Optional / Recommended",
      items: [
        { name: "Buzzer + 16x2 LCD Display with I2C", unitPrice: 1700, quantity: 1, total: 1700 },
        { name: "Micro SD Card Module", unitPrice: 330, quantity: 1, total: 330 },
        { name: "Other Components & Miscellaneous", unitPrice: 3000, quantity: 1, total: 3000 },
      ],
    },
  ];

  const calculateCategoryTotal = (category: any) => {
    return category.items.reduce((sum: number, item: any) => {
      return sum + (item.total || 0);
    }, 0);
  };

  const hardwareTotal = hardwareCosts.reduce((sum: number, category: any) => {
    return sum + calculateCategoryTotal(category);
  }, 0);

  return (
    <div className="min-h-screen bg-slate-50">

      {/* HEADER */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-5xl font-bold mb-4">Project Budget</h1>
        </div>
      </section>

      {/* TOTAL SUMMARY */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-blue-600 text-white p-6 rounded-xl w-full md:w-1/3">
            <Package className="w-10 h-10 mb-2 opacity-80" />
            <div className="text-sm">Hardware (Per Unit)</div>
            <div className="text-3xl font-bold">
              LKR {hardwareTotal.toLocaleString()}
            </div>
          </div>
        </div>
      </section>

      {/* DEPLOYMENT ANALYSIS */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">

          <h2 className="text-3xl font-bold mb-8 text-slate-900">
            Deployment Analysis (Sri Lanka Railway Coverage)
          </h2>

          <div className="space-y-4 text-slate-700">

            <div className="bg-slate-50 p-6 rounded-xl border">
              Sri Lanka railway network length is approximately{" "}
              <b>1,560 km</b>.
            </div>

            <div className="bg-slate-50 p-6 rounded-xl border">
              One robot can inspect around{" "}
              <b>40 km per day</b> (4 km/h × 10 hours operation).
            </div>

            <div className="bg-slate-50 p-6 rounded-xl border">
              <h3 className="font-semibold mb-2">Robot Requirement</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Full 1-day coverage → <b>40 robots</b> (~LKR 1,000,000)</li>
                <li>Weekly coverage → <b>6 robots</b> (~LKR 150,000)</li>
                <li>Recommended deployment → <b>12 robots</b> (~LKR 300,000)</li>
              </ul>
            </div>

            <div className="bg-blue-600 text-white p-6 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-5 h-5" />
                <h3 className="font-bold text-lg">Final Insight</h3>
              </div>
              <p className="text-sm opacity-90">
                A fleet-based system with load balancing enables full railway
                inspection coverage with scalable cost efficiency.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* HARDWARE TABLE */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">

          <h2 className="text-3xl font-bold mb-8">Hardware Components</h2>

          {hardwareCosts.map((category, i) => (
            <div key={i} className="mb-8">
              <h3 className="font-bold text-lg mb-3 text-slate-900">
                {category.category}
              </h3>

              <div className="space-y-2 text-sm">
                {category.items.map((item, j) => (
                  <div key={j} className="flex justify-between border-b pb-2">
                    <span>{item.name}</span>
                    <span>LKR {item.total}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="mt-8 bg-blue-600 text-white p-6 rounded-xl">
            <div className="flex justify-between">
              <span>Total Hardware Cost</span>
              <span className="font-bold text-xl">
                LKR {hardwareTotal.toLocaleString()}
              </span>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
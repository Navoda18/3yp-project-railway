const techCategories = [
  {
    title: "Embedded Systems",
    color: "bg-blue-50",
    grid: "grid-cols-1 md:grid-cols-3 lg:grid-cols-4",
    items: [
      {
        name: "ESP32",
        logo: "https://cdn.simpleicons.org/espressif/2564f2",
        desc: "Dual-core microcontroller with Wi-Fi/Bluetooth",
      },
      {
        name: "FreeRTOS",
        logo: "https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/C.svg",
        desc: "Real-time operating system for embedded devices",
      },
      {
        name: "PlatformIO",
        logo: "https://cdn.simpleicons.org/platformio/F6822B",
        desc: "Embedded development ecosystem",
      },
    ],
  },
  {
    title: "Hardware Components",
    color: "bg-gray-50",
    grid: "grid-cols-1 md:grid-cols-3 lg:grid-cols-4",
    items: [
      {
        name: "IR sensor array",
        logo: "",
        desc: "Infrared reflective sensor array for crack detection",
      },
      {
        name: "Ultrasonic sensor",
        logo: "",
        desc: "Distance measurement scanning sensor",
      },
      {
        name: "ESP32 camera",
        logo: "",
        desc: "Camera module for visual image capture",
      },
      {
        name: "GPS sensor",
        logo: "",
        desc: "High-precision location tracking module",
      },
    ],
  },
  {
    title: "Cloud & Backend",
    color: "bg-purple-50",
    grid: "grid-cols-1 md:grid-cols-3 lg:grid-cols-4",
    items: [
      {
        name: "Java Spring Boot",
        logo: "https://cdn.simpleicons.org/springboot/6DB33F",
        desc: "High-performance backend web framework",
      },
      {
        name: "AWS IoT Core",
        logo: "https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/AWS-Dark.svg",
        desc: "Secure device management and MQTT broker",
      },
      {
        name: "AWS DynamoDB",
        logo: "https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/DynamoDB-Dark.svg",
        desc: "NoSQL database for fast telemetry storage",
      },
      {
        name: "AWS S3",
        logo: "https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/AWS-Dark.svg",
        desc: "Object storage for incident imagery",
      },
      {
        name: "Supabase",
        logo: "https://cdn.simpleicons.org/supabase/3ECF8E",
        desc: "Open-source Firebase alternative (Authentication)",
      },
    ],
  },
  {
    title: "Web Dashboard",
    color: "bg-green-50",
    grid: "grid-cols-1 md:grid-cols-3 lg:grid-cols-4",
    items: [
      {
        name: "React",
        logo: "https://cdn.simpleicons.org/react/61DAFB",
        desc: "Frontend UI library",
      },
      {
        name: "TypeScript",
        logo: "https://cdn.simpleicons.org/typescript/3178C6",
        desc: "Strongly typed programming language",
      },
      {
        name: "Vite",
        logo: "https://cdn.simpleicons.org/vite/646CFF",
        desc: "Next-generation frontend tooling",
      },
      {
        name: "Tailwind CSS",
        logo: "https://cdn.simpleicons.org/tailwindcss/06B6D4",
        desc: "Utility-first styling framework",
      },
      {
        name: "STOMP / SockJS",
        logo: "https://cdn.simpleicons.org/socketdotio/010101",
        desc: "Real-time websocket streaming",
      },
    ],
  }
];

export default function TechStack() {

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 font-sans">
      <section className="bg-blue-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl font-extrabold mb-4 text-white tracking-tight text-left">Technology Stack</h1>
          <p className="text-lg text-white max-w-2xl text-left">
            Explore the modern technologies powering our IoT-based railway monitoring system.
          </p>
        </div>
      </section>
      {techCategories.map((cat) => (
        <section
          key={cat.title}
          className="py-16"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold mb-10 text-slate-900">{cat.title}</h2>
            <div className={`grid ${cat.grid} gap-8`}>
              {cat.items.map((item) => (
                <div
                  key={item.name}
                  className="flex flex-col items-center bg-white/70 backdrop-blur-md border border-slate-100 rounded-2xl shadow-lg p-6 transition hover:shadow-2xl hover:-translate-y-1"
                >
                  {/* Only remove icon for Hardware Components section */}
                  {cat.title === "Hardware Components" ? null : (
                    <img
                      src={item.logo}
                      alt={item.name}
                      className="w-14 h-14 object-contain mb-4"
                      loading="lazy"
                    />
                  )}
                  <div className="font-bold text-lg text-slate-900 mb-1 text-center">{item.name}</div>
                  <div className="text-sm text-slate-600 text-center">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}

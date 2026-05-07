import { Mail, Linkedin, Github, User } from "lucide-react";
import chamodiPhoto from "../../../assets/chamodi.png";
import navodaPhoto from "../../../assets/navoda.png";
import suviniPhoto from "../../../assets/suvini.png";
import tharushiPhoto from "../../../assets/tharushi.png";

export default function Team() {
  const teamMembers = [
    {
      name: "Chamodi Dileka",
      email: "e21096@eng.pdn.ac.lk",
      linkedin: "https://www.linkedin.com/in/chamodi-nethminie-83662a35a/",
      github: "https://github.com/Chamodi485",
      eportfolio: "https://www.thecn.com/ED706",
      photo: chamodiPhoto,
    },
    {
      name: "Navoda Erandi",
      email: "e21127@eng.pdn.ac.lk",
      linkedin: "https://www.linkedin.com/in/navoda-erandi-236077391/",
      github: "https://github.com/Navoda18",
      eportfolio: "https://www.thecn.com/NE459",
      photo: navodaPhoto,
    },
    {
      name: "Suvini Fonseka",
      email: "e21140@eng.pdn.ac.lk",
      linkedin: "https://www.linkedin.com/in/suvinirfonseka/",
      github: "https://github.com/suvini2001",
      eportfolio: "https://www.thecn.com/HF377",
      photo: suviniPhoto,
    },
    {
      name: "Tharushi Savindi",
      email: "e21363@eng.pdn.ac.lk",
      linkedin: "https://www.linkedin.com/in/tharushi-savindi-525736339/",
      github: "https://github.com/Tharushi-02",
      eportfolio: "https://www.thecn.com/TS2004",
      photo: tharushiPhoto,
    },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-50 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.12),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(16,185,129,0.12),transparent_32%),radial-gradient(circle_at_50%_100%,rgba(129,140,248,0.12),transparent_38%)]">
      

      <section className="py-20 relative">
        {/* Background decorative elements */}
        <div className="absolute top-20 right-10 h-64 w-64 rounded-full bg-blue-200/20 blur-[100px]" aria-hidden></div>
        <div className="absolute bottom-20 left-10 h-64 w-64 rounded-full bg-purple-200/20 blur-[100px]" aria-hidden></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
              Core Team Members
            </h2>
            <div className="h-1 w-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mx-auto"></div>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">
              Passionate engineers dedicated to innovation and excellence
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className="group relative bg-white rounded-3xl overflow-hidden border border-slate-200/60 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/0 to-purple-600/0 group-hover:from-blue-600/5 group-hover:to-purple-600/5 transition-all duration-500 pointer-events-none z-10"></div>
                
                {/* Top accent line */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                {/* Photo Section */}
                <div className="relative h-80 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
                  {member.photo ? (
                    <>
                      <img
                        src={member.photo}
                        alt={member.name}
                        className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-105"
                      />
                      {/* Overlay gradient on hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
                      <span className="text-6xl font-bold text-white">
                        {member.name.split(" ").map((n) => n[0]).join("")}
                      </span>
                    </div>
                  )}
                </div>

                {/* Details Section */}
                <div className="relative p-6 bg-gradient-to-br from-white to-slate-50/50">
                  {/* Name */}
                  <h3 className="text-xl font-bold text-slate-900 mb-5 tracking-tight leading-tight group-hover:text-blue-700 transition-colors duration-300">
                    {member.name}
                  </h3>

                  <div className="space-y-4">
                    {/* Divider */}
                    <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
                    
                    {/* Social Links */}
                    <div className="flex items-center justify-center gap-3 pt-1">
                      <a
                        href={`mailto:${member.email}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/link flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 text-slate-600 border border-slate-200 hover:border-red-300 hover:from-red-500 hover:to-red-600 hover:text-white transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-red-500/30"
                        title="Email"
                      >
                        <Mail className="w-5 h-5 transition-transform duration-300 group-hover/link:rotate-12" />
                      </a>
                      <a
                        href={member.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/link flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 text-slate-600 border border-slate-200 hover:border-blue-300 hover:from-blue-600 hover:to-blue-700 hover:text-white transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-blue-500/30"
                        title="LinkedIn"
                      >
                        <Linkedin className="w-5 h-5 transition-transform duration-300 group-hover/link:rotate-12" />
                      </a>
                      <a
                        href={member.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/link flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 text-slate-600 border border-slate-200 hover:border-slate-400 hover:from-slate-800 hover:to-slate-900 hover:text-white transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-slate-500/30"
                        title="GitHub"
                      >
                        <Github className="w-5 h-5 transition-transform duration-300 group-hover/link:rotate-12" />
                      </a>
                      {member.eportfolio && (
                        <a
                          href={member.eportfolio}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group/link flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 text-slate-600 border border-slate-200 hover:border-purple-300 hover:from-purple-600 hover:to-purple-700 hover:text-white transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-purple-500/30"
                          title="E-Portfolio"
                        >
                          <User className="w-5 h-5 transition-transform duration-300 group-hover/link:rotate-12" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom glow effect on hover */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional info section */}
      <section className="py-16 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px]" aria-hidden></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h3 className="text-3xl md:text-4xl font-bold">Let's Connect</h3>
          <p className="text-blue-200 text-lg leading-relaxed max-w-2xl mx-auto">
            Interested in our project or want to collaborate? Feel free to reach out to any of our team members.
          </p>
        </div>
      </section>
    </div>
  );
}

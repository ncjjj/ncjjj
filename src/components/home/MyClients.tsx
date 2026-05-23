"use client";

const clients = [
  { name: "Client A", role: "Startup Founder" },
  { name: "Client B", role: "Business Owner" },
  { name: "Client C", role: "Entrepreneur" },
  { name: "Client D", role: "NGO Head" },
  { name: "Client E", role: "CEO" },
  { name: "Client F", role: "CEO" },
  { name: "Client G", role: "CEO" },
  { name: "Client H", role: "CEO" },
  { name: "Client I", role: "CEO" },
];

export default function MyClients() {
  return (
    <section className="home-clients-section bg-[#f5e6c8] text-center" style={{ padding: "80px 0", overflow: "hidden", position: "relative", width: "100%" }}>

      {/* HEADING */}
      <h2 className="font-bold text-gray-800 text-3xl md:text-4xl mb-12" style={{ fontFamily: "Georgia, serif" }}>
        Inspiring Client Journeys ✨
      </h2>

      {/* CARDS SLIDESHOW */}
      <div 
        className="marquee-container" 
        style={{ 
          display: "flex", 
          overflow: "hidden", 
          gap: "24px", 
          width: "100%",
          position: "relative",
          padding: "20px 0"
        }}
      >
        {/* Left and right fade gradients */}
        <div 
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            width: "120px",
            background: "linear-gradient(to right, #f5e6c8, transparent)",
            zIndex: 10,
            pointerEvents: "none"
          }}
        />
        <div 
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            right: 0,
            width: "120px",
            background: "linear-gradient(to left, #f5e6c8, transparent)",
            zIndex: 10,
            pointerEvents: "none"
          }}
        />

        {/* Marquee Group 1 */}
        <div className="marquee-group" style={{ display: "flex", gap: "24px", flexShrink: 0 }}>
          {clients.map((client, idx) => (
            <div 
              key={`c1-${client.name}-${idx}`} 
              className="rounded-[30px] overflow-hidden shadow-xl bg-white transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl"
              style={{ width: "260px", flexShrink: 0 }}
            >
              <div className="h-[220px] bg-gray-300 flex items-center justify-center">
                <span className="text-gray-500">Image</span>
              </div>
              <div className="p-4 text-center">
                <h3 className="font-semibold text-gray-800 text-lg">{client.name}</h3>
                <p className="text-sm text-gray-500">{client.role}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Marquee Group 2 (Duplicate for infinite seamless loop) */}
        <div className="marquee-group" style={{ display: "flex", gap: "24px", flexShrink: 0 }} aria-hidden="true">
          {clients.map((client, idx) => (
            <div 
              key={`c2-${client.name}-${idx}`} 
              className="rounded-[30px] overflow-hidden shadow-xl bg-white transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl"
              style={{ width: "260px", flexShrink: 0 }}
            >
              <div className="h-[220px] bg-gray-300 flex items-center justify-center">
                <span className="text-gray-500">Image</span>
              </div>
              <div className="p-4 text-center">
                <h3 className="font-semibold text-gray-800 text-lg">{client.name}</h3>
                <p className="text-sm text-gray-500">{client.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Keyframe and animation styles */}
      <style>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-100% - 24px));
          }
        }
        .marquee-group {
          animation: marquee 50s linear infinite;
        }
        .marquee-container:hover .marquee-group {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}
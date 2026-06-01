import React from "react";

const Globe: React.FC = () => {
  return (
    <>
      <style>
        {`
          @keyframes floatBee {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(2deg); }
          }
          @keyframes pulseGlow {
            0%, 100% { filter: drop-shadow(0 0 20px rgba(250, 204, 21, 0.4)); }
            50% { filter: drop-shadow(0 0 40px rgba(250, 204, 21, 0.8)); }
          }
        `}
      </style>
      <div className="flex items-center justify-center h-screen w-full">
        <div 
          className="relative"
          style={{
            animation: "floatBee 6s ease-in-out infinite",
          }}
        >
          <div 
            className="w-[220px] h-[220px] sm:w-[320px] sm:h-[320px] flex items-center justify-center relative z-10"
            style={{ animation: "pulseGlow 4s ease-in-out infinite" }}
          >
            <img 
              src="/cybernetic_bee.png" 
              alt="VoltGuard Cybernetic Bee" 
              className="w-full h-full object-contain drop-shadow-[0_0_30px_rgba(250,204,21,0.5)] rounded-2xl"
            />
          </div>
          {/* Hexagon tech ring behind bee */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px] sm:w-[350px] sm:h-[350px] border border-[#ffcc00]/20 rounded-full animate-spin-slow" style={{ animationDuration: '20s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] sm:w-[450px] sm:h-[450px] border border-[#ffcc00]/10 rounded-full animate-reverse-spin" style={{ animation: 'spin 30s linear infinite reverse' }} />
        </div>
      </div>
    </>
  );
};

export default Globe;

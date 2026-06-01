'use client';
import React, { useEffect, useRef, useState, useCallback, useMemo } from "react"; 
import Globe from "@/components/ui/globe";
import { cn } from "@/lib/utils";
import { 
  ArrowRight, ShieldAlert, FileText, QrCode, 
  Terminal, Fingerprint, HelpCircle 
} from "lucide-react";

// Reusable ScrollGlobe component following shadcn/ui patterns
interface ScrollGlobeProps {
  sections: {
    id: string;
    badge?: string;
    title: string;
    subtitle?: string;
    description: string;
    align?: 'left' | 'center' | 'right';
    features?: { title: string; description: string }[];
    actions?: { label: string; variant: 'primary' | 'secondary'; onClick?: () => void }[];
  }[];
  globeConfig?: {
    positions: {
      top: string;
      left: string;
      scale: number;
    }[];
  };
  className?: string;
}

const defaultGlobeConfig = {
  positions: [
    { top: "50%", left: "75%", scale: 1.4 },  // Hero: Right side, balanced
    { top: "25%", left: "50%", scale: 0.9 },  // Quem somos: Top side, subtle
    { top: "15%", left: "90%", scale: 2 },    // Fluxo: Left side, medium
    { top: "50%", left: "50%", scale: 1.8 },  // Colaboradores: Center, large backdrop
    { top: "30%", left: "20%", scale: 1.2 },  // Recursos
    { top: "50%", left: "70%", scale: 1.5 },  // Cultura
    { top: "60%", left: "50%", scale: 2.2 },  // Final
  ]
};

// Parse percentage string to number
const parsePercent = (str: string): number => parseFloat(str.replace('%', ''));

function ScrollGlobe({ sections, globeConfig = defaultGlobeConfig, className }: ScrollGlobeProps) {
  const [activeSection, setActiveSection] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [globeTransform, setGlobeTransform] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);
  const animationFrameId = useRef<number | undefined>(undefined);
  
  const calculatedPositions = useMemo(() => {
    return globeConfig.positions.map(pos => ({
      top: parsePercent(pos.top),
      left: parsePercent(pos.left),
      scale: pos.scale
    }));
  }, [globeConfig.positions]);

  const updateScrollPosition = useCallback(() => {
    const scrollTop = window.pageYOffset;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = Math.min(Math.max(scrollTop / docHeight, 0), 1);
    
    setScrollProgress(progress);

    const viewportCenter = window.innerHeight / 2;
    let newActiveSection = 0;
    let minDistance = Infinity;

    sectionRefs.current.forEach((ref, index) => {
      if (ref) {
        const rect = ref.getBoundingClientRect();
        const sectionCenter = rect.top + rect.height / 2;
        const distance = Math.abs(sectionCenter - viewportCenter);
        
        if (distance < minDistance) {
          minDistance = distance;
          newActiveSection = index;
        }
      }
    });

    const currentPos = calculatedPositions[Math.min(newActiveSection, calculatedPositions.length - 1)];
    if(currentPos) {
      const transform = `translate3d(${currentPos.left}vw, ${currentPos.top}vh, 0) translate3d(-50%, -50%, 0) scale3d(${currentPos.scale}, ${currentPos.scale}, 1)`;
      setGlobeTransform(transform);
    }

    setActiveSection(newActiveSection);
  }, [calculatedPositions]);

  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        animationFrameId.current = requestAnimationFrame(() => {
          updateScrollPosition();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    updateScrollPosition(); 
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [updateScrollPosition]);

  useEffect(() => {
    const initialPos = calculatedPositions[0];
    const initialTransform = `translate3d(${initialPos.left}vw, ${initialPos.top}vh, 0) translate3d(-50%, -50%, 0) scale3d(${initialPos.scale}, ${initialPos.scale}, 1)`;
    setGlobeTransform(initialTransform);
  }, [calculatedPositions]);

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative w-full max-w-screen overflow-x-hidden min-h-screen bg-[#030304] text-white selection:bg-[#ffcc00] selection:text-black",
        className
      )}
    >
      {/* Import de fontes premium para visual corporativo de elite */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;700;900&family=JetBrains+Mono:wght@400;700&display=swap');
          
          .font-premium {
            font-family: 'Outfit', sans-serif;
          }
          .font-tech {
            font-family: 'JetBrains Mono', monospace;
          }
          
          /* Efeito de linhas de grade de alta precisão (HUD Industrial) */
          .hud-grid {
            background-size: 40px 40px;
            background-image: 
              linear-gradient(to right, rgba(255, 255, 255, 0.015) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255, 255, 255, 0.015) 1px, transparent 1px);
          }

          /* Detalhe de canto para cartões HUD */
          .hud-corner-element {
            position: absolute;
            width: 8px;
            height: 8px;
            border-color: rgba(255, 204, 0, 0.4);
            border-style: solid;
          }
        `}
      </style>

      {/* Grid HUD de Fundo */}
      <div className="absolute inset-0 hud-grid pointer-events-none z-0" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#030304] via-transparent to-[#030304] pointer-events-none z-0" />
      
      {/* Luzes de neon de profundidade */}
      <div className="absolute top-[20vh] left-[10vw] w-[35vw] h-[35vw] bg-yellow-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20vh] right-[10vw] w-[35vw] h-[35vw] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Barra de progresso de scroll de elite */}
      <div className="fixed top-0 left-0 w-full h-[3px] bg-white/[0.03] z-50">
        <div 
          className="h-full bg-gradient-to-r from-yellow-500 via-[#ffcc00] to-yellow-600 will-change-transform shadow-[0_0_12px_#ffcc00]"
          style={{ 
            transform: `scaleX(${scrollProgress})`,
            transformOrigin: 'left center',
            transition: 'transform 0.1s ease-out',
          }}
        />
      </div>

      {/* Navegação por Pontos (Estilo Cockpit) */}
      <div className="hidden sm:flex fixed right-4 sm:right-6 lg:right-10 top-1/2 -translate-y-1/2 z-40">
        <div className="space-y-4 lg:space-y-5">
          {sections.map((section, index) => (
            <div key={index} className="relative group flex items-center justify-end">
              <div
                className={cn(
                  "absolute right-8 px-3 py-1.5 rounded bg-[#090d14]/90 backdrop-blur-md border border-[#ffcc00]/20 shadow-2xl z-50 transition-all duration-300 font-tech text-[9px] uppercase tracking-wider whitespace-nowrap",
                  activeSection === index ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2 pointer-events-none"
                )}
              >
                <span className="text-[#ffcc00] font-bold mr-1.5">// {String(index + 1).padStart(2, '0')}</span>
                <span className="text-gray-300">{section.badge || 'Seção'}</span>
              </div>

              <button
                onClick={() => {
                  sectionRefs.current[index]?.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'center'
                  });
                }}
                className={cn(
                  "relative w-2.5 h-2.5 rounded-full transition-all duration-300",
                  activeSection === index 
                    ? "bg-[#ffcc00] ring-4 ring-[#ffcc00]/20 scale-125 shadow-[0_0_15px_#ffcc00]" 
                    : "bg-white/10 hover:bg-[#ffcc00]/40"
                )}
                aria-label={`Ir para ${section.badge || `seção ${index + 1}`}`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Renderização do Globe/Bee flutuante */}
      <div
        className="fixed z-10 pointer-events-none will-change-transform transition-all duration-[1200ms] ease-[cubic-bezier(0.25,1,0.25,1)]"
        style={{
          transform: globeTransform,
        }}
      >
        <div className="scale-75 sm:scale-90 lg:scale-100 relative group">
          {/* Efeitos extras de radar ao redor da abelha */}
          <div className="absolute inset-0 bg-gradient-to-tr from-yellow-500/10 to-transparent rounded-full filter blur-xl animate-pulse" />
          <Globe />
        </div>
      </div>

      {/* Seções de Scroll */}
      <div className="relative z-20 font-premium">
        {sections.map((section, index) => (
          <section
            key={section.id}
            ref={(el) => { sectionRefs.current[index] = el; }}
            className={cn(
              "relative min-h-screen flex flex-col justify-center px-6 sm:px-12 md:px-20 lg:px-32 py-16 sm:py-24",
              "w-full max-w-full overflow-hidden",
              section.align === 'center' && "items-center text-center",
              section.align === 'right' && "items-end text-right",
              section.align !== 'center' && section.align !== 'right' && "items-start text-left"
            )}
          >
            <div className="w-full max-w-sm sm:max-w-xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl">
              
              {/* Título & Subtítulo refinados */}
              <div className="space-y-4 mb-8">
                {section.subtitle && (
                  <div className="font-tech text-xs tracking-[0.35em] text-[#ffcc00] font-bold uppercase block">
                    {section.subtitle}
                  </div>
                )}
                
                <h1 className={cn(
                  "font-black tracking-tighter uppercase italic leading-[1.05]",
                  index === 0 
                    ? "text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl" 
                    : "text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl"
                )}>
                  <span className="bg-gradient-to-r from-white via-[#f3f4f6] to-[#a3a3a3] bg-clip-text text-transparent">
                    {section.title}
                  </span>
                </h1>
              </div>

              {/* Descrição limpa, espaçada e contrastante */}
              <div className={cn(
                "text-[#9ca3af] leading-relaxed mb-10 text-base sm:text-lg lg:text-xl font-light tracking-wide max-w-2xl",
                section.align === 'center' && "mx-auto"
              )}>
                <p>{section.description}</p>
                
                {/* Badges operacionais do Hero */}
                {index === 0 && (
                  <div className="flex flex-wrap gap-3 text-xs text-[#ffcc00]/80 mt-8 font-tech">
                    <div className="flex items-center gap-2 border border-[#ffcc00]/20 px-4 py-2 rounded bg-[#ffcc00]/5 backdrop-blur-sm shadow-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#ffcc00] animate-ping" />
                      <span className="uppercase tracking-widest text-[9px] font-bold">Rastreabilidade Ativa</span>
                    </div>
                    <div className="flex items-center gap-2 border border-white/5 px-4 py-2 rounded bg-white/[0.02] backdrop-blur-sm shadow-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
                      <span className="uppercase tracking-widest text-[9px] font-bold text-gray-400">Scroll para Explorar</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Grid de Features Refinado (HUD, sem caixas quadradas de IA genéricas) */}
              {section.features && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                  {section.features.map((feature, featureIndex) => (
                    <div 
                      key={feature.title}
                      className="group relative p-6 bg-[#090d14]/30 backdrop-blur-sm border border-white/[0.04] hover:border-[#ffcc00]/30 hover:bg-[#090d14]/60 transition-all duration-300 rounded-lg overflow-hidden"
                    >
                      {/* Elementos de canto HUD */}
                      <div className="hud-corner-element top-0 left-0 border-t-2 border-l-2" />
                      <div className="hud-corner-element top-0 right-0 border-t-2 border-r-2" />
                      <div className="hud-corner-element bottom-0 left-0 border-b-2 border-l-2" />
                      <div className="hud-corner-element bottom-0 right-0 border-b-2 border-r-2" />

                      <div className="flex items-start gap-4">
                        <div className="font-tech text-xs text-[#ffcc00] font-bold pt-1 opacity-60 group-hover:opacity-100 transition-opacity">
                          [{String(featureIndex + 1).padStart(2, '0')}]
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-bold text-white uppercase text-base tracking-wide group-hover:text-[#ffcc00] transition-colors">{feature.title}</h3>
                          <p className="text-gray-400 text-sm font-light leading-relaxed">{feature.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Botões Operacionais com Visual Premium Modificado */}
              {section.actions && (
                <div className={cn(
                  "flex flex-wrap gap-4 mt-6",
                  section.align === 'center' && "justify-center",
                  section.align === 'right' && "justify-end"
                )}>
                  {section.actions.map((action, actionIndex) => (
                    <button
                      key={action.label}
                      onClick={action.onClick}
                      className={cn(
                        "font-tech font-bold uppercase tracking-widest text-xs px-8 py-4.5 rounded transition-all duration-300 flex items-center gap-2.5",
                        action.variant === 'primary' 
                          ? "bg-[#ffcc00] text-black hover:bg-[#ffd633] shadow-[0_4px_25px_rgba(255,204,0,0.25)] hover:scale-[1.02] active:scale-[0.98]" 
                          : "border border-white/10 hover:border-[#ffcc00]/40 text-gray-300 hover:text-[#ffcc00] bg-white/[0.01]"
                      )}
                    >
                      <span>{action.label}</span>
                      <ArrowRight size={14} />
                    </button>
                  ))}
                </div>
              )}

            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

export default function BeeSystemHome() {
  const handleLoginRedirect = () => {
    window.location.href = '/login';
  };

  const pageSections = [
    {
      id: "hero",
      badge: "Início",
      title: "Ecossistema VoltGuard",
      subtitle: "GESTÃO LOGÍSTICA DE ALTO NÍVEL",
      description: "Controle oficial de operações, auditorias e recebimentos para a rede de distribuição VoltGuard.",
      align: "left" as const,
      actions: [
        { label: "Acessar Plataforma", variant: "primary" as const, onClick: handleLoginRedirect }
      ]
    },
    {
      id: "quem-somos",
      badge: "Sobre",
      title: "Segurança & Conformidade",
      subtitle: "DIRETRIZ DE PROTEÇÃO CORPORATIVA",
      description: "Rastreabilidade e proteção de ponta a ponta na cadeia de fornecimento de EPIs críticos.",
      align: "center" as const,
      features: [
        { title: "Validação Ativa", description: "Verificação automática de integridade." },
        { title: "Gestão de EPIs", description: "Controle e destinação inteligente de materiais." },
        { title: "Rastreabilidade QR Code", description: "Monitoramento 100% mapeado por unidade física." },
        { title: "Giro Inteligente", description: "Logística protegida contra perdas de validade." }
      ]
    },
    {
      id: "fluxo",
      badge: "Fluxo",
      title: "Ciclo Operacional",
      subtitle: "ESTRUTURA DE DADOS E MOVIMENTAÇÃO",
      description: "O BeeSystem atua ativamente em três pilares fundamentais da operação industrial.",
      align: "left" as const,
      features: [
        { title: "📥 Recebimento", description: "Endereçamento e validação automática via Scanner no ato da descarga." },
        { title: "📝 Pedidos de Saída", description: "Saídas de carga processadas de forma estrita via FIFO e alocação automática." },
        { title: "🛡️ Logs de Auditoria", description: "Histórico blindado de todas as movimentações e ações de operadores." }
      ]
    },
    {
      id: "colaboradores",
      badge: "Acesso",
      title: "Perfis Restritos",
      subtitle: "SEGREGREGREGAÇÃO DE DEVERES (RBAC)",
      description: "Acesso altamente restrito e blindado com base nos papéis operacionais autorizados.",
      align: "center" as const,
      features: [
        { title: "GERENTE", description: "Responsável por aprovações e análise gerencial de inventário." },
        { title: "VENDEDOR", description: "Geração de saídas, pedidos e despache rápido de produtos." },
        { title: "OFICIAL", description: "Operador de galpão focado em bipagem, scanner e endereçamento físico." }
      ]
    },
    {
      id: "acesso",
      badge: "Acesso",
      title: "Pronto para operar?",
      subtitle: "ACESSO RESTRITO VOLTGUARD",
      description: "Por favor, autentique-se para acessar o console operacional e registrar novas movimentações.",
      align: "center" as const,
      actions: [
        { label: "Entrar na Plataforma", variant: "primary" as const, onClick: handleLoginRedirect }
      ]
    }
  ];

  return (
    <ScrollGlobe 
      sections={pageSections}
    />
  );
}

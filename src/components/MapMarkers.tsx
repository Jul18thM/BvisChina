import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { projectToVector3 } from '../utils/geo';

interface Company {
  name: string;
  type: string;
  desc: string;
}

interface MarkerData {
  name: string;
  lat: number;
  lon: number;
  subtitle: string;
  height: number;
  align: 'left' | 'right';
  companies?: Company[];
}

interface TechMarkerProps extends MarkerData {
  isActive: boolean;
  isDimmed: boolean;
  onActivate: () => void;
  onDeactivate: () => void;
}

// 目标城市列表 (配置高度和对齐方式以防遮挡)
const TARGET_CITIES: MarkerData[] = [
  { 
    name: 'Beijing', 
    lat: 39.9042, 
    lon: 116.4074, 
    subtitle: 'Capital City', 
    height: 5.5, 
    align: 'right',
    companies: [
      { name: 'Xiaomi', type: 'Electronics', desc: 'Smartphones & IoT ecosystem giant.' },
      { name: 'JD.com', type: 'E-commerce', desc: 'Supply chain & logistics innovator.' },
      { name: 'Lenovo', type: 'Technology', desc: 'Global PC & infrastructure leader.' },
      { name: 'Baidu', type: 'AI & Search', desc: 'Autonomous driving & search engine.' }
    ]
  },
  { 
    name: 'Shanghai', 
    lat: 31.2304, 
    lon: 121.4737, 
    subtitle: 'Financial Hub', 
    height: 9, 
    align: 'right',
    companies: [
      { name: 'SAIC VW', type: 'Automotive', desc: 'Shanghai Volkswagen Automotive.' },
      { name: 'Baosteel', type: 'Materials', desc: 'Iron and steel conglomerate.' },
      { name: 'SAIC-GM', type: 'Automotive', desc: 'Joint venture in mobility innovation.' }
    ]
  },
  { 
    name: 'Suzhou', 
    lat: 31.2989, 
    lon: 120.5853, 
    subtitle: 'High-Tech Zone', 
    height: 4, 
    align: 'left',
    companies: [
      { name: 'Ecovacs', type: 'Robotics', desc: 'Service robotics & smart home.' },
      { name: 'iFlytek', type: 'AI', desc: 'Intelligent speech & AI processing.' },
      { name: 'AUO', type: 'Display', desc: 'AU Optronics display solutions.' },
      { name: 'Huawei', type: 'R&D', desc: 'ICT infrastructure research center.' },
      { name: 'GCL Group', type: 'Energy', desc: 'Green & clean energy services.' },
      { name: 'Siemens', type: 'Industrial', desc: 'Automation & digitalization.' },
      { name: 'Bosch', type: 'Automotive', desc: 'Mobility solutions & parts.' }
    ]
  },
  { 
    name: 'Hangzhou', 
    lat: 30.2741, 
    lon: 120.1551, 
    subtitle: 'Digital Center', 
    height: 6.5, 
    align: 'right',
    companies: [
      { name: 'Alibaba', type: 'Tech Giant', desc: 'Global e-commerce & cloud computing.' },
      { name: 'Geely', type: 'Automotive', desc: 'Mobility technology & EV innovation.' },
      { name: 'NetEase', type: 'Internet', desc: 'Content, gaming & communications.' },
      { name: 'Joyoung', type: 'Appliances', desc: 'Kitchen appliance pioneer.' },
      { name: 'Holley', type: 'Manufacturing', desc: 'Smart metering & health.' }
    ]
  },
  { 
    name: 'Shenzhen', 
    lat: 22.5431, 
    lon: 114.0579, 
    subtitle: 'Innovation Core', 
    height: 8.5, 
    align: 'right',
    companies: [
      { name: 'Tencent', type: 'Internet', desc: 'Social, gaming & fintech giant.' },
      { name: 'DJI', type: 'Robotics', desc: 'World leader in civilian drones.' },
      { name: 'Foxconn II', type: 'Smart Mfg', desc: 'Industrial Internet & manufacturing.' },
      { name: 'Ping An', type: 'Finance', desc: 'Tech-powered financial services.' },
      { name: 'CMB', type: 'Fintech', desc: 'China Merchants Bank.' }
    ]
  },
  { 
    name: 'Guangzhou', 
    lat: 23.1291, 
    lon: 113.2644, 
    subtitle: 'Southern Gate', 
    height: 4.5, 
    align: 'left',
    companies: [
      { name: 'Midea', type: 'Appliances', desc: 'Smart home appliances & HVAC.' }
    ]
  },
  { 
    name: 'Chengdu', 
    lat: 30.5728, 
    lon: 104.0668, 
    subtitle: 'Western Hub', 
    height: 5.5, 
    align: 'left',
    companies: [
      { name: 'FAW Toyota', type: 'Automotive', desc: 'Vehicle manufacturing base.' },
      { name: 'Volvo', type: 'Automotive', desc: 'Premium car manufacturing.' }
    ]
  },
  { 
    name: 'Chongqing', 
    lat: 29.5630, 
    lon: 106.5516, 
    subtitle: 'Mountain City', 
    height: 3.5, 
    align: 'left',
    companies: [
      { name: 'Jiangxiaobai', type: 'Beverage', desc: 'Youth-focused sorghum spirits.' }
    ]
  }
];

const TechMarker: React.FC<TechMarkerProps> = ({ 
  name, lat, lon, subtitle, height, align, companies, 
  isActive, isDimmed, onActivate, onDeactivate 
}) => {
  const position = projectToVector3(lon, lat);
  const ringRef = useRef<THREE.Group>(null);
  
  // Timeout ref to handle debounce
  const hoverTimeoutRef = useRef<any>(null);

  const handlePointerEnter = (e?: any) => {
    e?.stopPropagation();
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    onActivate();
  };

  const handlePointerLeave = (e?: any) => {
    e?.stopPropagation();
    // Add a small delay to check if user moved to the label or vice versa
    hoverTimeoutRef.current = setTimeout(() => {
      onDeactivate();
    }, 150);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);
  
  // Animation: Rotate outer ring
  useFrame(() => {
    if (ringRef.current) {
      ringRef.current.rotation.z -= 0.02;
    }
  });

  // Calculate beam geometry based on height
  const beamLength = height;
  const beamZ = height / 2;

  // Determine if we should show details
  const showDetails = isActive && companies && companies.length > 0;

  return (
    <group position={[position.x, position.y, 0]}>
      {/* Hit Area for interaction (Invisible Cylinder wrapping the beam AND base) */}
      <mesh 
        position={[0, 0, beamZ]} 
        rotation={[Math.PI / 2, 0, 0]}
        visible={false}
        onPointerOver={handlePointerEnter}
        onPointerOut={handlePointerLeave}
      >
        <cylinderGeometry args={[1.0, 1.0, beamLength, 8]} />
      </mesh>

      {/* 1. 地面目标定位圈 (Target Base) */}
      <group>
        {/* 核心实心点 */}
        <mesh position={[0, 0, 0.05]}>
          <circleGeometry args={[0.15, 32]} />
          <meshBasicMaterial color={showDetails ? "#ef4444" : "#3b82f6"} />
        </mesh>
        
        {/* 扩散光环 */}
        <mesh position={[0, 0, 0.02]}>
             <ringGeometry args={[0.2, 0.4, 32]} />
             <meshBasicMaterial color="#60a5fa" transparent opacity={0.5} />
        </mesh>

        {/* 旋转的装饰环 */}
        <group ref={ringRef}>
            <mesh position={[0, 0, 0.03]}>
                <ringGeometry args={[0.5, 0.55, 32, 1, 0, Math.PI * 1.5]} />
                <meshBasicMaterial color="#2563eb" transparent opacity={0.7} side={THREE.DoubleSide} />
            </mesh>
        </group>
      </group>

      {/* 2. 垂直引线 (Vertical Beam) */}
      <group>
         {/* 主光束 */}
         <mesh position={[0, 0, beamZ]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.03, 0.03, beamLength, 8]} />
            <meshBasicMaterial color={showDetails ? "#3b82f6" : "#60a5fa"} transparent opacity={0.9} />
         </mesh>
         
         {/* 底部光晕柱 */}
         <mesh position={[0, 0, 0.5]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.1, 0.0, 1, 8]} />
            <meshBasicMaterial color="#60a5fa" transparent opacity={0.4} depthWrite={false} />
         </mesh>
      </group>

      {/* 3. 悬浮信息标签 (Floating Label) */}
      <Html 
        position={[0, 0, height]} 
        center 
        distanceFactor={12} 
        zIndexRange={showDetails ? [100000000, 100000000] : (isDimmed ? [10, 0] : [100, 0])}
        style={{ pointerEvents: 'none', whiteSpace: 'nowrap' }} 
      >
        <div 
            // Enable interaction on the label itself
            onMouseEnter={handlePointerEnter}
            onMouseLeave={handlePointerLeave}
            className={`flex items-start transition-all duration-300 ease-in-out ${align === 'left' ? 'flex-row-reverse' : 'flex-row'}`}
            style={{ 
                pointerEvents: 'auto', 
                transform: align === 'left' 
                    ? 'translateX(-50%) translateX(-10px)' 
                    : 'translateX(50%) translateX(10px)',
                opacity: isDimmed ? 0.15 : 1, // Significantly reduce opacity of dimmed markers
                filter: isDimmed ? 'grayscale(100%) blur(1px)' : 'none', // Blur them slightly
                zIndex: showDetails ? 100000000 : 'auto'
            }}
        >
            {/* 连接线 */}
            <div className={`w-8 h-[1px] mt-3 bg-blue-500/70 shadow-[0_0_5px_rgba(59,130,246,0.8)] transition-all duration-300 ${showDetails ? 'bg-blue-600 w-12' : ''}`}></div>
            
            {/* 信息卡片 */}
            <div className={`
                relative bg-white/95 backdrop-blur-xl border-y border-blue-400/50 py-1.5 px-2.5 text-left shadow-[0_4px_20px_rgba(59,130,246,0.3)]
                transition-all duration-300 ease-out origin-top
                ${align === 'left' ? 'border-r-2 border-r-blue-500 pr-2.5' : 'border-l-2 border-l-blue-500 pl-2.5'}
                ${showDetails ? 'scale-105 z-50 min-w-[240px]' : 'scale-100 min-w-[100px]'}
            `}>
                {/* 装饰角标 */}
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/60 to-transparent"></div>
                
                {/* City Name */}
                <h1 className="text-base font-black text-gray-900 leading-none tracking-wide font-sans mb-0.5 drop-shadow-sm">
                    {name.toUpperCase()}
                </h1>

                {/* Normal View: Subtitle */}
                {!showDetails && (
                  <div className="flex items-center gap-1.5">
                       <div className="h-0.5 w-0.5 rounded-full bg-blue-500 animate-pulse"></div>
                       <p className="text-[8px] text-blue-600 font-mono uppercase tracking-[0.15em]">
                          {subtitle}
                      </p>
                  </div>
                )}

                {/* Expanded View: Company List */}
                {showDetails && (
                  <div className="mt-1.5 flex flex-col gap-1.5 max-h-[180px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-blue-400/50 scrollbar-track-blue-100">
                    {companies.map((company, idx) => (
                      <div key={idx} className="border-l-2 border-blue-300 pl-1.5 py-0.5 group">
                        <div className="flex justify-between items-baseline gap-1">
                          <span className="text-blue-600 font-bold text-[10px]">{company.name}</span>
                          <span className="text-[8px] text-gray-600 bg-blue-100 px-1 rounded">{company.type}</span>
                        </div>
                        <p className="text-[9px] text-gray-700 leading-tight mt-0.5 opacity-90">
                          {company.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
            </div>
        </div>
      </Html>
    </group>
  );
};

export const MapMarkers: React.FC = () => {
  const [activeMarker, setActiveMarker] = useState<string | null>(null);

  return (
    <group position={[0, 0, 1.25]}> 
      {TARGET_CITIES.map((city) => (
        <TechMarker 
            key={city.name} 
            {...city}
            isActive={activeMarker === city.name}
            isDimmed={activeMarker !== null && activeMarker !== city.name}
            onActivate={() => setActiveMarker(city.name)}
            onDeactivate={() => setActiveMarker((prev) => prev === city.name ? null : prev)}
        />
      ))}
    </group>
  );
};

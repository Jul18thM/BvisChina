import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Grid, ContactShadows } from '@react-three/drei';
import { ChinaMap } from './components/ChinaMap';

const App: React.FC = () => {
  return (
    <div className="w-full h-full relative bg-gradient-to-br from-blue-50 to-blue-100">
      
        {/* 
            Camera adjusted for a better 3D tilt:
            Position [0, 30, 45] looks from the South-Up, giving a nice isometric-like perspective.
        */}
        <Canvas
          camera={{ position: [0, 30, 45], fov: 40 }}
          shadows
          dpr={[1, 2]}
          gl={{ 
            antialias: true,
            powerPreference: "high-performance",
          }}
        >
          <color attach="background" args={['#eff6ff']} />
        
        <Suspense fallback={null}>
          <group position={[0, -1, 0]}>
             <ChinaMap />
          </group>
          
          {/* Aesthetic Environment */}
          <ambientLight intensity={0.8} color="#ffffff" />
          <directionalLight
            position={[10, 30, 20]}
            intensity={2.0}
            castShadow
            shadow-mapSize={[2048, 2048]}
            shadow-bias={-0.0001}
          />
          <pointLight position={[-20, 10, -10]} intensity={0.8} color="#3b82f6" />
          <pointLight position={[20, 10, 10]} intensity={0.8} color="#60a5fa" />

          {/* Grid Floor for Blueprint look */}
          <Grid
            position={[0, -1.1, 0]}
            args={[200, 200]}
            cellSize={2}
            cellThickness={0.5}
            cellColor="#dbeafe"
            sectionSize={10}
            sectionThickness={1}
            sectionColor="#93c5fd"
            fadeDistance={100}
            infiniteGrid
          />

          {/* Soft contact shadows for grounding */}
          <ContactShadows 
            position={[0, -1.15, 0]} 
            opacity={0.3} 
            scale={80} 
            blur={2} 
            far={10} 
            color="#3b82f6"
          />

          <Environment preset="city" />
        </Suspense>

        <OrbitControls
          makeDefault
          minPolarAngle={0}
          maxPolarAngle={Math.PI / 2.1} // Prevent going under the map
          enablePan={false}  // Disable panning (dragging map position)
          enableZoom={false} // Disable zooming
          enableRotate={false} // Disable rotation to fix the camera angle
          dampingFactor={0.05}
          maxDistance={150}
        />
      </Canvas>
    </div>
  );
};

export default App;
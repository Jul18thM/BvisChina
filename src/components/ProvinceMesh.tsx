import React, { useMemo } from 'react';
import { GeoJSONFeature } from '../types';
import { createShapesFromFeature } from '../utils/geo';
import { Edges } from '@react-three/drei';
import * as THREE from 'three';

interface ProvinceMeshProps {
  feature: GeoJSONFeature;
}

// 静态配置移到组件外部,避免重复创建
const EXTRUDE_SETTINGS = {
  depth: 1.2,
  bevelEnabled: true,
  bevelSegments: 4,
  bevelSize: 0.05,
  bevelThickness: 0.1,
};

// 预创建材质,避免每个省份都创建新材质
const sideMaterial = new THREE.MeshPhysicalMaterial({
  color: '#3b82f6',
  metalness: 0.2,
  roughness: 0.6,
  emissive: new THREE.Color('#2563eb'),
  emissiveIntensity: 0.2,
});

const topMaterial = new THREE.MeshPhysicalMaterial({
  color: '#60a5fa',
  metalness: 0.3,
  roughness: 0.4,
  clearcoat: 0.7,
  clearcoatRoughness: 0.2,
  reflectivity: 0.5,
  emissive: new THREE.Color('#93c5fd'),
  emissiveIntensity: 0.25,
});

export const ProvinceMesh: React.FC<ProvinceMeshProps> = React.memo(({ feature }) => {
  // 缓存几何形状
  const shapes = useMemo(() => createShapesFromFeature(feature), [feature]);

  // 缓存几何体参数
  const geometryArgs = useMemo(() => [shapes, EXTRUDE_SETTINGS] as const, [shapes]);

  return (
    <group>
      <mesh
        castShadow
        receiveShadow
      >
        <extrudeGeometry args={geometryArgs} />
        {/* 使用共享材质 */}
        <primitive object={sideMaterial} attach="material-0" />
        <primitive object={topMaterial} attach="material-1" />
        
        {/* Outline for the province */}
        <Edges
          linewidth={1.5}
          threshold={20} 
          color="#1e40af" 
          opacity={0.6}
          transparent
        />
      </mesh>
    </group>
  );
});
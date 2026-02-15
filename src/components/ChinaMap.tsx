import React, { useEffect, useState, useMemo } from 'react';
import { Center } from '@react-three/drei';
import { GeoJSON } from '../types';
import { ProvinceMesh } from './ProvinceMesh';
import { MapMarkers } from './MapMarkers';
import { LoadingScreen } from './LoadingScreen';

const DATA_URL = '/china-map.json';
const BATCH_SIZE = 5; // 每批渲染的省份数量

export const ChinaMap: React.FC = () => {
  const [data, setData] = useState<GeoJSON | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [visibleCount, setVisibleCount] = useState(0);

  // 加载 GeoJSON 数据
  useEffect(() => {
    const controller = new AbortController();
    
    fetch(DATA_URL, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch map data');
        return res.json();
      })
      .then((data) => {
        setData(data);
        setLoadingProgress(50); // 数据加载完成 50%
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          console.error('Failed to load geojson:', err);
        }
      });

    return () => controller.abort();
  }, []);

  // 渐进式渲染省份
  useEffect(() => {
    if (!data) return;
    
    const totalFeatures = data.features.length;
    
    if (visibleCount < totalFeatures) {
      const timer = setTimeout(() => {
        const nextCount = Math.min(visibleCount + BATCH_SIZE, totalFeatures);
        setVisibleCount(nextCount);
        
        // 更新加载进度 (50% - 100%)
        const renderProgress = 50 + (nextCount / totalFeatures) * 50;
        setLoadingProgress(renderProgress);
      }, 16); // 约 60fps 的间隔
      
      return () => clearTimeout(timer);
    }
  }, [data, visibleCount]);

  // 缓存要渲染的省份列表
  const visibleFeatures = useMemo(() => {
    if (!data) return [];
    return data.features.slice(0, visibleCount);
  }, [data, visibleCount]);

  // 显示加载状态
  if (!data || loadingProgress < 100) {
    return <LoadingScreen progress={loadingProgress} />;
  }

  return (
    <group rotation={[-Math.PI / 2, 0, 0]}>
      {/* 
         Rotate -90 on X to make the XY plane map lie on the XZ floor.
         Center disableZ ensures we center the Lat/Lon (X/Y) but keep the extrusion baseline (Z) at 0 relative to the group.
      */}
      <Center disableZ>
        <group>
            {visibleFeatures.map((feature, index) => (
            <ProvinceMesh
                key={feature.properties.adcode || index}
                feature={feature}
            />
            ))}
            
            {/* Markers must be inside Center so they align with the centered map geometry */}
            {visibleCount === data.features.length && <MapMarkers />}
        </group>
      </Center>
    </group>
  );
};
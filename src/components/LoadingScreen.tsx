import React from 'react';
import { Html } from '@react-three/drei';

interface LoadingScreenProps {
  progress?: number;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ progress = 0 }) => {
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center gap-4 p-8 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-blue-200">
        <div className="relative w-24 h-24">
          {/* 外圈旋转动画 */}
          <div className="absolute inset-0 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
          {/* 内圈脉冲动画 */}
          <div className="absolute inset-2 border-4 border-blue-100 rounded-full animate-pulse"></div>
          {/* 中心点 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full shadow-lg"></div>
          </div>
        </div>
        
        <div className="text-center">
          <h3 className="text-xl font-bold text-gray-800 mb-1">加载中国地图</h3>
          <p className="text-sm text-gray-600">正在构建 3D 场景...</p>
          
          {progress > 0 && (
            <div className="mt-4 w-48">
              <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">{Math.round(progress)}%</p>
            </div>
          )}
        </div>
      </div>
    </Html>
  );
};

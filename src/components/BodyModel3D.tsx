'use client';

import { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Environment, Line } from '@react-three/drei';
import * as THREE from 'three';

// 骨骼点数据
interface BonePoint {
  id: string;
  name: string;
  position: [number, number, number];
  color: string;
  isIssue?: boolean;
  severity?: 'mild' | 'moderate' | 'severe';
}

// 骨骼连接
interface BoneConnection {
  from: string;
  to: string;
  color: string;
}

// 默认骨骼数据 - 模拟人体骨骼
const DEFAULT_BONE_POINTS: BonePoint[] = [
  // 头部
  { id: 'head', name: '头部', position: [0, 1.6, 0], color: '#f0f0f0' },
  { id: 'nose', name: '鼻子', position: [0, 1.55, 0.1], color: '#f0f0f0' },
  { id: 'left_eye', name: '左眼', position: [-0.05, 1.58, 0.08], color: '#f0f0f0' },
  { id: 'right_eye', name: '右眼', position: [0.05, 1.58, 0.08], color: '#f0f0f0' },
  { id: 'left_ear', name: '左耳', position: [-0.1, 1.57, 0], color: '#f0f0f0' },
  { id: 'right_ear', name: '右耳', position: [0.1, 1.57, 0], color: '#f0f0f0' },
  
  // 肩部
  { id: 'left_shoulder', name: '左肩', position: [-0.2, 1.35, 0], color: '#6366f1' },
  { id: 'right_shoulder', name: '右肩', position: [0.2, 1.35, 0], color: '#6366f1' },
  
  // 肘部
  { id: 'left_elbow', name: '左肘', position: [-0.35, 1.1, 0], color: '#22c55e' },
  { id: 'right_elbow', name: '右肘', position: [0.35, 1.1, 0], color: '#22c55e' },
  
  // 手腕
  { id: 'left_wrist', name: '左腕', position: [-0.4, 0.85, 0], color: '#eab308' },
  { id: 'right_wrist', name: '右腕', position: [0.4, 0.85, 0], color: '#eab308' },
  
  // 髋部
  { id: 'left_hip', name: '左髋', position: [-0.15, 0.9, 0], color: '#a855f7' },
  { id: 'right_hip', name: '右髋', position: [0.15, 0.9, 0], color: '#a855f7' },
  
  // 膝盖
  { id: 'left_knee', name: '左膝', position: [-0.15, 0.5, 0], color: '#f97316' },
  { id: 'right_knee', name: '右膝', position: [0.15, 0.5, 0], color: '#f97316' },
  
  // 踝关节
  { id: 'left_ankle', name: '左踝', position: [-0.15, 0.1, 0], color: '#06b6d4' },
  { id: 'right_ankle', name: '右踝', position: [0.15, 0.1, 0], color: '#06b6d4' },
  
  // 脊柱点
  { id: 'spine_top', name: '颈胸交界', position: [0, 1.45, -0.05], color: '#94a3b8' },
  { id: 'spine_mid', name: '胸腰交界', position: [0, 1.1, -0.03], color: '#94a3b8' },
  { id: 'spine_bottom', name: '腰骶交界', position: [0, 0.95, -0.02], color: '#94a3b8' },
];

// 骨骼连接关系
const BONE_CONNECTIONS: BoneConnection[] = [
  // 头部
  { from: 'head', to: 'nose', color: '#d1d5db' },
  { from: 'head', to: 'left_eye', color: '#d1d5db' },
  { from: 'head', to: 'right_eye', color: '#d1d5db' },
  { from: 'head', to: 'left_ear', color: '#d1d5db' },
  { from: 'head', to: 'right_ear', color: '#d1d5db' },
  
  // 躯干
  { from: 'left_shoulder', to: 'right_shoulder', color: '#6366f1' },
  { from: 'left_shoulder', to: 'spine_top', color: '#94a3b8' },
  { from: 'right_shoulder', to: 'spine_top', color: '#94a3b8' },
  { from: 'spine_top', to: 'spine_mid', color: '#94a3b8' },
  { from: 'spine_mid', to: 'spine_bottom', color: '#94a3b8' },
  { from: 'left_hip', to: 'right_hip', color: '#a855f7' },
  { from: 'spine_bottom', to: 'left_hip', color: '#94a3b8' },
  { from: 'spine_bottom', to: 'right_hip', color: '#94a3b8' },
  
  // 左臂
  { from: 'left_shoulder', to: 'left_elbow', color: '#22c55e' },
  { from: 'left_elbow', to: 'left_wrist', color: '#eab308' },
  
  // 右臂
  { from: 'right_shoulder', to: 'right_elbow', color: '#22c55e' },
  { from: 'right_elbow', to: 'right_wrist', color: '#eab308' },
  
  // 左腿
  { from: 'left_hip', to: 'left_knee', color: '#f97316' },
  { from: 'left_knee', to: 'left_ankle', color: '#06b6d4' },
  
  // 右腿
  { from: 'right_hip', to: 'right_knee', color: '#f97316' },
  { from: 'right_knee', to: 'right_ankle', color: '#06b6d4' },
];

// 骨骼点组件
function BonePoint({ point, onClick }: { point: BonePoint; onClick: (point: BonePoint) => void }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  // 根据严重程度调整颜色
  const pointColor = useMemo(() => {
    if (point.isIssue) {
      if (point.severity === 'severe') return '#ef4444';
      if (point.severity === 'moderate') return '#f97316';
      return '#eab308';
    }
    return point.color;
  }, [point]);
  
  // 悬停动画
  useFrame(() => {
    if (meshRef.current) {
      if (hovered) {
        meshRef.current.scale.lerp(new THREE.Vector3(1.5, 1.5, 1.5), 0.1);
      } else {
        meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
      }
    }
  });
  
  return (
    <mesh
      ref={meshRef}
      position={point.position}
      onClick={() => onClick(point)}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <sphereGeometry args={[0.02, 16, 16]} />
      <meshStandardMaterial color={pointColor} emissive={pointColor} emissiveIntensity={hovered ? 0.5 : 0.2} />
      {hovered && (
        <Html distanceFactor={10} position={[0, 0.05, 0]} center>
          <div className="bg-white/90 px-2 py-1 rounded shadow text-xs whitespace-nowrap">
            {point.name}
            {point.isIssue && <span className="ml-1 text-red-500">⚠</span>}
          </div>
        </Html>
      )}
    </mesh>
  );
}

// 骨骼连接组件
function BoneLine({ from, to, points, color }: { from: string; to: string; points: BonePoint[]; color: string }) {
  const fromPoint = points.find(p => p.id === from);
  const toPoint = points.find(p => p.id === to);
  
  if (!fromPoint || !toPoint) return null;
  
  return (
    <Line
      points={[fromPoint.position, toPoint.position]}
      color={color}
      lineWidth={2}
    />
  );
}

// 整体模型旋转
function ModelRotator({ children }: { children: React.ReactNode }) {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      // 轻微的自动旋转
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
    }
  });
  
  return <group ref={groupRef}>{children}</group>;
}

// 主组件
interface BodyModel3DProps {
  issues?: { type: string; severity: string }[];
  onPointClick?: (point: BonePoint) => void;
  className?: string;
}

export default function BodyModel3D({ issues = [], onPointClick, className = '' }: BodyModel3DProps) {
  // 根据问题更新骨骼点颜色
  const bonePoints = useMemo(() => {
    return DEFAULT_BONE_POINTS.map(point => {
      // 检查是否有相关问题
      const relatedIssue = issues.find(issue => {
        const issueToBoneMap: Record<string, string[]> = {
          forward_head: ['head', 'nose'],
          elevated_shoulder: ['left_shoulder', 'right_shoulder'],
          rounded_shoulder: ['left_shoulder', 'right_shoulder'],
          anterior_pelvic_tilt: ['left_hip', 'right_hip', 'spine_bottom'],
          genu_recuvatum: ['left_knee', 'right_knee'],
          flat_foot: ['left_ankle', 'right_ankle'],
        };
        return issueToBoneMap[issue.type]?.includes(point.id);
      });
      
      if (relatedIssue) {
        return {
          ...point,
          isIssue: true,
          severity: relatedIssue.severity as 'mild' | 'moderate' | 'severe',
        };
      }
      
      return point;
    });
  }, [issues]);
  
  const handlePointClick = (point: BonePoint) => {
    if (onPointClick) {
      onPointClick(point);
    }
  };
  
  return (
    <div className={`w-full h-[400px] ${className}`}>
      <Canvas camera={{ position: [0, 1, 2], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={0.8} />
        <Environment preset="studio" />
        
        <ModelRotator>
          {/* 骨骼连接 */}
          {BONE_CONNECTIONS.map((conn, i) => (
            <BoneLine key={i} from={conn.from} to={conn.to} points={bonePoints} color={conn.color} />
          ))}
          
          {/* 骨骼点 */}
          {bonePoints.map(point => (
            <BonePoint key={point.id} point={point} onClick={handlePointClick} />
          ))}
          
          {/* 参考地面 */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
            <planeGeometry args={[3, 3]} />
            <meshStandardMaterial color="#f1f5f9" transparent opacity={0.3} />
          </mesh>
        </ModelRotator>
        
        <OrbitControls 
          enablePan={false}
          enableZoom={true}
          minDistance={1.5}
          maxDistance={4}
          target={[0, 0.8, 0]}
        />
      </Canvas>
      
      {/* 图例 */}
      <div className="absolute bottom-4 left-4 bg-white/90 rounded-lg p-3 shadow text-xs">
        <div className="font-medium mb-2">图例</div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span>严重问题</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500" />
            <span>中度问题</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span>轻度问题</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span>正常</span>
          </div>
        </div>
      </div>
      
      {/* 操作提示 */}
      <div className="absolute top-4 right-4 bg-white/90 rounded-lg px-3 py-2 shadow text-xs text-gray-600">
        拖拽旋转 | 滚轮缩放 | 点击查看详情
      </div>
    </div>
  );
}

/* eslint-disable react/no-unknown-property */
"use client";

import { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PointerLockControls, Stars } from '@react-three/drei';
import { MiniKit, VerificationLevel } from '@worldcoin/minikit-js';
import { Mesh } from 'three';

function GuidingLight() {
  const meshRef = useRef<Mesh>(null!);
  useFrame(({ clock }) => {
    meshRef.current.material.emissiveIntensity = Math.sin(clock.elapsedTime * 2) * 0.5 + 1.5;
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -20]}>
      <icosahedronGeometry args={[0.5, 15]} />
      <meshStandardMaterial color="cyan" emissive="cyan" emissiveIntensity={2} />
    </mesh>
  );
}

export default function Home() {
  const [isVerified, setIsVerified] = useState(false);
  const [feedback, setFeedback] = useState("Bienvenido a tu Espacio Onírico.");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => { MiniKit.install(); }, []);

  const handleVerify = async () => {
    setIsLoading(true);
    setFeedback("Por favor, verifica tu humanidad para generar tu mundo...");
    try {
      if (!MiniKit.isInstalled()) throw new Error("Asegúrate de estar en World App.");
      const { finalPayload } = await MiniKit.commandsAsync.verify({
        action: 'enter-dream',
        verification_level: VerificationLevel.Orb,
      });
      if (finalPayload.status === 'success') {
        setFeedback("Verificando prueba...");
        setTimeout(() => { setIsVerified(true); }, 1000);
      } else {
        throw new Error("La verificación fue cancelada.");
      }
    } catch (error) {
      console.error("Error de verificación:", error);
      if (error instanceof Error) setFeedback(`Error: ${error.message}`);
      else setFeedback("Ocurrió un error desconocido.");
      setIsLoading(false);
    }
  };

  return (
    <div className="w-screen h-screen bg-black text-white font-sans">
      {!isVerified ? (
        <div className="flex flex-col items-center justify-center h-full p-6 text-center space-y-6">
            <h1 className="text-3xl font-bold">Dream Explorer</h1>
            <p className="text-gray-400 max-w-xs">{feedback}</p>
            <button
                onClick={handleVerify}
                disabled={isLoading}
                className="w-full max-w-xs py-3 mt-4 font-bold text-white uppercase tracking-wider bg-purple-600 rounded-lg hover:bg-purple-700 transition-transform transform active:scale-95 disabled:bg-gray-600"
            >
                {isLoading ? 'Verificando...' : 'Verificar y Entrar'}
            </button>
        </div>
      ) : (
        <>
          <div className="crosshair" />
          <Canvas camera={{ fov: 75, position: [0, 0, 5] }}>
            <pointLight color="#00ffff" intensity={50} distance={100} />
            <fog attach="fog" args={['#03000a', 10, 40]} />
            <Stars radius={150} depth={50} count={5000} factor={5} saturation={0} fade speed={1} />
            <GuidingLight />
            <PointerLockControls />
          </Canvas>
        </>
      )}
    </div>
  );
}
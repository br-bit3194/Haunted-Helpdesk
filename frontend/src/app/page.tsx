'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { 
  SpiderWeb, 
  Fog,
  BinaryRain,
  GlitchErrors,
  CircuitLines,
  DataPackets,
  ScreenGlitch,
  RedVignette,
  FlickeringLights
} from '@/components/effects';
import {
  GhostOrchestrator,
  SkeletonMemory,
  VampireTicketing,
  WitchNetwork,
  ReaperCloud,
  MummySummarization
} from '@/components/agents';
import dynamic from 'next/dynamic';
import { MODEL_CONFIGS } from '@/components/Model3DViewer';
import { useScaryAudio } from '@/hooks/useScaryAudio';

// Lazy load 3D viewer for better initial page load performance
const Model3DViewer = dynamic(
  () => import('@/components/Model3DViewer').then(mod => ({ default: mod.Model3DViewer })),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full w-full">
        <div className="text-spectral-green font-creepster">Loading 3D...</div>
      </div>
    )
  }
);

export default function Home() {
  // Initialize audio with background theme
  const { playAmbientSound, stopAmbientSound, isLoaded, isMuted, toggleMute } = useScaryAudio(true);

  // Auto-play background music when page loads
  useEffect(() => {
    if (isLoaded) {
      // Small delay to ensure user interaction (some browsers require this)
      const timer = setTimeout(() => {
        playAmbientSound();
      }, 500);

      return () => {
        clearTimeout(timer);
        stopAmbientSound();
      };
    }
  }, [isLoaded, playAmbientSound, stopAmbientSound]);
  return (
    <>
      <a href="#main-content" className="skip-to-main">
        Skip to main content
      </a>
      
      {/* Audio Control Button */}
      <motion.button
        onClick={toggleMute}
        className="fixed top-4 right-4 z-50 p-3 bg-bg-tombstone border-2 border-pumpkin-orange rounded-full hover:bg-pumpkin-orange/20 transition-colors focus:outline-none focus:ring-4 focus:ring-pumpkin-orange/50"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label={isMuted ? "Unmute background music" : "Mute background music"}
        title={isMuted ? "Unmute background music" : "Mute background music"}
      >
        <span className="text-2xl" aria-hidden="true">
          {isMuted ? '🔇' : '🔊'}
        </span>
      </motion.button>

      <main id="main-content" className="min-h-screen bg-gradient-to-b from-black via-bg-crypt to-black relative overflow-hidden" role="main">
      {/* Intense Scary Effects */}
      <ScreenGlitch />
      <RedVignette />
      <FlickeringLights />
      
      {/* IT-Themed Atmospheric Effects - Reduced on mobile for performance */}
      <SpiderWeb corner="top-left" aria-hidden="true" />
      <SpiderWeb corner="top-right" aria-hidden="true" />
      
      {/* Desktop effects */}
      <div className="hidden sm:block" aria-hidden="true">
        <BinaryRain count={20} />
        <GlitchErrors count={8} />
        <CircuitLines density="high" />
        <DataPackets count={15} />
      </div>
      
      {/* Mobile effects - reduced for performance */}
      <div className="sm:hidden" aria-hidden="true">
        <BinaryRain count={10} />
        <GlitchErrors count={4} />
        <CircuitLines density="medium" />
        <DataPackets count={5} />
      </div>
      
      <Fog aria-hidden="true" />
      
      {/* Blood Moon Background - Enhanced */}
      <motion.div 
        className="absolute top-10 right-10 sm:top-20 sm:right-20 w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 bg-blood-red rounded-full blur-3xl" 
        animate={{
          opacity: [0.3, 0.5, 0.3],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        aria-hidden="true" 
      />
      
      {/* Additional ominous glows */}
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-phantom-purple rounded-full opacity-10 blur-3xl" aria-hidden="true" />
      <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-spectral-green rounded-full opacity-10 blur-3xl" aria-hidden="true" />
      
      {/* 3D Model on Right Side - Now with scary interactive features! */}
      <motion.div 
        className="hidden lg:block absolute right-0 top-0 w-1/2 h-screen z-10"
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1.5, delay: 0.5 }}
      >
        <Model3DViewer 
          modelPath={MODEL_CONFIGS.shaded.path}
          autoRotate={false}
          enableZoom={false}
          scale={1.5}
          position={[0, -1.5, 0]}
          enableAudio={false}
          enableAnimations={true}
          enableEffects={true}
          enableMouseTracking={true}
          respectMotionPreference={true}
        />
      </motion.div>

      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex flex-col items-center lg:items-start justify-center px-4 sm:px-6 lg:px-8 lg:pl-16" aria-labelledby="hero-title">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-center lg:text-left mb-12 lg:max-w-xl"
        >
          <motion.h1
            id="hero-title"
            className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-creepster text-pumpkin-orange mb-6 relative"
            style={{
              textShadow: '0 0 30px rgba(255,117,24,0.8), 0 0 60px rgba(139,0,0,0.6)',
            }}
            animate={{ 
              textShadow: [
                "0 0 30px rgba(255,117,24,0.8), 0 0 60px rgba(139,0,0,0.6)",
                "0 0 50px rgba(255,117,24,1), 0 0 80px rgba(139,0,0,0.8), 0 0 100px rgba(255,0,0,0.4)",
                "0 0 30px rgba(255,117,24,0.8), 0 0 60px rgba(139,0,0,0.6)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="relative inline-block">
              Haunted Helpdesk
              {/* Glitch layers */}
              <motion.span
                className="absolute top-0 left-0 text-blood-red opacity-70"
                style={{ clipPath: 'inset(0 0 0 0)' }}
                animate={{
                  x: [-2, 2, -2],
                  clipPath: [
                    'inset(0 0 0 0)',
                    'inset(40% 0 30% 0)',
                    'inset(0 0 0 0)',
                  ],
                }}
                transition={{
                  duration: 0.2,
                  repeat: Infinity,
                  repeatDelay: 3,
                }}
                aria-hidden="true"
              >
                Haunted Helpdesk
              </motion.span>
              <motion.span
                className="absolute top-0 left-0 text-spectral-green opacity-70"
                style={{ clipPath: 'inset(0 0 0 0)' }}
                animate={{
                  x: [2, -2, 2],
                  clipPath: [
                    'inset(0 0 0 0)',
                    'inset(20% 0 50% 0)',
                    'inset(0 0 0 0)',
                  ],
                }}
                transition={{
                  duration: 0.2,
                  repeat: Infinity,
                  repeatDelay: 3,
                  delay: 0.1,
                }}
                aria-hidden="true"
              >
                Haunted Helpdesk
              </motion.span>
            </span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0.7, 1, 0.7],
            }}
            transition={{ 
              delay: 0.5, 
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-blood-red font-creepster mb-8 sm:mb-12 px-4"
            style={{
              textShadow: '0 0 20px rgba(139, 0, 0, 0.8), 0 0 40px rgba(255, 0, 0, 0.4)',
            }}
          >
            Where IT Nightmares Come to Die
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center px-4"
            role="navigation"
            aria-label="Main navigation"
          >
            <Link href="/demo">
              <motion.button
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: '0 0 30px rgba(139, 0, 0, 0.8), 0 0 60px rgba(255, 0, 0, 0.4)',
                }}
                whileTap={{ scale: 0.95 }}
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(139, 0, 0, 0.4)',
                    '0 0 30px rgba(139, 0, 0, 0.6)',
                    '0 0 20px rgba(139, 0, 0, 0.4)',
                  ],
                }}
                transition={{
                  boxShadow: {
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  },
                }}
                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-blood-moon text-bone-white font-creepster text-lg sm:text-xl rounded-lg shadow-lg border-2 border-blood-red/50 focus:outline-none focus:ring-4 focus:ring-blood-red/50"
                aria-label="Enter the Crypt - Go to demo page"
              >
                💀 Enter the Crypt
              </motion.button>
            </Link>
            
            <a href="https://github.com" target="_blank" rel="noopener noreferrer">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-bg-tombstone border-2 border-phantom-purple text-phantom-purple font-creepster text-lg sm:text-xl rounded-lg hover:bg-phantom-purple/20 transition-colors focus:outline-none focus:ring-4 focus:ring-phantom-purple/50"
                aria-label="View Grimoire - Open GitHub repository in new tab"
              >
                📖 View Grimoire
              </motion.button>
            </a>
          </motion.div>
        </motion.div>
      </section>
      
      {/* Feature Cards Section */}
      <section className="relative z-10 py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8" aria-labelledby="features-title">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="max-w-6xl mx-auto"
        >
          <h2 id="features-title" className="text-3xl sm:text-4xl md:text-5xl font-creepster text-pumpkin-orange text-center mb-8 sm:mb-12 md:mb-16">
            Supernatural Powers
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            {/* AI Possession */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-bg-crypt border-2 border-spectral-green rounded-lg p-6 sm:p-8 hover:border-pumpkin-orange transition-colors focus-within:ring-4 focus-within:ring-spectral-green/50"
              role="article"
              aria-labelledby="feature-ai-possession"
            >
              <div className="text-5xl sm:text-6xl mb-4 text-center" aria-hidden="true">👻</div>
              <h3 id="feature-ai-possession" className="text-xl sm:text-2xl font-creepster text-spectral-green mb-3 sm:mb-4 text-center">
                AI Possession
              </h3>
              <p className="text-sm sm:text-base text-cobweb-gray text-center">
                Six specialized AI agents possess your IT infrastructure, 
                diagnosing and resolving issues with supernatural intelligence.
              </p>
            </motion.div>
            
            {/* Spectral Swarm */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-bg-crypt border-2 border-phantom-purple rounded-lg p-6 sm:p-8 hover:border-pumpkin-orange transition-colors focus-within:ring-4 focus-within:ring-phantom-purple/50"
              role="article"
              aria-labelledby="feature-spectral-swarm"
            >
              <div className="text-5xl sm:text-6xl mb-4 text-center" aria-hidden="true">🕸️</div>
              <h3 id="feature-spectral-swarm" className="text-xl sm:text-2xl font-creepster text-phantom-purple mb-3 sm:mb-4 text-center">
                Spectral Swarm
              </h3>
              <p className="text-sm sm:text-base text-cobweb-gray text-center">
                Agents collaborate through ethereal handoffs, orchestrating 
                complex workflows that would haunt traditional automation.
              </p>
            </motion.div>
            
            {/* Eternal Memory */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-bg-crypt border-2 border-blood-red rounded-lg p-6 sm:p-8 hover:border-pumpkin-orange transition-colors focus-within:ring-4 focus-within:ring-blood-red/50"
              role="article"
              aria-labelledby="feature-eternal-memory"
            >
              <div className="text-5xl sm:text-6xl mb-4 text-center" aria-hidden="true">🔮</div>
              <h3 id="feature-eternal-memory" className="text-xl sm:text-2xl font-creepster text-blood-red mb-3 sm:mb-4 text-center">
                Eternal Memory
              </h3>
              <p className="text-sm sm:text-base text-cobweb-gray text-center">
                Past resolutions are stored in the crypt's memory, allowing 
                instant resurrection of solutions for recurring nightmares.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </section>
      
      {/* Agent Showcase Section */}
      <section className="relative z-10 py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 mb-12 sm:mb-16 md:mb-20" aria-labelledby="agents-title">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="max-w-7xl mx-auto"
        >
          <h2 id="agents-title" className="text-3xl sm:text-4xl md:text-5xl font-creepster text-pumpkin-orange text-center mb-8 sm:mb-12 md:mb-16">
            Meet the Coven
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 md:gap-12">
            {/* Ghost Orchestrator */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              viewport={{ once: true }}
              className="flex flex-col items-center text-center"
              role="article"
              aria-labelledby="agent-orchestrator"
            >
              <div className="mb-6" aria-hidden="true">
                <GhostOrchestrator isActive={true} />
              </div>
              <h3 id="agent-orchestrator" className="text-xl sm:text-2xl font-creepster text-spectral-green mb-2 sm:mb-3">
                Ghost Orchestrator
              </h3>
              <p className="text-sm sm:text-base text-cobweb-gray">
                The ethereal conductor who routes tickets through the spectral workflow, 
                ensuring each spirit performs its haunting duty.
              </p>
            </motion.div>
            
            {/* Skeleton Memory */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              viewport={{ once: true }}
              className="flex flex-col items-center text-center"
            >
              <div className="mb-6">
                <SkeletonMemory isActive={true} />
              </div>
              <h3 className="text-xl sm:text-2xl font-creepster text-bone-white mb-2 sm:mb-3">
                Skeleton Memory
              </h3>
              <p className="text-sm sm:text-base text-cobweb-gray">
                The keeper of ancient knowledge, storing past resolutions in glowing orbs 
                and retrieving them from the crypt's eternal archives.
              </p>
            </motion.div>
            
            {/* Vampire Ticketing */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              viewport={{ once: true }}
              className="flex flex-col items-center text-center"
            >
              <div className="mb-6">
                <VampireTicketing isActive={true} />
              </div>
              <h3 className="text-xl sm:text-2xl font-creepster text-blood-red mb-2 sm:mb-3">
                Vampire Ticketing
              </h3>
              <p className="text-sm sm:text-base text-cobweb-gray">
                The immortal processor who analyzes tickets, updates their status, 
                and drains the life from unresolved issues.
              </p>
            </motion.div>
            
            {/* Witch Network */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              viewport={{ once: true }}
              className="flex flex-col items-center text-center"
            >
              <div className="mb-6">
                <WitchNetwork isActive={true} />
              </div>
              <h3 className="text-xl sm:text-2xl font-creepster text-phantom-purple mb-2 sm:mb-3">
                Witch Network
              </h3>
              <p className="text-sm sm:text-base text-cobweb-gray">
                The network sorceress who peers into her crystal ball to diagnose 
                connectivity curses and DNS hexes.
              </p>
            </motion.div>
            
            {/* Reaper Cloud */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              viewport={{ once: true }}
              className="flex flex-col items-center text-center"
            >
              <div className="mb-6">
                <ReaperCloud isActive={true} />
              </div>
              <h3 className="text-xl sm:text-2xl font-creepster text-cobweb-gray mb-2 sm:mb-3">
                Reaper Cloud
              </h3>
              <p className="text-sm sm:text-base text-cobweb-gray">
                Death himself handles AWS operations, wielding his cloud-shaped scythe 
                to harvest S3 bucket diagnostics.
              </p>
            </motion.div>
            
            {/* Mummy Summarization */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              viewport={{ once: true }}
              className="flex flex-col items-center text-center"
            >
              <div className="mb-6">
                <MummySummarization isActive={true} />
              </div>
              <h3 className="text-xl sm:text-2xl font-creepster text-pumpkin-orange mb-2 sm:mb-3">
                Mummy Summarization
              </h3>
              <p className="text-sm sm:text-base text-cobweb-gray">
                The ancient scribe who unwraps complex resolutions into concise 
                TL;DR summaries preserved for eternity.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </section>
    </main>
    </>
  );
}

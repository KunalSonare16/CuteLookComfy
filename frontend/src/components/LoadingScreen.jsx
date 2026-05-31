import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoadingScreen() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount(c => {
        if (c >= 100) { clearInterval(interval); return 100; }
        return c + Math.floor(Math.random() * 8) + 3;
      });
    }, 40);
    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
        style={{
          position: 'fixed', inset: 0, background: '#111111',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, overflow: 'hidden',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 'clamp(80px, 15vw, 160px)',
            fontWeight: 900,
            letterSpacing: '-0.03em',
            color: '#EDE8E3',
            lineHeight: 0.9,
            textTransform: 'uppercase',
            userSelect: 'none',
          }}
        >
          CuteLookComfy
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{
            marginTop: '40px',
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: '11px',
            letterSpacing: '0.3em',
            color: '#EDE8E3',
            opacity: 0.4,
            textTransform: 'uppercase',
          }}
        >
          Premium Fashion — Est. 2024
        </motion.div>

        <div style={{
          position: 'absolute', bottom: '48px', left: '48px', right: '48px',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
        }}>
          <motion.div
            key={count}
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 'clamp(48px, 8vw, 96px)',
              fontWeight: 700,
              color: '#E8242A',
              lineHeight: 1,
            }}
          >
            {Math.min(count, 100)}
          </motion.div>

          <div style={{ width: '200px' }}>
            <div style={{ height: '1px', background: 'rgba(237,232,227,0.15)', position: 'relative' }}>
              <motion.div
                style={{
                  position: 'absolute', top: 0, left: 0, height: '100%',
                  background: '#E8242A',
                  width: `${Math.min(count, 100)}%`,
                }}
                transition={{ ease: 'easeOut' }}
              />
            </div>
            <div style={{
              marginTop: '8px',
              fontFamily: 'Inter, sans-serif', fontSize: '10px',
              letterSpacing: '0.2em', color: 'rgba(237,232,227,0.35)',
              textTransform: 'uppercase',
            }}>
              Loading
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

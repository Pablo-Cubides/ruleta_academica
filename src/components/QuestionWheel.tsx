"use client";
import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'

interface QuestionWheelProps {
  questions: string[]
}

const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD',
  '#D4A5A5', '#9B59B6', '#3498DB', '#E67E22', '#2ECC71',
  '#95A5A6', '#E74C3C', '#34495E', '#1ABC9C', '#9B59B6'
]

// Function to wrap text for SVG
function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  words.forEach(word => {
    if ((currentLine + word).length > maxChars) {
      lines.push(currentLine.trim());
      currentLine = '';
    }
    currentLine += word + ' ';
  });
  lines.push(currentLine.trim());
  return lines;
}

const QuestionWheel = ({ questions }: QuestionWheelProps) => {
  const [questionList, setQuestionList] = useState<string[]>(questions)
  const [selectedQuestion, setSelectedQuestion] = useState<string>('')
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [isSpinning, setIsSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const prevIndexRef = useRef<number | null>(null)
  const [wheelSize, setWheelSize] = useState(600) // Default size
  const wheelRef = useRef<SVGSVGElement>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const closeButtonRef = useRef<HTMLButtonElement | null>(null)
  const previousActiveElementRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const handleResize = () => {
      setWheelSize(window.innerWidth < 768 ? 360 : 600);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setQuestionList(questions)
    setSelectedQuestion('')
    setSelectedIndex(null)
    setRotation(0)
  }, [questions])

  // Manage focus when modal opens/closes
  useEffect(() => {
    if (isModalOpen) {
      // store previous active element
      previousActiveElementRef.current = document.activeElement as HTMLElement | null;
      // focus the close button when modal opens
      setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 0);
      // prevent background scrolling
      document.body.style.overflow = 'hidden';
    } else {
      // restore focus
      previousActiveElementRef.current?.focus();
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isModalOpen]);

  const handleSpin = () => {
    if (isSpinning || questionList.length === 0) return;
    setIsSpinning(true);
    setSelectedQuestion('');
    setSelectedIndex(null);

    // 1. Choose a new random index (avoid immediate repeat)
    let randomIndex = Math.floor(Math.random() * questionList.length);
    if (questionList.length > 1 && randomIndex === prevIndexRef.current) {
      randomIndex = (randomIndex + 1) % questionList.length;
    }
    prevIndexRef.current = randomIndex;

    /* ------------------------------------------------------------
       GEOMETRY
       ------------------------------------------------------------*/
    const segmentAngle = 360 / questionList.length;
    const targetSegmentCenter = randomIndex * segmentAngle + segmentAngle / 2; // in wheel coords

    /* ------------------------------------------------------------
       SPIN CONFIGURATION
       ------------------------------------------------------------*/
    const fastSpins = 2;   // full spins in fast phase (>=2 as requested)
    const slowSpins = 3;   // full spins in slow phase (feel free to tweak)
    const fastDuration = 400;  // ms – explosive start
    const slowDuration = 1400; // ms – smooth deceleration

    /* ------------------------------------------------------------
       CURRENT ROTATION & ALIGNMENT
       ------------------------------------------------------------*/
    const currentRotation = rotation; // degrees (clockwise positive)
    const currentNorm = ((currentRotation % 360) + 360) % 360; // 0-359

    // After all spins we want: (currentRotation + totalDelta + targetSegmentCenter) % 360 === 0
    // => currentNorm + totalDelta + targetSegmentCenter ≡ 0 (mod 360)
    const desiredNormRotation = (360 - targetSegmentCenter) % 360;

    // Smallest clockwise rotation to reach desiredNormRotation from currentNorm
    const alignRotation = (desiredNormRotation - currentNorm + 360) % 360;

    // Total clockwise rotation we will apply:
    const totalDelta = fastSpins * 360 + slowSpins * 360 + alignRotation; // always >= 2 full spins

    const fastPhaseDelta = fastSpins * 360; // first part of totalDelta
    const slowPhaseDelta = totalDelta - fastPhaseDelta; // remainder

    /* ------------------------------------------------------------
       ANIMATION PHASES
       ------------------------------------------------------------*/
    let start = currentRotation;
    let end = start + fastPhaseDelta;
    let startTime: number | null = null;

    // Phase 1 – constant speed
    function fastSpin(ts: number) {
      if (!startTime) startTime = ts;
      const elapsed = ts - startTime;
      const progress = Math.min(elapsed / fastDuration, 1);
      setRotation(start + (end - start) * progress);
      if (progress < 1) {
        requestAnimationFrame(fastSpin);
      } else {
        // Transition to slow phase
        startTime = null;
        start = end;
        end = start + slowPhaseDelta;
        requestAnimationFrame(slowSpin);
      }
    }

    // Phase 2 – ease-out expo
    function slowSpin(ts: number) {
      if (!startTime) startTime = ts;
      const elapsed = ts - startTime;
      const progress = Math.min(elapsed / slowDuration, 1);
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setRotation(start + (end - start) * eased);
      if (progress < 1) {
        requestAnimationFrame(slowSpin);
      } else {
        const finalRot = end % 360;
        setRotation(finalRot);
        setSelectedQuestion(questionList[randomIndex]);
        setSelectedIndex(randomIndex);
        setIsSpinning(false);
        setIsModalOpen(true);
      }
    }

    requestAnimationFrame(fastSpin);


    // ------------------------------------------------------------
    // END handleSpin implementation
    // ------------------------------------------------------------
  }



  const handleRemove = () => {
    if (selectedIndex !== null && questionList.length > 0) {
      const newList = questionList.filter((_, idx) => idx !== selectedIndex);
      setQuestionList(newList);
      setSelectedQuestion('');
      setSelectedIndex(null);
      setRotation(0);
      prevIndexRef.current = null;
    }
  };

  const radius = wheelSize / 2;
  const segmentAngle = questionList.length > 0 ? 360 / questionList.length : 360;

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <div className="text-2xl font-semibold text-primary-400">
        Preguntas restantes: {questionList.length}
      </div>
      <div className="relative flex justify-center items-center">
        {/* Marker is now at the top, pointing down */}
        <div className="absolute z-20 top-[-15px] left-1/2 -translate-x-1/2">
          <div style={{ clipPath: 'polygon(50% 100%, 0% 0%, 100% 0%)' }} className="w-10 h-10 bg-white"></div>
        </div>
        <motion.div
          className="relative rounded-full shadow-2xl"
          style={{
            rotate: rotation,
            width: wheelSize,
            height: wheelSize,
            border: '8px solid #fff',
            boxShadow: '0 0 30px rgba(0,0,0,0.6)'
          }}
        >
          <svg
            ref={wheelRef}
            viewBox={`0 0 ${wheelSize} ${wheelSize}`}
            className="w-full h-full rounded-full"
            style={{ transform: 'rotate(-90deg)' }}
          >
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <g>
              {questionList.map((question, index) => {
                const startAngle = index * segmentAngle;
                const endAngle = startAngle + segmentAngle;
                const largeArcFlag = segmentAngle <= 180 ? '0' : '1';

                const startX = radius + radius * Math.cos(Math.PI * startAngle / 180);
                const startY = radius + radius * Math.sin(Math.PI * startAngle / 180);
                const endX = radius + radius * Math.cos(Math.PI * endAngle / 180);
                const endY = radius + radius * Math.sin(Math.PI * endAngle / 180);

                const pathData = `M${radius},${radius} L${startX},${startY} A${radius},${radius} 0 ${largeArcFlag} 1 ${endX},${endY} Z`;

                const isSelected = !isSpinning && selectedIndex === index;

                const textAngle = startAngle + segmentAngle / 2;
                const textRadius = radius * 0.6;
                const textX = radius + textRadius * Math.cos(Math.PI * textAngle / 180);
                const textY = radius + textRadius * Math.sin(Math.PI * textAngle / 180);

                // We display just the index number instead of the full question
                const displayNumber = (index + 1).toString();

                return (
                  <g key={index} style={{ filter: isSelected ? 'url(#glow)' : 'none' }}>
                    <path d={pathData} fill={COLORS[index % COLORS.length]} stroke="#fff" strokeWidth="2" />
                    <text
                      x={textX}
                      y={textY}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="#fff"
                      fontSize={questionList.length > 20 ? '14' : '20'}
                      fontWeight="bold"
                      transform={`rotate(${textAngle + 90}, ${textX}, ${textY})`}
                    >
                      {displayNumber}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>
        </motion.div>
      </div>
      <div className="flex justify-center gap-4 mt-6">
        <button
          className="bg-primary-500 hover:bg-primary-700 text-white font-bold py-3 px-8 rounded text-2xl disabled:opacity-50"
          onClick={handleSpin}
          disabled={isSpinning || questionList.length === 0}
        >
          Girar
        </button>
        <button
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-3 px-8 rounded text-2xl disabled:opacity-50"
          onClick={handleRemove}
          disabled={isSpinning || selectedIndex === null}
        >
          Eliminar pregunta
        </button>
      </div>
      {/* Modal de pregunta completa */}
      {isModalOpen && selectedQuestion && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div className="absolute inset-0 bg-black/60" onClick={() => setIsModalOpen(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative z-10 w-full max-w-2xl mx-4 p-6 bg-gray-900 rounded-2xl border border-gray-700 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <h2 id="modal-title" className="text-2xl font-bold text-primary-400">
                Pregunta {typeof selectedIndex === 'number' ? `#${selectedIndex + 1}` : ''}
              </h2>
              <button
                ref={closeButtonRef}
                className="text-white/80 hover:text-white px-3 py-1 rounded-md bg-white/10"
                onClick={() => setIsModalOpen(false)}
              >
                Cerrar
              </button>
            </div>
            <div className="mt-4">
              <p className="text-xl text-white leading-relaxed whitespace-pre-wrap">
                {selectedQuestion}
              </p>
            </div>
            <div className="mt-6 flex gap-3 justify-end">
              <button
                className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg disabled:opacity-50"
                onClick={() => { handleRemove(); setIsModalOpen(false); }}
                disabled={isSpinning || selectedIndex === null}
              >
                Eliminar pregunta
              </button>
              <button
                className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-4 py-2 rounded-lg"
                onClick={() => setIsModalOpen(false)}
              >
                Aceptar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default QuestionWheel;

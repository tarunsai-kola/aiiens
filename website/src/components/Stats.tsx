import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const stats = [
  { label: 'Clinics Empowered', value: '500+', suffix: '' },
  { label: 'Patients Managed', value: '2', suffix: 'M+' },
  { label: 'Appointments Booked', value: '5', suffix: 'M+' },
  { label: 'Cities Present', value: '50', suffix: '+' },
];

const Counter = ({ value, suffix }: { value: string, suffix: string }) => {
  // Simple mock counter animation effect
  const [count, setCount] = useState(0);
  const targetValue = parseInt(value.replace(/,/g, ''));
  
  useEffect(() => {
    if (isNaN(targetValue)) return;
    
    let start = 0;
    const duration = 2000; // 2 seconds
    const increment = targetValue / (duration / 16); // 60fps
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= targetValue) {
        setCount(targetValue);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    
    return () => clearInterval(timer);
  }, [targetValue]);
  
  return (
    <span>
      {isNaN(targetValue) ? value : count}{suffix}
    </span>
  );
};

const Stats = () => {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6 md:px-12 max-w-7xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center">
          {stats.map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="p-6"
            >
              <div className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-2">
                <Counter value={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-slate-500 font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;

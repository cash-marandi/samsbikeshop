'use client';
import React, { useState, useEffect } from 'react';

interface AuctionCountdownProps {
  endTime: number;
  onEnd: () => void;
}

const AuctionCountdown: React.FC<AuctionCountdownProps> = ({ endTime, onEnd }) => {
  const calculateTimeLeft = () => {
    const difference = endTime - Date.now();
    let timeLeft = {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }

    return { difference, timeLeft };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft().timeLeft);
  const [isEnded, setIsEnded] = useState(calculateTimeLeft().difference <= 0);

  useEffect(() => {
    if (isEnded) {
        onEnd();
        return;
    }

    const timer = setInterval(() => {
      const { difference, timeLeft: newTimeLeft } = calculateTimeLeft();

      if (difference <= 0) {
        clearInterval(timer);
        setIsEnded(true);
        onEnd();
      } else {
        setTimeLeft(newTimeLeft);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isEnded, onEnd]);

  if (isEnded) {
    return (
        <span className="text-zinc-400">ENDED</span>
    );
  }

  return (
    <span className="text-emerald-400 font-mono text-sm">
      {timeLeft.days > 0 ? `${timeLeft.days}d:` : ''}
      {String(timeLeft.hours).padStart(2, '0')}:
      {String(timeLeft.minutes).padStart(2, '0')}:
      {String(timeLeft.seconds).padStart(2, '0')}
    </span>
  );
};

export default AuctionCountdown;

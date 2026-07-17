import { useEffect, useState } from 'react';

interface CountdownTimerProps {
  target: string;
}

function formatRemaining(ms: number): string {
  if (ms <= 0) return 'Starting now';
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

function CountdownTimer({ target }: CountdownTimerProps) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const diffMs = new Date(target).getTime() - now;

  return (
    <span style={{ fontWeight: 700, color: diffMs <= 0 ? 'var(--success)' : 'inherit' }}>
      {formatRemaining(diffMs)}
    </span>
  );
}

export default CountdownTimer;

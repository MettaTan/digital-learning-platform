import { useEffect, useState } from "react";
import { Clock, AlertTriangle } from "lucide-react";

interface CountdownTimerProps {
  expiresAt: Date | string | null;
  status: string;
}

export function CountdownTimer({ expiresAt, status }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [isExpiringSoon, setIsExpiringSoon] = useState(false);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!expiresAt || status === "expired" || status === "completed" || status === "cancelled") {
      return;
    }

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const expiry = new Date(expiresAt).getTime();
      const difference = expiry - now;

      if (difference <= 0) {
        setIsExpired(true);
        setTimeLeft("Expired");
        return;
      }

      // Check if expiring within 7 days
      const daysLeft = Math.floor(difference / (1000 * 60 * 60 * 24));
      setIsExpiringSoon(daysLeft <= 7);

      // Calculate time components
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`);
      } else if (minutes > 0) {
        setTimeLeft(`${minutes}m ${seconds}s`);
      } else {
        setTimeLeft(`${seconds}s`);
      }
    };

    // Calculate immediately
    calculateTimeLeft();

    // Update every second
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, status]);

  if (!expiresAt || status === "completed" || status === "cancelled") {
    return null;
  }

  if (status === "expired" || isExpired) {
    return (
      <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
        <AlertTriangle className="w-4 h-4" />
        <span className="text-sm font-semibold">Expired</span>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-2 ${
        isExpiringSoon
          ? "text-orange-600 dark:text-orange-400"
          : "text-muted-foreground"
      }`}
    >
      <Clock className="w-4 h-4" />
      <span className="text-sm font-semibold">
        {isExpiringSoon && "⚠️ "}
        {timeLeft} left
      </span>
    </div>
  );
}

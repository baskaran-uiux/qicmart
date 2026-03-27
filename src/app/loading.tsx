import { HourglassLoader } from "@/components/ui/HourglassLoader";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="relative group">
        <div className="absolute -inset-4 rounded-full bg-primary/20 blur opacity-0 group-hover:opacity-100 transition duration-500 animate-pulse"></div>
        <HourglassLoader size="60" color="#3b82f6" speed="1.5" />
      </div>
      <p className="mt-6 text-sm font-medium text-muted-foreground animate-pulse tracking-widest uppercase">
        Loading Qicmart...
      </p>
    </div>
  );
}

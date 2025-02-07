import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import LoveMeter from "./LoveMeter";
import MatchResultsViewer from "./MatchResultsViewer";
import DateVibeCard from "./DareVibeCard";

interface SlideContent {
  content: React.ReactNode;
}

interface DatePlannerResult {
  dateVibe: string;
  aesthetic: string;
  emoji: string;
  coupleHashtag: string;
  generatedAt: string;
}

interface CubeCarouselProps {
  score: number;
  compatibility: {
    level: string;
    message: string;
  };
  matchResults: any[]; // Type this properly based on your matchResults structure
  summary: {
    totalQuestions: number;
    matchedAnswers: number;
  };
  socket: any; // Type this based on your socket implementation
  roomCode: string;
}

const CubeCarousel: React.FC<CubeCarouselProps> = ({
  score,
  compatibility,
  matchResults,
  summary,
  socket,
  roomCode,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [datePlan, setDatePlan] = useState<DatePlannerResult | null>(null);
  const [isDatePlanLoading, setIsDatePlanLoading] = useState<boolean>(false);

  const handleDatePlanGenerated = (plan: DatePlannerResult | null) => {
    setDatePlan(plan);
    setIsDatePlanLoading(false);
  };

  const slides: SlideContent[] = [
    // {
    //   content: (
    //     <div className="w-full h-full flex flex-col justify-center p-6 md:p-8">
    //       <LoveMeter
    //         score={score}
    //         compatibility={compatibility}
    //         matchResults={matchResults}
    //         summary={summary}
    //       />
    //     </div>
    //   ),
    // },

    {
      content: (
        <div className="w-full h-full flex flex-col justify-center p-6 md:p-8">
          <DateVibeCard datePlan={datePlan} isLoading={isDatePlanLoading} />
        </div>
      ),
    },
    {
      content: (
        <div className="w-full h-full flex flex-col justify-center p-6 md:p-8">
          <MatchResultsViewer
            gameState={{ matchResults }}
            socket={socket}
            roomCode={roomCode}
            onDatePlanGenerated={handleDatePlanGenerated}
          />
        </div>
      ),
    },
  ];

  useEffect(() => {
    const updateDimensions = () => {
      const vh = window.innerHeight;
      const vw = window.innerWidth;

      // For mobile devices (width < 768px)
      if (vw < 768) {
        const size = Math.min(vw * 0.9, vh * 0.6);
        setDimensions({ width: size, height: size });
      }
      // For desktop/tablet
      else {
        const size = Math.min(vw * 0.5, vh * 0.8);
        setDimensions({ width: size, height: size });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  const handleNextSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setTimeout(() => setIsAnimating(false), 600);
  };

  return (
    <div
      className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-pink-200 via-rose-300 to-red-200 overflow-hidden cursor-pointer"
      onClick={handleNextSlide}
    >
      <div
        className="relative perspective"
        style={{
          width: dimensions.width,
          height: dimensions.height,
          perspective: `${Math.max(dimensions.width, dimensions.height) * 2}px`,
        }}
      >
        {/* Progress indicators */}
        <div className="absolute -top-8 left-0 right-0 z-10 flex justify-center gap-2">
          {slides.map((_, index) => (
            <div
              key={index}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                currentSlide === index ? "bg-white/90 w-4" : "bg-white/50"
              )}
            />
          ))}
        </div>

        <div
          className="w-full h-full relative preserve-3d"
          style={{
            transform: `translateZ(-${dimensions.width / 2}px) rotateY(${
              currentSlide * -90
            }deg)`,
            transition: "transform 0.6s cubic-bezier(0.4, 0.0, 0.2, 1)",
          }}
        >
          {slides.map((slide, index) => (
            <div
              key={index}
              className="absolute backface-hidden w-full h-full rounded-2xl overflow-hidden"
              style={{
                transform: `rotateY(${index * 90}deg) translateZ(${
                  dimensions.width / 2
                }px)`,
                background:
                  "linear-gradient(135deg, rgba(255,192,203,0.9), rgba(255,105,180,0.9))",
                transition: "opacity 0.6s ease-in-out",
                opacity: currentSlide === index ? 1 : 0.8,
                boxShadow: "0 0 20px rgba(0,0,0,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              {slide.content}
            </div>
          ))}
        </div>

        <div className="absolute -bottom-8 left-0 right-0 text-center text-white/90 text-sm">
          Tap anywhere to see more
        </div>
      </div>
    </div>
  );
};

export default CubeCarousel;

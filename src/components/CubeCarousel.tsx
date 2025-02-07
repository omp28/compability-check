import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import MatchResultsViewer from "./MatchResultsViewer";
import DateVibeCard from "./DareVibeCard";
import EnjoymentComponent from "./PlayAgain";
import { Socket } from "socket.io-client";

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

export interface Option {
  id: string;
  text: string;
}

export interface PlayerAnswer {
  gender: "male" | "female";
  answer: string;
  answerText: string;
}

export interface MatchResult {
  questionId: number;
  question: string;
  options: Option[];
  matched: boolean;
  playerAnswers: Record<string, PlayerAnswer>;
}

interface CubeCarouselProps {
  score: number;
  compatibility: {
    level: string;
    message: string;
  };
  matchResults: MatchResult[];
  summary: {
    totalQuestions: number;
    matchedAnswers: number;
  };
  socket: Socket;
  roomCode: string;
}

const CubeCarousel: React.FC<CubeCarouselProps> = ({
  matchResults,
  socket,
  roomCode,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [datePlan, setDatePlan] = useState<DatePlannerResult | null>(null);
  const [isDatePlanLoading, setIsDatePlanLoading] = useState<boolean>(false);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const setSlideRef = (index: number) => (el: HTMLDivElement | null) => {
    slideRefs.current[index] = el;
  };
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
        <div className="w-full h-full flex flex-col justify-center px-6 md:p-8">
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
    {
      content: (
        <div className="w-full h-full flex flex-col justify-center p-6 md:p-8">
          <EnjoymentComponent />
        </div>
      ),
    },
  ];

  useEffect(() => {
    const updateDimensions = () => {
      const maxWidth = window.innerWidth;
      const maxHeight = window.innerHeight;
      let maxContentWidth = 0;
      let maxContentHeight = 0;

      // Measure content dimensions
      slideRefs.current.forEach((ref) => {
        if (ref) {
          const content = ref.firstElementChild as HTMLElement;
          if (content) {
            maxContentWidth = Math.max(maxContentWidth, content.scrollWidth);
            maxContentHeight = Math.max(maxContentHeight, content.scrollHeight);
          }
        }
      });

      // Add padding for the container
      maxContentWidth += 32; // 2rem padding
      maxContentHeight += 32;

      // Calculate responsive dimensions
      let finalWidth, finalHeight;
      if (maxWidth < 768) {
        // Mobile
        finalWidth = Math.min(maxWidth * 0.9, maxContentWidth);
        finalHeight = Math.min(maxHeight * 0.7, maxContentHeight);
      } else {
        // Desktop
        finalWidth = Math.min(maxWidth * 0.5, maxContentWidth);
        finalHeight = Math.min(maxHeight * 0.8, maxContentHeight);
      }

      // Ensure minimum dimensions
      finalWidth = Math.max(finalWidth, 300);
      finalHeight = Math.max(finalHeight, 300);

      setDimensions({ width: finalWidth, height: finalHeight });
    };

    // Initial update and resize listener
    updateDimensions();
    const resizeObserver = new ResizeObserver(updateDimensions);
    slideRefs.current.forEach((ref) => {
      if (ref) resizeObserver.observe(ref);
    });

    window.addEventListener("resize", updateDimensions);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateDimensions);
    };
  }, []);

  const handleNextSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setTimeout(() => setIsAnimating(false), 600);
  };

  return (
    <div
      className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-[#000] via-[#9c3c4677] to-[#000] overflow-hidden cursor-pointer"
      onClick={handleNextSlide}
      // style={{
      //   backgroundImage: `url(/date-night/${1}.jpg)`,
      // }}
      style={{
        backgroundImage: `
    linear-gradient(to bottom right, rgba(0, 0, 0, 0.8), rgba(156, 60, 70, 0.5), rgba(0, 0, 0, 0.8)),
    url(/date-night/${1}.jpg)
  `,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
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
          <div className="absolute left-0 right-0 mt-4 text-center text-white/90 text-[12px] ">
            Tap anywhere to see more
          </div>
        </div>

        <div
          className="w-full h-full relative preserve-3d "
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
              ref={setSlideRef(index)}
              className="absolute backface-hidden w-full h-full rounded-2xl overflow-hidden"
              style={{
                transform: `rotateY(${index * 90}deg) translateZ(${
                  dimensions.width / 2
                }px)`,
                // background:
                //   "linear-gradient(135deg, rgba(255,192,203,0.9), rgba(255,105,180,0.9))",
                transition: "opacity 0.6s ease-in-out",
                opacity: currentSlide === index ? 1 : 0.8,
                boxShadow: "0 0 20px rgba(0,0,0,0.1)",
              }}
            >
              {slide.content}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CubeCarousel;

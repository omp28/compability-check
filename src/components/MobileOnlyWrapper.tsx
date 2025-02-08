import { useState, useEffect } from "react";
import { Smartphone } from "lucide-react";

interface MobileOnlyWrapperProps {
  children: React.ReactNode;
  backgroundImage?: string;
}

export default function MobileOnlyWrapper({
  children,
  backgroundImage = "/langin-bg/2.jpg",
}: MobileOnlyWrapperProps) {
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (!isMobile) {
    return (
      <div
        className="min-h-screen bg-cover bg-center flex items-center justify-center"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className="text-center max-w-md p-4 bg-whit backdrop-blur-2xl rounded-xl shadow-lg">
          <Smartphone className="w-16 h-16 mx-auto mb-6 text-pink-500" />
          <h1 className="text-3xl font-bold text-white mb-3">
            Mobile Only Experience
          </h1>
          <p className="text-white mb-4">
            This app is designed exclusively for mobile devices. Please access
            it from your phone for the best experience! 💕
          </p>
          <div className="text-sm text-white">
            Current screen width:{" "}
            {typeof window !== "undefined"
              ? window.innerWidth
              : "calculating..."}
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

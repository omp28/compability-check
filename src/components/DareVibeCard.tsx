import { Card } from "@/components/ui/card";

export interface DatePlannerResult {
  dateVibe: string;
  aesthetic: string;
  emoji: string;
  coupleHashtag: string;
  generatedAt: string;
}

interface DateVibeCardProps {
  datePlan?: DatePlannerResult;
  isLoading: boolean;
}

const DateVibeCard = ({
  datePlan,
  isLoading,
}: {
  datePlan: DatePlannerResult | null;
  isLoading: boolean;
}) => {
  if (!datePlan && !isLoading) return null;

  return (
    <Card className="w-full max-w-md bg-gradient-to-br from-rose-100 to-teal-100 p-6 backdrop-blur-sm">
      {isLoading ? (
        <div className="flex items-center justify-center space-y-4 animate-pulse">
          <div className="h-24 w-full bg-white/50 rounded-lg" />
        </div>
      ) : (
        <div className="space-y-4 text-center">
          <div className="text-4xl mb-4">{datePlan?.emoji}</div>

          <div className="bg-white/70 rounded-lg p-4 backdrop-blur-md">
            <p className="text-lg font-medium text-gray-800">
              {datePlan?.dateVibe}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            <span className="px-3 py-1 rounded-full bg-white/50 text-sm">
              {datePlan?.aesthetic}
            </span>
            <span className="px-3 py-1 rounded-full bg-white/50 text-sm">
              {datePlan?.coupleHashtag}
            </span>
          </div>
        </div>
      )}
    </Card>
  );
};

export default DateVibeCard;

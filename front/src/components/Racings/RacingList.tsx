import { RacingCard } from "./RacingCard";
import { RacingListProps } from "@/lib/types/racing";

export const RacingList = ({ grandPrixList, isPast }: RacingListProps) => {
  if (grandPrixList.length === 0) {
    return (
      <div className="px-4 py-10 text-center text-[var(--primary-blue)] font-mono text-2xl">
        No Grand Prix available.
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 
        transition-all duration-300"
      >
        {grandPrixList.map((gp) => (
          <div key={gp.id} className="animate-fade-in">
            <RacingCard grandPrix={gp} isPast={isPast} />
          </div>
        ))}
      </div>
    </div>
  );
};

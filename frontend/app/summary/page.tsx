import  VisitSummary  from "@/pages/SessionSummary";
import { BackgroundBeams } from "@/components/ui/background-beams";

export default function Session() {
    return(
        <div>
            <div className="flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800 p-8 relative">
                <BackgroundBeams />
                <div className="z-10">
                    <VisitSummary />
                </div>
            </div>
        </div>
    );
}
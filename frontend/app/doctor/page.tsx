import  Patients  from "@/pages/patients";
import { BackgroundBeams } from "@/components/ui/background-beams";

export default function Patient() {
    return(
        <div>
            <div className="flex flex-col items-center justify-center p-8 relative">
                <BackgroundBeams />
                <div className="z-10">
                    <Patients />
                </div>
            </div>
        </div>
    );
}
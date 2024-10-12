import { SigninForm } from "@/pages/login"
import { BackgroundBeams } from "@/components/ui/background-beams";
export default function Home() {
    return(
        <div>
            <div className="z-10">
            <SigninForm />
            <BackgroundBeams />
            </div>
        </div>
    );
}

import { SigninForm } from "@/pages/login";
import { BackgroundBeams } from "@/components/ui/background-beams";
import Image from 'next/image';
import Logo from "@/public/logo.png"; // Import the logo

export default function Home() {
  return (
    <div className="relative min-h-screen flex">
      {/* Left Section: Logo Component */}
      <div className="w-1/2 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800 p-8 relative">
        <BackgroundBeams />
        <div className="z-10 flex flex-col items-center">
          {/* Logo */}
          <div className="">
            <Image src={Logo} alt="EduCare Logo" layout="intrinsic" width={130} height={130} />
          </div>

          {/* Heading */}
          <h2 className="text-2xl font-bold text-white dark:text-white mb-4">
            Welcome to EduCare! Where patient care meets trust.
          </h2>

          {/* App Description */}
          <p className="text-white dark:text-gray-300 text-center mb-2">
            Our app creates a voice-to-text summary of your doctor’s appointment,
          </p>
          <p className="text-white dark:text-gray-300 text-center mb-2">
            validated by your doctor and sent to you with a clear interpretation.
          </p>
          <p className="text-white dark:text-gray-300 text-center mb-2">
            Experience peace of mind with accurate, trusted information after every visit.
          </p>
        </div>
      </div>

      {/* Divider Line */}
      <div className="w-px bg-gray-300 dark:bg-gray-700"></div>

      {/* Right Section: Sign In Form */}
      <div className="w-1/2 flex items-center justify-center bg-white dark:bg-black">
        <SigninForm />
      </div>
    </div>
  );
}

import { SigninForm } from "@/pages/login";
import { BackgroundBeams } from "@/components/ui/background-beams";

export default function Home() {
  return (
    <div className="relative min-h-screen flex">
      {/* Left Section: Red Cross Component */}
      <div className="w-1/2 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800 p-8 relative">
        <BackgroundBeams />
        <div className="z-10 flex flex-col items-center">
          {/* Red Cross Symbol */}
          <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center mb-4">
            <span className="text-white text-5xl font-bold">+</span>
          </div>

          {/* Heading */}
          <h2 className="text-2xl font-bold text-white dark:text-white mb-4">
            Welcome to EduCare!
          </h2>

          {/* Dummy Text */}
          <p className="text-white dark:text-gray-300 text-center mb-2">
            Get quick access to emergency medical assistance.
          </p>
          <p className="text-white dark:text-gray-300 text-center mb-2">
            Our system is designed to provide immediate help in urgent situations.
          </p>
          <p className="text-white dark:text-gray-300 text-center mb-2">
            Record your session easily and stay updated with medical alerts.
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

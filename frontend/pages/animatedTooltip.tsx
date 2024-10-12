"use client";
import React from "react";
import { AnimatedPatient } from "@/components/ui/animatedPatient";
import profilePhoto from "@/public/profilePhoto.jpg";

const people = [
  {
    id: 1,
    name: "John Doe",
    designation: "Software Engineer",
    image: profilePhoto,
  },
];

export function AnimatedTooltipPreview() {
  return (
    <div className="flex flex-row items-center justify-center mb-10 w-full">
      <AnimatedPatient items={people} />
    </div>
  );
}

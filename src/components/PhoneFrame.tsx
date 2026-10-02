import { ReactNode } from "react";

export function PhoneFrame({
  children,
  width = 160,
}: {
  children: ReactNode;
  width?: number;
}) {
  const height = Math.round(width * 2.16); // ~19.5:9, matches modern phone screens
  return (
    <div
      className="relative shrink-0 rounded-[22px] border-[3px] border-neutral-700 bg-black p-1.5 shadow-lg"
      style={{ width: width + 12, height: height + 12 }}
    >
      {/* Notch */}
      <div className="absolute left-1/2 top-2 z-10 h-3 w-16 -translate-x-1/2 rounded-full bg-neutral-800" />
      <div
        className="relative overflow-hidden rounded-[16px] bg-black"
        style={{ width, height }}
      >
        {children}
      </div>
    </div>
  );
}

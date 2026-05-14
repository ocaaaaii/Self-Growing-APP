import Mochi from "./Mochi";

// Friendly placeholder for features arriving in later phases.
export default function ComingSoon({ title, subtitle, note }) {
  return (
    <div className="animate-fadeIn px-[22px] pb-[100px] pt-2">
      <div className="mb-[18px] mt-1.5">
        <div className="font-hand text-lg text-milktea">coming soon</div>
        <h1 className="mt-0.5 text-[22px] font-medium leading-snug text-cocoa-deep">
          {title}
        </h1>
      </div>
      <div className="flex flex-col items-center rounded-xl2 border border-line/50 bg-cream-card/70 px-5 py-12 text-center shadow-soft">
        <div className="animate-floaty">
          <Mochi mood="sleepy" size={96} />
        </div>
        <p className="mt-4 text-sm font-medium text-cocoa-deep">{subtitle}</p>
        <p className="mt-1.5 text-xs leading-relaxed text-milktea">{note}</p>
      </div>
    </div>
  );
}

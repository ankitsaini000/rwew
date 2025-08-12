"use client";

export default function MobileTrust() {
  return (
    <section className="md:hidden px-3">
      <div className="rounded-2xl bg-white border border-gray-200 p-5">
        <h3 className="text-base font-semibold text-gray-900">Why brands choose us</h3>
        <ul className="mt-3 space-y-2 text-sm text-gray-700">
          <li className="flex gap-2"><span className="text-green-600">•</span> Dedicated creator experts for perfect matches</li>
          <li className="flex gap-2"><span className="text-green-600">•</span> Safe payments with milestone protection</li>
          <li className="flex gap-2"><span className="text-green-600">•</span> Analytics and reporting for every campaign</li>
          <li className="flex gap-2"><span className="text-green-600">•</span> On-demand support from our team</li>
        </ul>
        <button className="mt-4 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium active:scale-[0.98]">Try now</button>
      </div>
    </section>
  );
}



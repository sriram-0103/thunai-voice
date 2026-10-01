import React, { useState } from "react";
import { Info, CheckCircle2, Building2, FileText, ChevronDown, ChevronUp, ShieldCheck } from "lucide-react";

export const SchemePocketGuide: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full max-w-2xl mx-auto px-4 mt-6 mb-8">
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/90 rounded-2xl shadow-xs overflow-hidden">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-4 text-left transition-colors hover:bg-amber-100/50"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-amber-950">
                பிரதம மந்திரி மாத்ரு வந்தனா யோஜனா (PMMVY) - திட்ட விவரம்
              </h3>
              <p className="text-xs text-amber-800">
                சரிபார்க்கப்பட்ட அதிகாரப்பூர்வ அரசு தகவல் வழிகாட்டி
              </p>
            </div>
          </div>
          <div className="text-amber-700 p-1">
            {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </button>

        {isOpen && (
          <div className="px-5 pb-5 pt-2 border-t border-amber-200/60 space-y-4 text-slate-800 text-sm">
            {/* Assistance Amount */}
            <div className="bg-white rounded-xl p-3.5 border border-amber-200 shadow-2xs">
              <span className="font-bold text-amber-900 flex items-center gap-1.5 mb-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                உதவித்தொகை விவரம்:
              </span>
              <ul className="space-y-1.5 pl-5 list-disc text-slate-700 text-xs sm:text-sm">
                <li>
                  <strong className="text-slate-900">முதல் குழந்தைக்கு:</strong> மொத்தம் ₹5,000 (கர்ப்ப காலத்தில் ₹3,000 + குழந்தை பிறப்பு & தடுப்பூசிக்கு பின் ₹2,000).
                </li>
                <li>
                  <strong className="text-slate-900">இரண்டாவது குழந்தைக்கு (பெண் குழந்தை மட்டும்):</strong> ₹6,000 (பிறப்பு மற்றும் தடுப்பூசிக்கு பிறகு ஒரே தவணையாக).
                </li>
              </ul>
            </div>

            {/* Required Documents */}
            <div className="bg-white rounded-xl p-3.5 border border-amber-200 shadow-2xs">
              <span className="font-bold text-amber-900 flex items-center gap-1.5 mb-1.5">
                <FileText className="w-4 h-4 text-amber-700" />
                தேவையான ஆவணங்கள்:
              </span>
              <ul className="space-y-1 pl-5 list-disc text-slate-700 text-xs sm:text-sm">
                <li>தாயின் ஆதார் அட்டை</li>
                <li>கணவரின் ஆதார் அட்டை</li>
                <li>ஆதார் இணைக்கப்பட்ட தாயின் வங்கி கணக்கு புத்தகம் (DBT இயக்கப்பட்டிருக்க வேண்டும்)</li>
                <li>கிராம சுகாதார செவிலியர் / அங்கன்வாடி மூலம் பெறப்பட்ட தாய் சேய் நல அட்டை (MCP Card / RCH ID)</li>
              </ul>
            </div>

            {/* Where to Apply */}
            <div className="bg-white rounded-xl p-3.5 border border-amber-200 shadow-2xs">
              <span className="font-bold text-amber-900 flex items-center gap-1.5 mb-1.5">
                <Building2 className="w-4 h-4 text-blue-700" />
                விண்ணப்பிக்க வேண்டிய இடம்:
              </span>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                உங்கள் ஊரில் உள்ள <strong className="text-slate-900">அங்கன்வாடி மையம்</strong> அல்லது அரசு <strong className="text-slate-900">ஆரம்ப சுகாதார நிலையத்தில் (PHC)</strong> நேரில் சென்று அங்கன்வாடி பணியாளரின் உதவியுடன் இலவசமாக விண்ணப்பிக்கலாம்.
              </p>
              <div className="mt-2 text-xs text-slate-500 font-mono">
                அதிகாரப்பூர்வ தளம்: pmmvy.wcd.gov.in
              </div>
            </div>

            {/* Safety & Privacy Notice */}
            <div className="flex items-center gap-2 text-xs text-stone-600 bg-stone-100 p-2.5 rounded-lg border border-stone-200">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>
                <strong>பாதுகாப்பு உறுதிமொழி:</strong> துணை ஒருபோதும் உங்கள் ரகசிய எண்கள், வங்கி கடவுச்சொல் அல்லது OTP கேட்காது.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

import React from 'react';
import {PlusSquare, X} from 'lucide-react';
import {NwezhMark} from './NwezhMark';

interface InstallGuideModalProps {
  open: boolean;
  onClose: () => void;
  isIOS: boolean;
  isIOSSafari: boolean;
  isMacSafari: boolean;
  onContinueInBrowser?: () => void;
}

const IOSShareIcon: React.FC<{className?: string}> = ({className = 'w-5 h-5'}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M12 3v12" />
    <path d="m8 7 4-4 4 4" />
    <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" />
  </svg>
);

export const InstallGuideModal: React.FC<InstallGuideModalProps> = ({
  open,
  onClose,
  isIOS,
  isIOSSafari,
  isMacSafari,
  onContinueInBrowser,
}) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/45 p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="install-guide-title"
    >
      <div className="w-full sm:max-w-md bg-[#FAF9F6] dark:bg-[#151715] border-t sm:border border-[#E6E3DC] dark:border-[#262926] rounded-t-3xl sm:rounded-2xl p-6 pb-8 sm:pb-6 pb-safe">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <NwezhMark className="w-10 h-10 shrink-0" />
            <div>
              <h2
                id="install-guide-title"
                className="font-display text-lg font-semibold tracking-tight text-[#141413] dark:text-[#F4F3EF]"
              >
                Install Nwezh
              </h2>
              <p className="text-sm text-[#5C5B57] dark:text-[#9C9B95]">
                {isIOS
                  ? 'Add to your iPhone or iPad Home Screen'
                  : isMacSafari
                    ? 'Add Nwezh to your Mac Dock'
                    : 'Install Nwezh on your device'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close installation instructions"
            className="min-w-[44px] min-h-[44px] -mr-2 -mt-2 flex items-center justify-center rounded-xl text-[#5C5B57] hover:text-[#141413] dark:text-[#9C9B95] dark:hover:text-[#F4F3EF] transition-colors focus-visible:outline-2 focus-visible:outline-[#2F5E4E]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-6 space-y-4">
          {isIOS && !isIOSSafari && (
            <div className="rounded-xl border border-[#E6E3DC] dark:border-[#262926] bg-white dark:bg-[#1D201D] p-3.5 text-sm text-[#141413] dark:text-[#F4F3EF]">
              Apple only allows Home Screen installation from{' '}
              <span className="font-medium">Safari</span>. Open this page in Safari on your iPhone or iPad, then follow the steps below.
            </div>
          )}

          {isIOS ? (
            <ol className="space-y-3 text-sm text-[#141413] dark:text-[#F4F3EF]">
              <li className="flex items-start gap-3.5 rounded-xl border border-[#E6E3DC] dark:border-[#262926] bg-white dark:bg-[#1D201D] p-3.5">
                <span className="w-6 h-6 rounded-full bg-[#F2F0EB] dark:bg-[#262926] text-xs font-medium flex items-center justify-center shrink-0 tabular-nums">
                  1
                </span>
                <div className="flex-1 pt-0.5">
                  <div className="flex items-center gap-2 font-medium">
                    <span>Tap the Share button in Safari</span>
                    <IOSShareIcon className="w-4 h-4 text-[#2F5E4E] dark:text-[#6E9F8B] shrink-0" />
                  </div>
                  <p className="mt-0.5 text-xs text-[#5C5B57] dark:text-[#9C9B95]">
                    Found in the bottom toolbar on iPhone or the top toolbar on iPad.
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-3.5 rounded-xl border border-[#E6E3DC] dark:border-[#262926] bg-white dark:bg-[#1D201D] p-3.5">
                <span className="w-6 h-6 rounded-full bg-[#F2F0EB] dark:bg-[#262926] text-xs font-medium flex items-center justify-center shrink-0 tabular-nums">
                  2
                </span>
                <div className="flex-1 pt-0.5">
                  <div className="flex items-center gap-2 font-medium">
                    <span>Select &ldquo;Add to Home Screen&rdquo;</span>
                    <PlusSquare className="w-4 h-4 text-[#2F5E4E] dark:text-[#6E9F8B] shrink-0" />
                  </div>
                  <p className="mt-0.5 text-xs text-[#5C5B57] dark:text-[#9C9B95]">
                    Scroll down in the share sheet until you see Add to Home Screen.
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-3.5 rounded-xl border border-[#E6E3DC] dark:border-[#262926] bg-white dark:bg-[#1D201D] p-3.5">
                <span className="w-6 h-6 rounded-full bg-[#F2F0EB] dark:bg-[#262926] text-xs font-medium flex items-center justify-center shrink-0 tabular-nums">
                  3
                </span>
                <div className="flex-1 pt-0.5">
                  <div className="font-medium">Tap &ldquo;Add&rdquo;</div>
                  <p className="mt-0.5 text-xs text-[#5C5B57] dark:text-[#9C9B95]">
                    Open Nwezh from your Home Screen. Prayer notifications can then be enabled inside the app.
                  </p>
                </div>
              </li>
            </ol>
          ) : isMacSafari ? (
            <ol className="space-y-3 text-sm text-[#141413] dark:text-[#F4F3EF]">
              <li className="flex items-start gap-3.5 rounded-xl border border-[#E6E3DC] dark:border-[#262926] bg-white dark:bg-[#1D201D] p-3.5">
                <span className="w-6 h-6 rounded-full bg-[#F2F0EB] dark:bg-[#262926] text-xs font-medium flex items-center justify-center shrink-0 tabular-nums">
                  1
                </span>
                <div className="flex-1 pt-0.5">
                  <div className="font-medium">Open File in the Safari menu bar</div>
                  <p className="mt-0.5 text-xs text-[#5C5B57] dark:text-[#9C9B95]">
                    Or click the Share button in the top-right corner of Safari.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3.5 rounded-xl border border-[#E6E3DC] dark:border-[#262926] bg-white dark:bg-[#1D201D] p-3.5">
                <span className="w-6 h-6 rounded-full bg-[#F2F0EB] dark:bg-[#262926] text-xs font-medium flex items-center justify-center shrink-0 tabular-nums">
                  2
                </span>
                <div className="flex-1 pt-0.5">
                  <div className="font-medium">Choose &ldquo;Add to Dock&rdquo;</div>
                  <p className="mt-0.5 text-xs text-[#5C5B57] dark:text-[#9C9B95]">
                    Nwezh will open in its own dedicated window without browser chrome.
                  </p>
                </div>
              </li>
            </ol>
          ) : (
            <div className="rounded-xl border border-[#E6E3DC] dark:border-[#262926] bg-white dark:bg-[#1D201D] p-4 text-sm text-[#141413] dark:text-[#F4F3EF] space-y-2">
              <p className="font-medium">Install from your browser menu</p>
              <p className="text-xs text-[#5C5B57] dark:text-[#9C9B95] leading-relaxed">
                Look for the Install icon in your browser&apos;s address bar or open the browser menu and select &ldquo;Install Nwezh&rdquo; or &ldquo;Add to Home Screen&rdquo;. On iPhone or iPad, open this page in Safari.
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-col gap-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full min-h-[44px] rounded-xl bg-[#141413] dark:bg-[#F4F3EF] text-[#FAF9F6] dark:text-[#141413] text-sm font-medium transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-[#2F5E4E]"
          >
            Done
          </button>
          {onContinueInBrowser && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onContinueInBrowser();
              }}
              className="w-full min-h-[44px] rounded-xl text-sm font-medium text-[#5C5B57] dark:text-[#9C9B95] hover:text-[#141413] dark:hover:text-[#F4F3EF] transition-colors"
            >
              Continue in browser instead
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

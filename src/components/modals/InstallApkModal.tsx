import React, { useState } from 'react';
import {
  X,
  Download,
  Smartphone,
  QrCode,
  Check,
  Copy,
  ExternalLink,
  ShieldCheck,
  HardDriveDownload,
  Share2,
} from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface InstallApkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallApkModal: React.FC<InstallApkModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'install' | 'apk' | 'qr'>('install');

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://hikmat-ledger.app';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenPwaBuilder = () => {
    const pwaBuilderUrl = `https://www.pwabuilder.com/reportcard?url=${encodeURIComponent(currentUrl)}`;
    window.open(pwaBuilderUrl, '_blank');
  };

  // SVG QR Code generator representation
  const qrSvgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(currentUrl)}&bgcolor=0f172a&color=38bdf8&margin=4`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-4">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Install Mobile App / Download APK
              </h3>
              <p className="text-xs text-slate-400">
                HIKMAT LEDGER PRO · By HIKMAT MOBILE SOFTWARE
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="px-6 pt-4 border-b border-slate-800 flex gap-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('install')}
            className={`pb-2.5 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'install'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            1-Tap Install (Recommended)
          </button>
          <button
            onClick={() => setActiveTab('apk')}
            className={`pb-2.5 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'apk'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Download Standalone APK
          </button>
          <button
            onClick={() => setActiveTab('qr')}
            className={`pb-2.5 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'qr'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Scan QR on Mobile
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* TAB 1: 1-Tap Install */}
          {activeTab === 'install' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white font-extrabold text-lg shadow-md shrink-0">
                  HLP
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">HIKMAT LEDGER PRO</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Full-Screen Standalone Mobile App · 100% Offline Capable
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-emerald-400">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Certified Web App Manifest & Service Worker</span>
                  </div>
                </div>
              </div>

              {isInstalled ? (
                <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800 text-center">
                  <span className="text-xs font-bold text-emerald-300 block">
                    ✓ Application is Already Installed!
                  </span>
                  <p className="text-[11px] text-slate-400 mt-1">
                    You are running HIKMAT LEDGER PRO in standalone app mode on your device.
                  </p>
                </div>
              ) : isInstallable ? (
                <button
                  onClick={async () => {
                    await install();
                  }}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Install App on Mobile Phone Now</span>
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-900/60 text-xs text-blue-200">
                    <p className="font-bold mb-1">How to Install on Android Mobile:</p>
                    <ol className="list-decimal list-inside space-y-1 text-slate-300 text-[11px]">
                      <li>Open this web page in <strong>Google Chrome</strong> on your mobile phone.</li>
                      <li>Tap the <strong>three dots (⋮)</strong> at the top-right corner.</li>
                      <li>Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</li>
                      <li>The app icon will immediately appear on your mobile home screen like an APK!</li>
                    </ol>
                  </div>

                  {isIOS && (
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
                      <p className="font-bold text-white mb-1">On iPhone / iPad (Safari):</p>
                      <p className="text-[11px] text-slate-400">
                        1. Tap the <strong>Share</strong> button (box with up arrow) in Safari.<br />
                        2. Scroll down and tap <strong>"Add to Home Screen"</strong>.<br />
                        3. Tap <strong>"Add"</strong> at the top right.
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="border-t border-slate-800 pt-3">
                <span className="text-[11px] text-slate-500 uppercase font-bold tracking-wider block mb-2">
                  Share App Link to Phone
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={currentUrl}
                    className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 font-mono truncate"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Download Standalone APK */}
          {activeTab === 'apk' && (
            <div className="space-y-4 text-xs text-slate-300">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <HardDriveDownload className="w-4 h-4 text-blue-400" />
                  <span>Build Signed Android APK (.apk)</span>
                </h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Because this app has a complete Progressive Web App (PWA) manifest and icons, you can generate a standard signed Android <strong>.APK package</strong> with 1-click via PWABuilder (maintained by Microsoft & Google):
                </p>

                <div className="mt-3 p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1.5 text-[11px]">
                  <div className="flex gap-2">
                    <span className="font-bold text-blue-400">Step 1:</span>
                    <span>Click the button below to open PWABuilder.</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-bold text-blue-400">Step 2:</span>
                    <span>Your app's manifest will be automatically verified (100% compliant).</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-bold text-blue-400">Step 3:</span>
                    <span>Click <strong>"Package for Android"</strong> to download your signed <strong>.apk</strong> file!</span>
                  </div>
                </div>

                <button
                  onClick={handleOpenPwaBuilder}
                  className="mt-4 w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open 1-Click APK Builder (PWABuilder)</span>
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400">
                <span className="font-bold text-slate-300">Tip for Pakistani Shopkeepers: </span>
                The <strong>1-Tap Install</strong> (under the first tab) does not require downloading any 50MB files—it installs straight onto your Android home screen in 2 seconds and works offline without consuming phone storage!
              </div>
            </div>
          )}

          {/* TAB 3: Scan QR on Mobile */}
          {activeTab === 'qr' && (
            <div className="space-y-4 text-center">
              <p className="text-xs text-slate-300">
                Scan this QR code with your mobile camera to open & install directly on your phone:
              </p>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 inline-block mx-auto shadow-inner">
                <img
                  src={qrSvgUrl}
                  alt="QR Code for Mobile App"
                  className="w-48 h-48 mx-auto rounded-lg"
                />
              </div>

              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={handleCopyLink}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Link Copied!' : 'Copy Mobile Link'}</span>
                </button>
              </div>

              <p className="text-[11px] text-slate-500">
                Open in Chrome or Samsung Internet on Android, then tap "Install".
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[10px] text-slate-500">
            HIKMAT MOBILE SOFTWARE · Android APK & PWA Engine
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 rounded-lg cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

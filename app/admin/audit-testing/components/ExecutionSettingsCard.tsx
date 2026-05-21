'use client';

interface ExecutionSettings {
  sequential: boolean;
  maxConcurrency: number;
  timeoutProfile: 'safe' | 'fast' | 'extended';
  storeArtifacts: boolean;
  captureScreenshots: boolean;
}

interface Props {
  settings: ExecutionSettings;
  onSettingsChange: (settings: ExecutionSettings) => void;
}

export function ExecutionSettingsCard({ settings, onSettingsChange }: Props) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Execution Settings</h3>

      <div className="space-y-6">
        {/* Execution Mode */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-3">Execution Mode</label>
          <div className="space-y-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                checked={settings.sequential}
                onChange={() => onSettingsChange({ ...settings, sequential: true })}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm text-gray-700">Sequential (safer, less resource usage)</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                checked={!settings.sequential}
                onChange={() => onSettingsChange({ ...settings, sequential: false })}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm text-gray-700">Concurrent (faster, higher resource usage)</span>
            </label>
          </div>
        </div>

        {/* Max Concurrency */}
        {!settings.sequential && (
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-3">Max Concurrency</label>
            <div className="flex gap-2">
              {[1, 2, 3].map((value) => (
                <button
                  key={value}
                  onClick={() => onSettingsChange({ ...settings, maxConcurrency: value })}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    settings.maxConcurrency === value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Timeout Profile */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-3">Timeout Profile</label>
          <div className="grid grid-cols-3 gap-2">
            {(['safe', 'fast', 'extended'] as const).map((profile) => (
              <button
                key={profile}
                onClick={() => onSettingsChange({ ...settings, timeoutProfile: profile })}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                  settings.timeoutProfile === profile
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {profile.charAt(0).toUpperCase() + profile.slice(1)}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {settings.timeoutProfile === 'safe' && 'More lenient timeouts (60s per test)'}
            {settings.timeoutProfile === 'fast' && 'Standard timeouts (30s per test)'}
            {settings.timeoutProfile === 'extended' && 'Extended timeouts (120s per test)'}
          </p>
        </div>

        {/* Artifact Storage */}
        <div className="border-t border-gray-200 pt-6">
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.storeArtifacts}
                onChange={(e) => onSettingsChange({ ...settings, storeArtifacts: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm text-gray-700">Store artifacts (screenshots, videos, traces)</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.captureScreenshots}
                onChange={(e) => onSettingsChange({ ...settings, captureScreenshots: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm text-gray-700">Capture screenshots on failure</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

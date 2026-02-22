/**
 * Fraud Detection Test Simulator
 * Interactive demo tool for presenting all 6 fraud detection rules
 */

import React, { useState } from 'react';
import { transactionService } from '../../services/transactionService';

// ─── Geolocation helpers (client-side, for Rule 4 demo) ──────────────────────

const toRad = (deg) => (deg * Math.PI) / 180;

const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

const PRESET_CITIES = [
  { name: 'London, UK',          lat: 51.5074,  lon: -0.1278  },
  { name: 'Paris, France',       lat: 48.8566,  lon:  2.3522  },
  { name: 'New York, USA',       lat: 40.7128,  lon: -74.006  },
  { name: 'Toronto, Canada',     lat: 43.6532,  lon: -79.3832 },
  { name: 'Dubai, UAE',          lat: 25.2048,  lon:  55.2708 },
  { name: 'Tokyo, Japan',        lat: 35.6762,  lon: 139.6503 },
  { name: 'Sydney, Australia',   lat: -33.8688, lon: 151.2093 },
  { name: 'Cape Town, S.Africa', lat: -33.9249, lon:  18.4241 },
];

const MAX_SPEED_KMH = 800; // same threshold as backend config

// ─── Shared UI helpers ────────────────────────────────────────────────────────

const Badge = ({ level }) => {
  const colours = {
    HIGH:   'bg-red-100 text-red-800 border-red-200',
    MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    LOW:    'bg-green-100 text-green-800 border-green-200',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${colours[level] || colours.LOW}`}>
      {level}
    </span>
  );
};

const StatusBadge = ({ status }) => {
  const map = {
    completed: 'bg-green-100 text-green-800',
    pending:   'bg-yellow-100 text-yellow-800',
    on_hold:   'bg-orange-100 text-orange-800',
    rejected:  'bg-red-100 text-red-800',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${map[status] || 'bg-gray-100 text-gray-800'}`}>
      {status?.replace('_', ' ').toUpperCase()}
    </span>
  );
};

const ResultPanel = ({ result }) => {
  if (!result) return null;

  if (result.error) {
    return (
      <div className="mt-3 rounded-md bg-red-50 p-3 text-sm text-red-800 border border-red-200">
        <strong>Error:</strong> {result.error}
      </div>
    );
  }

  const { transaction, fraudAlert } = result;

  return (
    <div className={`mt-3 rounded-md p-3 text-sm border ${fraudAlert ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold text-gray-700">Transaction Result</span>
        <StatusBadge status={transaction?.status} />
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-gray-600">
        <span>Amount:</span>    <span className="font-mono font-medium">£{parseFloat(transaction?.amount || 0).toLocaleString()}</span>
        <span>Risk Score:</span><span className="font-mono font-medium">{transaction?.riskScore ?? '—'}</span>
        <span>Risk Level:</span><span><Badge level={transaction?.riskLevel || 'LOW'} /></span>
      </div>
      {fraudAlert && (
        <div className="mt-2 pt-2 border-t border-yellow-200">
          <p className="font-medium text-yellow-800">{fraudAlert.message}</p>
          <ul className="mt-1 list-disc list-inside text-yellow-700 space-y-0.5">
            {fraudAlert.rules?.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
};

// ─── Scenario runner ──────────────────────────────────────────────────────────

const useScenario = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);

  const run = async (transactionData) => {
    setLoading(true);
    setResult(null);
    try {
      const data = await transactionService.createTransaction(transactionData);
      setResult(data);
    } catch (err) {
      setResult({ error: err.response?.data?.error || err.message });
    } finally {
      setLoading(false);
    }
  };

  return { loading, result, run };
};

// ─── Rule Cards ───────────────────────────────────────────────────────────────

const RuleCard = ({ number, title, riskLevel, description, thresholds, children }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
      <button
        className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-gray-50 transition-colors"
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex items-center gap-3">
          <span className="flex-shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-800 text-white text-xs font-bold">
            {number}
          </span>
          <span className="font-semibold text-gray-800">{title}</span>
          <Badge level={riskLevel} />
        </div>
        <svg className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="px-4 pb-4 pt-2 bg-white border-t border-gray-100">
          <p className="text-sm text-gray-600 mb-3">{description}</p>

          {thresholds && (
            <div className="mb-3 bg-gray-50 rounded p-2 text-sm">
              <p className="font-medium text-gray-700 mb-1">Thresholds</p>
              <ul className="space-y-0.5 text-gray-600 list-disc list-inside">
                {thresholds.map((t, i) => <li key={i}>{t}</li>)}
              </ul>
            </div>
          )}

          {children}
        </div>
      )}
    </div>
  );
};

// ─── Rule 4 — Geolocation Demo Panel ─────────────────────────────────────────

const GeolocationDemo = () => {
  const [cityA, setCityA] = useState(0);
  const [cityB, setCityB] = useState(2);
  const [hours, setHours]  = useState(1);

  const locA = PRESET_CITIES[cityA];
  const locB = PRESET_CITIES[cityB];
  const dist  = haversineDistance(locA.lat, locA.lon, locB.lat, locB.lon);
  const speed = hours > 0 ? Math.round(dist / hours) : Infinity;
  const impossible = speed > MAX_SPEED_KMH;

  return (
    <div className="mt-2">
      <p className="text-sm font-medium text-gray-700 mb-2">Interactive Geolocation Calculator</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Login location</label>
          <select
            value={cityA}
            onChange={e => setCityA(Number(e.target.value))}
            className="w-full text-sm border border-gray-300 rounded px-2 py-1.5"
          >
            {PRESET_CITIES.map((c, i) => <option key={i} value={i}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Transaction location</label>
          <select
            value={cityB}
            onChange={e => setCityB(Number(e.target.value))}
            className="w-full text-sm border border-gray-300 rounded px-2 py-1.5"
          >
            {PRESET_CITIES.map((c, i) => <option key={i} value={i}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Time between events (hours)</label>
          <input
            type="number"
            min="0.1"
            step="0.1"
            value={hours}
            onChange={e => setHours(Number(e.target.value))}
            className="w-full text-sm border border-gray-300 rounded px-2 py-1.5"
          />
        </div>
      </div>

      <div className={`rounded-md p-3 border text-sm ${impossible ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <span className="text-gray-600">From:</span>         <span className="font-medium">{locA.name} ({locA.lat.toFixed(2)}, {locA.lon.toFixed(2)})</span>
          <span className="text-gray-600">To:</span>           <span className="font-medium">{locB.name} ({locB.lat.toFixed(2)}, {locB.lon.toFixed(2)})</span>
          <span className="text-gray-600">Distance:</span>     <span className="font-mono font-medium">{dist.toLocaleString()} km</span>
          <span className="text-gray-600">Time elapsed:</span> <span className="font-mono font-medium">{hours} hour{hours !== 1 ? 's' : ''}</span>
          <span className="text-gray-600">Travel speed:</span> <span className={`font-mono font-semibold ${impossible ? 'text-red-700' : 'text-green-700'}`}>{speed.toLocaleString()} km/h</span>
          <span className="text-gray-600">Max allowed:</span>  <span className="font-mono">{MAX_SPEED_KMH} km/h (≈ commercial jet)</span>
        </div>
        <div className={`mt-3 flex items-center gap-2 font-semibold ${impossible ? 'text-red-700' : 'text-green-700'}`}>
          {impossible ? (
            <>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
              IMPOSSIBLE TRAVEL DETECTED — Transaction would be flagged (HIGH risk, score +10)
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
              Travel is plausible — No flag triggered
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const FraudTestSimulator = () => {
  // Rule 5 — Transaction Velocity
  const velocity1 = useScenario();
  const velocity2 = useScenario();
  const velocity3 = useScenario();

  // Rule 6 — New Beneficiary
  const beneficiary1 = useScenario();
  const beneficiary2 = useScenario();

  const runVelocityBurst = async () => {
    // Fire 3 transactions in quick succession to the same account
    const payload = {
      beneficiaryName: 'Velocity Test Recipient',
      beneficiaryAccount: 'GB29NWBK60161331926819',
      amount: 100,
    };
    await velocity1.run(payload);
    await velocity2.run(payload);
    await velocity3.run(payload);
  };

  const [velocityBurstLoading, setVelocityBurstLoading] = useState(false);
  const [velocityBurstResults, setVelocityBurstResults] = useState([]);

  const runBurst = async () => {
    setVelocityBurstLoading(true);
    setVelocityBurstResults([]);
    const payload = { beneficiaryName: 'Burst Test', beneficiaryAccount: 'GB12TEST00001234567890', amount: 200 };
    const results = [];
    for (let i = 0; i < 3; i++) {
      try {
        results.push(await transactionService.createTransaction(payload));
      } catch (err) {
        results.push({ error: err.response?.data?.error || err.message });
      }
    }
    setVelocityBurstResults(results);
    setVelocityBurstLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Fraud Detection Test Simulator</h1>
        <p className="mt-1 text-sm text-gray-600">
          Interactive tool to demonstrate all 6 fraud detection rules. Expand a rule to view
          its thresholds or trigger a live test against the backend.
        </p>
      </div>

      {/* Risk Score Key */}
      <div className="mb-6 grid grid-cols-4 gap-3 text-center text-xs">
        {[
          { range: 'Score 0',   label: 'Completed',  colour: 'bg-green-100 text-green-800 border-green-200' },
          { range: 'Score 5–9', label: 'Pending',    colour: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
          { range: 'Score ≥10', label: 'On Hold',    colour: 'bg-orange-100 text-orange-800 border-orange-200' },
          { range: 'Score ≥15', label: 'Rejected',   colour: 'bg-red-100 text-red-800 border-red-200' },
        ].map(({ range, label, colour }) => (
          <div key={label} className={`rounded-md border p-2 font-medium ${colour}`}>
            <div>{label}</div>
            <div className="font-mono mt-0.5">{range}</div>
          </div>
        ))}
      </div>

      {/* Rules */}
      <div className="space-y-3">

        {/* Rule 1 */}
        <RuleCard
          number="1"
          title="Multiple IP Login Detection"
          riskLevel="MEDIUM"
          description="Flags when the same account logs in from 3 or more distinct IP addresses within a 5-minute window. Indicates potential credential sharing or account takeover."
          thresholds={[
            '≥ 3 unique IPs within 5 minutes triggers the rule',
            'Risk score: +5 (MEDIUM)',
            'Action: Step-up authentication (OTP required)',
          ]}
        >
          <div className="rounded bg-blue-50 border border-blue-200 p-3 text-sm text-blue-800">
            <strong>Live demo note:</strong> This rule fires during <em>login</em>. To trigger it, sign in
            from 3 different network connections (e.g. VPN, mobile hotspot, regular Wi-Fi) within 5 minutes.
            The system will require OTP verification.
          </div>
        </RuleCard>

        {/* Rule 2 */}
        <RuleCard
          number="2"
          title="Excessive Failed Login Attempts"
          riskLevel="HIGH"
          description="Detects brute-force attacks by counting failed password attempts. After 3 failures a CAPTCHA challenge is shown; after 5 failures the account is locked and an unlock email is sent."
          thresholds={[
            '≥ 3 failed attempts within 10 minutes → CAPTCHA required',
            '≥ 5 failed attempts within 10 minutes → Account locked',
            'Risk score: +10 (HIGH)',
            'Action: Account lock + unlock email with time-limited token',
          ]}
        >
          <div className="rounded bg-blue-50 border border-blue-200 p-3 text-sm text-blue-800">
            <strong>Live demo note:</strong> Enter the wrong password 3 times on the Login page.
            A math CAPTCHA will appear. Enter it incorrectly 2 more times to trigger account lockout.
            An unlock email will be sent automatically.
          </div>
        </RuleCard>

        {/* Rule 3 */}
        <RuleCard
          number="3"
          title="New Device Detection"
          riskLevel="MEDIUM"
          description="Identifies logins from devices that have not been seen before. Each device is fingerprinted by browser agent, screen dimensions, timezone, and language. Unrecognised devices require OTP before the session is trusted."
          thresholds={[
            'Any login from an unrecognised device fingerprint',
            'Device is trusted after first successful OTP verification (30-day trust period)',
            'Risk score: +5 (MEDIUM)',
            'Action: Step-up authentication (OTP required)',
          ]}
        >
          <div className="rounded bg-blue-50 border border-blue-200 p-3 text-sm text-blue-800">
            <strong>Live demo note:</strong> Open the app in a private/incognito window or a different
            browser. The device fingerprint will differ; OTP will be required and the blue
            "New device detected" banner will appear.
          </div>
        </RuleCard>

        {/* Rule 4 */}
        <RuleCard
          number="4"
          title="Geolocation Anomaly — Impossible Travel"
          riskLevel="HIGH"
          description="Compares the IP-derived location of each login (and transaction) against the previous known location. If the implied travel speed exceeds 800 km/h (commercial jet speed), the event is flagged as impossible travel."
          thresholds={[
            'Travel speed > 800 km/h between two events',
            'Applied to both logins AND transactions',
            'Risk score: +10 (HIGH)',
            'Action: Block / On-Hold',
          ]}
        >
          <GeolocationDemo />
        </RuleCard>

        {/* Rule 5 */}
        <RuleCard
          number="5"
          title="Transaction Velocity — High-Value Rapid Succession"
          riskLevel="HIGH"
          description="Detects two patterns: (a) 3 or more transactions within 2 minutes, or (b) a single transaction that exceeds twice the user's 30-day average. Either condition triggers the rule."
          thresholds={[
            '≥ 3 transactions within 2 minutes (rapid burst)',
            'Transaction amount > 2× 30-day average',
            'Risk score: +10 (HIGH)',
            'Action: Transaction put on hold',
          ]}
        >
          <div className="space-y-3">
            {/* Rapid burst test */}
            <div className="rounded border border-gray-200 p-3">
              <p className="text-sm font-medium text-gray-700 mb-1">Test A — Rapid Burst (3 transactions in &lt; 2 min)</p>
              <p className="text-xs text-gray-500 mb-2">
                Sends 3 small transactions in quick succession. The third should trigger the velocity rule.
              </p>
              <button
                onClick={runBurst}
                disabled={velocityBurstLoading}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded bg-gray-800 text-white hover:bg-gray-700 disabled:opacity-50"
              >
                {velocityBurstLoading ? 'Running burst...' : '▶ Run Rapid Burst Test'}
              </button>
              {velocityBurstResults.length > 0 && (
                <div className="mt-2 space-y-2">
                  {velocityBurstResults.map((r, i) => (
                    <div key={i} className="text-xs">
                      <span className="font-medium text-gray-600">Transaction {i + 1}: </span>
                      {r.error ? (
                        <span className="text-red-600">{r.error}</span>
                      ) : (
                        <>
                          <StatusBadge status={r.transaction?.status} />
                          {' '}Risk score: <span className="font-mono">{r.transaction?.riskScore}</span>
                          {r.fraudAlert && <span className="ml-2 text-orange-700 font-medium">⚠ {r.fraudAlert.rules?.[0]}</span>}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* High-value test */}
            <div className="rounded border border-gray-200 p-3">
              <p className="text-sm font-medium text-gray-700 mb-1">Test B — High Value (2× average)</p>
              <p className="text-xs text-gray-500 mb-2">
                Sends a £25,000 transaction. If above twice your 30-day average, the velocity rule triggers.
              </p>
              <button
                onClick={() => velocity1.run({
                  beneficiaryName:    'High Value Test',
                  beneficiaryAccount: 'GB29NWBK60161331926819',
                  amount:             25000,
                })}
                disabled={velocity1.loading}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded bg-gray-800 text-white hover:bg-gray-700 disabled:opacity-50"
              >
                {velocity1.loading ? 'Running...' : '▶ Send £25,000 Transaction'}
              </button>
              <ResultPanel result={velocity1.result} />
            </div>
          </div>
        </RuleCard>

        {/* Rule 6 */}
        <RuleCard
          number="6"
          title="New Beneficiary + High Amount"
          riskLevel="MEDIUM"
          description="When sending money to a new (unseen) beneficiary, extra scrutiny applies. New users (< 30 days OR < 5 transactions) are flagged if the amount is ≥ £5,000. Established users are flagged if the amount falls in the top 10% (90th percentile) of their transaction history."
          thresholds={[
            'New user AND amount ≥ £5,000 to a new beneficiary',
            'Established user AND amount ≥ 90th percentile of history to a new beneficiary',
            'Requires ≥ 5 historical transactions to compute percentile',
            'Risk score: +5 (MEDIUM)',
            'Action: 5-minute cooling-off period (transaction stays pending)',
          ]}
        >
          <div className="space-y-3">
            {/* New user high amount */}
            <div className="rounded border border-gray-200 p-3">
              <p className="text-sm font-medium text-gray-700 mb-1">Test A — High value to new beneficiary</p>
              <p className="text-xs text-gray-500 mb-2">
                Sends £6,000 to a unique new beneficiary. Triggers the new-user threshold (£5,000) or the 90th-percentile check for established users.
              </p>
              <button
                onClick={() => beneficiary1.run({
                  beneficiaryName:    'New Beneficiary Test',
                  beneficiaryAccount: `GB${Date.now()}TEST`,
                  amount:             6000,
                })}
                disabled={beneficiary1.loading}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded bg-gray-800 text-white hover:bg-gray-700 disabled:opacity-50"
              >
                {beneficiary1.loading ? 'Running...' : '▶ Send £6,000 to New Beneficiary'}
              </button>
              <ResultPanel result={beneficiary1.result} />
            </div>

            {/* Small amount — should pass */}
            <div className="rounded border border-gray-200 p-3">
              <p className="text-sm font-medium text-gray-700 mb-1">Test B — Low value to new beneficiary (should pass)</p>
              <p className="text-xs text-gray-500 mb-2">
                Sends £50 to a new beneficiary. Below any threshold — should complete with no flag.
              </p>
              <button
                onClick={() => beneficiary2.run({
                  beneficiaryName:    'Safe Payment Test',
                  beneficiaryAccount: `GB${Date.now() + 1}SAFE`,
                  amount:             50,
                })}
                disabled={beneficiary2.loading}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded bg-gray-800 text-white hover:bg-gray-700 disabled:opacity-50"
              >
                {beneficiary2.loading ? 'Running...' : '▶ Send £50 to New Beneficiary'}
              </button>
              <ResultPanel result={beneficiary2.result} />
            </div>
          </div>
        </RuleCard>

      </div>

      {/* Footer note */}
      <p className="mt-6 text-xs text-gray-400 text-center">
        All tests use your authenticated session. Transactions created during testing will appear in your dashboard.
      </p>
    </div>
  );
};

export default FraudTestSimulator;

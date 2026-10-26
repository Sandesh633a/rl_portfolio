// src/components/TickerInput.jsx
import { useState } from 'react';
import { Plus, X, AlertCircle } from 'lucide-react';

export default function TickerInput({ tickers, onChange, disabled }) {
  const [inputVal, setInputVal] = useState('');
  const [error, setError] = useState('');

  const addTicker = () => {
    const t = inputVal.trim().toUpperCase();
    if (!t) return;
    if (tickers.includes(t)) { setError('Ticker already added'); return; }
    if (tickers.length >= 10) { setError('Maximum 10 tickers allowed'); return; }
    setError('');
    onChange([...tickers, t]);
    setInputVal('');
  };

  const removeTicker = (ticker) => {
    onChange(tickers.filter(t => t !== ticker));
    setError('');
  };

  const handleKey = (e) => {
    if (e.key === 'Enter') addTicker();
  };

  return (
    <div>
      {/* Input row */}
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          className="field"
          value={inputVal}
          onChange={e => { setInputVal(e.target.value); setError(''); }}
          onKeyDown={handleKey}
          placeholder="e.g. RELIANCE.NS, TCS.NS"
          disabled={disabled}
        />
        <button
          className="btn btn-primary"
          onClick={addTicker}
          disabled={disabled || tickers.length >= 10}
          style={{ borderRadius: 10, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap', fontSize: 13 }}
        >
          <Plus size={15} />
          Add
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, color: 'var(--coral)', fontSize: 13 }}>
          <AlertCircle size={13} />
          {error}
        </div>
      )}

      {/* Ticker count indicator */}
      <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 6 }}>
        {tickers.length} / 10 tickers added
        {tickers.length < 3 && <span style={{ color: 'var(--amber)', marginLeft: 8 }}>⚠ Minimum 3 required</span>}
      </div>

      {/* Tags */}
      {tickers.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 12 }}>
          {tickers.map(ticker => (
            <div key={ticker} className="tag">
              {ticker}
              {!disabled && (
                <button
                  onClick={() => removeTicker(ticker)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--b400)', display: 'flex', padding: 0 }}
                >
                  <X size={12} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Quick presets */}
      {!disabled && tickers.length === 0 && (
        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 8 }}>Quick presets:</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[
              ['RELIANCE.NS', 'TCS.NS', 'INFY.NS', 'HDFCBANK.NS', 'WIPRO.NS'],
              ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA'],
            ].map((preset, i) => (
              <button
                key={i}
                className="btn btn-ghost"
                onClick={() => onChange(preset)}
                style={{ fontSize: 12, padding: '5px 12px', borderRadius: 8 }}
              >
                {i === 0 ? '🇮🇳 NSE Top 5' : '🇺🇸 US Tech 5'}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

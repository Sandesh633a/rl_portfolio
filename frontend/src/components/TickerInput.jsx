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
          className="input-field"
          value={inputVal}
          onChange={e => { setInputVal(e.target.value); setError(''); }}
          onKeyDown={handleKey}
          placeholder="e.g. RELIANCE.NS, TCS.NS"
          disabled={disabled}
        />
        <button
          className="btn-primary"
          onClick={addTicker}
          disabled={disabled || tickers.length >= 10}
          style={{ borderRadius: 10, padding: '10px 18px', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap', fontSize: 14 }}
        >
          <Plus size={16} />
          Add
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, color: '#f87171', fontSize: 13 }}>
          <AlertCircle size={13} />
          {error}
        </div>
      )}

      {/* Ticker count indicator */}
      <div style={{ fontSize: 12, color: '#475569', marginTop: 6 }}>
        {tickers.length} / 10 tickers added
        {tickers.length < 3 && <span style={{ color: '#f59e0b', marginLeft: 8 }}>⚠ Minimum 3 required</span>}
      </div>

      {/* Tags */}
      {tickers.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
          {tickers.map(ticker => (
            <div key={ticker} className="ticker-tag">
              {ticker}
              {!disabled && (
                <button
                  onClick={() => removeTicker(ticker)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#60a5fa', display: 'flex', padding: 0 }}
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
          <div style={{ fontSize: 12, color: '#475569', marginBottom: 8 }}>Quick presets:</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[
              ['RELIANCE.NS', 'TCS.NS', 'INFY.NS', 'HDFCBANK.NS', 'WIPRO.NS'],
              ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA'],
            ].map((preset, i) => (
              <button
                key={i}
                className="btn-ghost"
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

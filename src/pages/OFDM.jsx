import React, { useState } from "react";

export default function OFDMSystemsCalculator() {
  const [inputs, setInputs] = useState({
    modulationOrder: "",
    resourceElementsPerRB: "",
    symbolsPerRB: "",
    parallelRBs: "",
    bandwidth: "",
    symbolTime: "",
  });
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  const handleCalculate = () => {
    const M = Number(inputs.modulationOrder);
    const REperRB = Number(inputs.resourceElementsPerRB);
    const symbolsPerRB = Number(inputs.symbolsPerRB);
    const RBs = Number(inputs.parallelRBs);
    const BW = Number(inputs.bandwidth);
    const T_sym = Number(inputs.symbolTime);

    if (!M || !REperRB || !symbolsPerRB || !RBs || !BW || !T_sym) {
      setResult("Please fill in all required fields.");
      return;
    }

    const bitsPerRE = Math.log2(M);
    const dataPerOFDMSymbol = bitsPerRE * REperRB;
    const dataPerRB = bitsPerRE * REperRB * symbolsPerRB;
    const maxTransmission = dataPerRB * RBs;
    const totalBitRate = maxTransmission / T_sym;
    const spectralEfficiency = totalBitRate / BW;

    setResult({
      bitsPerRE,
      dataPerOFDMSymbol,
      dataPerRB,
      maxTransmission,
      totalBitRate,
      spectralEfficiency,
      explanation: null,
    });

    fetch("http://localhost:8000/api/ofdm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        m_order: M,
        n_subcarriers: REperRB,
        t_sym: T_sym,
        n_symbols_prb: symbolsPerRB,
        n_prb_parallel: RBs,
        bandwidth: BW,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setResult((prev) => ({ ...prev, explanation: data.explanation }));
      });
  };

 
  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2 style={titleStyle}>OFDM Systems Calculator</h2>
        <p style={subtitleStyle}>
          <span>
            Calculate data rates for resource elements, OFDM symbols, resource
            blocks, parallel blocks, and spectral efficiency.
          </span>
          <br />
          <span style={{ fontSize: "0.97em", color: "#888" }}>
            (Resource Element → Symbol → Block → System)
          </span>
        </p>
        <details style={{ marginBottom: "1.3em" }}>
          <summary style={{ fontWeight: "bold", cursor: "pointer" }}>
            What does this calculate?
          </summary>
          <div style={{ color: "#666", fontSize: "1em", paddingLeft: "1.5em" }}>
            <ul>
              <li><b>Modulation Order (M):</b> Bits per symbol, e.g. 2 (BPSK), 4 (QPSK), 16, 64...</li>
              <li><b>Resource Elements per RB:</b> Number of subcarriers × symbols per RB (e.g. 84 for LTE)</li>
              <li><b>Symbols per RB:</b> Number of OFDM symbols in one RB (e.g. 7 or 14)</li>
              <li><b>Parallel RBs:</b> Number of RBs used in parallel</li>
              <li><b>Bandwidth (Hz):</b> System bandwidth for spectral efficiency</li>
              <li><b>Symbol Time (s):</b> Duration of one OFDM symbol</li>
            </ul>
          </div>
        </details>
        <div style={{ display: "flex", flexDirection: "column", gap: "17px" }}>
          {renderInput("Modulation Order (M)", "modulationOrder", "e.g. 2, 4, 16, 64", "e.g. 2 for BPSK, 4 for QPSK, 16 for 16QAM, etc.", inputs, handleChange)}
          {renderInput("Resource Elements per RB", "resourceElementsPerRB", "e.g. 84", "Subcarriers × symbols per RB (e.g. 12 × 7 = 84)", inputs, handleChange)}
          {renderInput("Symbols per RB", "symbolsPerRB", "e.g. 7", "Number of OFDM symbols in one RB (e.g. 7, 14...)", inputs, handleChange)}
          {renderInput("Parallel RBs", "parallelRBs", "e.g. 25", "Number of RBs used simultaneously in the system", inputs, handleChange)}
          {renderInput("Bandwidth (Hz)", "bandwidth", "e.g. 20000000", "System bandwidth (e.g. 20,000,000 for 20 MHz)", inputs, handleChange)}
          {renderInput("OFDM Symbol Time (s)", "symbolTime", "e.g. 7.14e-6", "Typical LTE OFDM symbol duration (e.g. 7.14 μs)", inputs, handleChange)}
        </div>
          <div style={{ marginTop: "30px", display: "flex", justifyContent: "center" }}>
          <button style={buttonStyle} onClick={handleCalculate}>Calculate</button>
        </div>
        {result && typeof result === "object" && (
          <div style={{ marginTop: 30, fontSize: "1.12rem" }}>
            <strong>Results:</strong>
            <ul style={{ textAlign: "left", lineHeight: 1.7 }}>
              <li><strong>Data per Resource Element (RE):</strong> {result.bitsPerRE.toFixed(2)} <b>bits/symbol</b></li>
              <li><strong>Data per OFDM Symbol:</strong> {result.dataPerOFDMSymbol.toLocaleString()} <b>bits</b></li>
              <li><strong>Data per Resource Block (RB):</strong> {result.dataPerRB.toLocaleString()} <b>bits</b></li>
              <li><strong>Max Transmission (all parallel RBs):</strong> {result.maxTransmission.toLocaleString()} <b>bits</b></li>
              <li><strong>Total Bitrate:</strong> {result.totalBitRate.toLocaleString()} <b>bits/sec</b></li>
              <li><strong>Spectral Efficiency:</strong> {result.spectralEfficiency.toFixed(4)} <b>bits/sec/Hz</b></li>
            </ul>
            {result.explanation && (
              <div style={{
                marginTop: 25,
                padding: "20px",
                background: "#f5f8ff",
                borderRadius: "14px",
                color: "#222",
                fontSize: "1.05rem",
                lineHeight: 1.7,
                whiteSpace: "pre-wrap"
              }}>
                <strong style={{ display: "block", fontSize: "1.13rem", marginBottom: 6 }}>Explanation in Simple Words:</strong>
                {result.explanation}
              </div>
            )}
          </div>
        )}
        {result && typeof result === "string" && (
          <div style={errorBox}>{result}</div>
        )}
      </div>
    </div>
  );
}

const renderInput = (label, name, placeholder, help, state, onChange) => (
  <label>
    <b>{label}</b>
    <input
      type="number"
      step="any"
      name={name}
      value={state[name]}
      onChange={onChange}
      placeholder={placeholder}
      style={inputStyle}
    />
    <div style={helpText}>{help}</div>
  </label>
);
const containerStyle = {
  minHeight: "100vh",
  width: "100vw",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#f6e6ea",          // pinkish bg
  margin: 0, padding: 0,
};

const cardStyle = {
  width: "90vw",
  maxWidth: "520px",
  background: "#fff",
  borderRadius: "20px",
  padding: "38px 32px",
  boxShadow: "0 4px 32px rgba(0,0,0,0.08)",
};

const titleStyle = {
  fontWeight: 800,
  fontSize: "2.1rem",
  marginBottom: 5,
  textAlign: "center",
  color: "#ad1457",               // headline pink
};

const subtitleStyle = {
  textAlign: "center",
  color: "#555",
  fontSize: "1.07em",
  marginTop: 0,
  marginBottom: 22,
};

const inputStyle = {
  width: "100%",
  fontSize: "1rem",
  padding: "10px",
  borderRadius: "8px",
  border: "1px solid #ec407a",     // pink border
  marginTop: "6px",
  marginBottom: "3px",
  background: "#faf0f2",           // light pink fill
  outline: "none",
};

const helpText = {
  fontSize: "0.94em",
  color: "#888",
  marginTop: "1.5px",
  marginBottom: "-1px",
};

const buttonStyle = {
  padding: "11px 28px",
  borderRadius: "8px",
  fontWeight: "bold",
  fontSize: "1.07rem",
  background: "#e91e63",          // pink button
  color: "white",
  border: "none",
  cursor: "pointer",
  transition: "all 0.17s",
};

const errorBox = {
  marginTop: 20,
  background: "#fde0dc",          // soft pink error
  borderRadius: 10,
  padding: 16,
  whiteSpace: "pre-wrap",
};
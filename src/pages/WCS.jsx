import React, { useState } from "react";
import { getWCSExplanation } from "../services/wcsService";

export default function WirelessCommsCalculator() {
  const [inputs, setInputs] = useState({
    bandwidth: "",
    quantizerBits: "",
    sourceEncodingRatio: "1",
    channelCodingRate: "",
    burstOverhead: "0",
  });
  const [result, setResult] = useState(null);
  const [explanation, setExplanation] = useState("");

  const handleChange = (e) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  const handleCalculate = async () => {
    const payload = {
      bandwidth: parseFloat(inputs.bandwidth),
      quantizer_bits: parseInt(inputs.quantizerBits),
      source_code_rate: parseFloat(inputs.sourceEncodingRatio),
      channel_code_rate: parseFloat(inputs.channelCodingRate),
      burst_overhead: parseFloat(inputs.burstOverhead),
    };

    try {
      const res = await getWCSExplanation(payload);
      setResult(res.numbers);
      setExplanation(res.explanation);
    } catch (err) {
      setResult(null);
      setExplanation("Something went wrong. Please check inputs or server.");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f9fbfc",
        margin: 0,
        padding: 0,
      }}
    >
      <div
        style={{
          width: "90vw",
          maxWidth: "520px",
          background: "rgba(255,255,255,0.98)",
          borderRadius: "24px",
          padding: "38px 32px",
          boxShadow: "0 4px 40px #0001",
        }}
      >
        <h2 style={{
          fontWeight: 800,
          fontSize: "2.1rem",
          marginBottom: 5,
          textAlign: "center",
        }}>
          Wireless Communication System
        </h2>
        <p style={{
          textAlign: "center",
          color: "#555",
          fontSize: "1.07em",
          marginTop: 0,
          marginBottom: 18
        }}>
          <span>
            Compute the data rate at the output of each block in a digital comms transmitter:
          </span>
          <br />
          <span style={{ fontSize: "0.97em", color: "#888" }}>
            (Sampler → Quantizer → Source Encoder → Channel Encoder → Interleaver → Burst Formatter)
          </span>
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "17px" }}>
          <InputField label="Analog Bandwidth (Hz)" name="bandwidth" value={inputs.bandwidth} onChange={handleChange} placeholder="e.g. 3400" help="Max frequency of your analog signal (e.g. audio, voice)." />
          <InputField label="Quantizer bits per sample" name="quantizerBits" value={inputs.quantizerBits} onChange={handleChange} placeholder="e.g. 8" help="How many bits used for each digital sample?" />
          <InputField label="Source Encoding Ratio" name="sourceEncodingRatio" value={inputs.sourceEncodingRatio} onChange={handleChange} placeholder="e.g. 0.8" help="Compression ratio (0.8 = 20% compression)." />
          <InputField label="Channel Coding Rate" name="channelCodingRate" value={inputs.channelCodingRate} onChange={handleChange} placeholder="e.g. 0.5" help="e.g. 0.5 means data is doubled for error correction." />
          <InputField label="Burst Formatting Overhead (%)" name="burstOverhead" value={inputs.burstOverhead} onChange={handleChange} placeholder="e.g. 10" help="Extra % for headers, framing, etc." />
        </div>
        <div style={{ marginTop: "30px", display: "flex", justifyContent: "center" }}>
          <button style={buttonStyle} onClick={handleCalculate}>Calculate</button>
        </div>

        {result && (
          <div style={{ marginTop: 30, fontSize: "1.12rem" }}>
            <strong>Rates at Output of Each Block:</strong>
            <ul style={{ textAlign: "left", lineHeight: 1.7 }}>
              <li><strong>Sampler:</strong> {result.fs_Hz.toLocaleString()} <b>samples/sec</b></li>
              <li><strong>Quantizer:</strong> {result.Rq_bps.toLocaleString()} <b>bps</b></li>
              <li><strong>Source Encoder:</strong> {result.Rs_bps.toLocaleString()} <b>bps</b></li>
              <li><strong>Channel Encoder:</strong> {result.Rc_bps.toLocaleString()} <b>bps</b></li>
              <li><strong>Interleaver:</strong> {result.Ri_bps.toLocaleString()} <b>bps</b></li>
              <li><strong>Burst Formatter:</strong> {result.Rb_bps.toLocaleString()} <b>bps</b></li>
            </ul>
            <div style={{
              marginTop: 20,
              background: "#eef2ff",
              borderRadius: 10,
              padding: 16,
              whiteSpace: "pre-wrap"
            }}>
              <strong>Explanation:</strong><br />
              {explanation}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InputField({ label, name, value, onChange, placeholder, help }) {
  return (
    <label>
      <b>{label}</b>
      <input
        type="number"
        step="any"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={inputStyle}
      />
      <div style={helpText}>{help}</div>
    </label>
  );
}

const inputStyle = {
  width: "100%",
  fontSize: "1rem",
  padding: "10px",
  borderRadius: "8px",
  border: "1px solid #bbb",
  marginTop: "6px",
  marginBottom: "3px",
  background: "#f7fafb",
  outline: "none",
};

const buttonStyle = {
  padding: "11px 28px",
  borderRadius: "8px",
  fontWeight: "bold",
  fontSize: "1.07rem",
  background: "#2244bb",
  color: "white",
  border: "none",
  cursor: "pointer",
  transition: "all 0.17s",
};

const helpText = {
  fontSize: "0.94em",
  color: "#888",
  marginTop: "1.5px",
  marginBottom: "-1px"
};

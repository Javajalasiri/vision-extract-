import { useState, useCallback, useRef } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

const HEADERS = [
  "File-Row","ID Code","Primary Name","Location","Loan Amount",
  "Interest %","Years","Rate %","PV Reduction","MP Reduction",
  "TI Reduction","Secondary Name","Secondary Code"
];

export default function App() {
  const [files, setFiles]           = useState([]);
  const [dragging, setDragging]     = useState(false);
  const [loading, setLoading]       = useState(false);
  const [results, setResults]       = useState(null);
  const [error, setError]           = useState("");
  const [totalSaved, setTotalSaved] = useState(0);
  const [statusMsg, setStatusMsg]   = useState("");
  const fileRef = useRef();

  // ── Drag & Drop ───────────────────────────────────────────────────────────
  const onDrop = useCallback((e) => {
    e.preventDefault(); setDragging(false);
    const dropped = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/"));
    setFiles(prev => [...prev, ...dropped]);
  }, []);

  const onFileChange = (e) => {
    setFiles(prev => [...prev, ...Array.from(e.target.files)]);
    e.target.value = "";
  };

  const removeFile = (i) => setFiles(prev => prev.filter((_, idx) => idx !== i));

  // ── Upload & Extract ──────────────────────────────────────────────────────
  const upload = async () => {
    if (!files.length) return;
    setLoading(true); setError(""); setResults(null);

    const msgs = [
      "Sending images to AI...",
      "Claude Vision reading every character...",
      "Extracting fields and values...",
      "Structuring into table rows...",
      "Building Excel file..."
    ];
    let mi = 0;
    setStatusMsg(msgs[0]);
    const ticker = setInterval(() => setStatusMsg(msgs[Math.min(++mi, msgs.length - 1)]), 2500);

    try {
      const form = new FormData();
      files.forEach(f => form.append("files", f));

      const res  = await fetch(`${API}/upload/`, { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Upload failed");

      setResults(data);
      setTotalSaved(s => s + (data.total_records || 0));
      setFiles([]);
    } catch (e) {
      setError(e.message);
    } finally {
      clearInterval(ticker);
      setLoading(false);
      setStatusMsg("");
    }
  };

  const downloadExcel = () => window.open(`${API}/download/`, "_blank");

  const resetAll = async () => {
    await fetch(`${API}/reset/`, { method: "DELETE" });
    setResults(null); setTotalSaved(0); setFiles([]);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "#0f0f1a", color: "#e8e8f0", fontFamily: "'Segoe UI', Arial, sans-serif" }}>

      {/* ── Header ── */}
      <div style={{ background: "#1a1a2e", borderBottom: "1px solid #2a2a4a", padding: "18px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 38, height: 38, background: "linear-gradient(135deg,#4f46e5,#7c3aed)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🔬</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 18, letterSpacing: -0.5 }}>VisionExtract</div>
            <div style={{ fontSize: 11, color: "#6b6b8a", fontFamily: "monospace" }}>AI · OCR · Excel</div>
          </div>
        </div>
        {totalSaved > 0 && (
          <div style={{ background: "#1e1e3a", border: "1px solid #4f46e5", borderRadius: 8, padding: "6px 16px", fontSize: 13, color: "#a5b4fc" }}>
            {totalSaved} records saved
          </div>
        )}
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>

        {/* ── Drop Zone ── */}
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => fileRef.current.click()}
          style={{
            border: `2px dashed ${dragging ? "#4f46e5" : "#2a2a4a"}`,
            borderRadius: 16, padding: "48px 24px", textAlign: "center",
            cursor: "pointer", marginBottom: 24, transition: "all .2s",
            background: dragging ? "rgba(79,70,229,.06)" : "#14141f"
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 10 }}>📂</div>
          <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 6 }}>Drop images here or click to browse</div>
          <div style={{ fontSize: 12, color: "#555570" }}>JPG · PNG · WEBP · GIF — multiple files supported</div>
          <input ref={fileRef} type="file" accept="image/*" multiple onChange={onFileChange} style={{ display: "none" }} />
        </div>

        {/* ── File Queue ── */}
        {files.length > 0 && (
          <div style={{ background: "#14141f", border: "1px solid #2a2a4a", borderRadius: 12, padding: 16, marginBottom: 24 }}>
            <div style={{ fontSize: 12, color: "#6b6b8a", fontFamily: "monospace", marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>
              {files.length} file{files.length > 1 ? "s" : ""} queued
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
              {files.map((f, i) => (
                <div key={i} style={{ background: "#1e1e3a", border: "1px solid #3a3a5a", borderRadius: 8, padding: "6px 12px", fontSize: 12, display: "flex", alignItems: "center", gap: 8 }}>
                  🖼️ {f.name}
                  <span onClick={e => { e.stopPropagation(); removeFile(i); }} style={{ cursor: "pointer", color: "#ef4444", fontWeight: 700 }}>×</span>
                </div>
              ))}
            </div>
            <button
              onClick={upload}
              disabled={loading}
              style={{
                background: loading ? "#2a2a4a" : "linear-gradient(135deg,#4f46e5,#7c3aed)",
                color: "#fff", border: "none", borderRadius: 10,
                padding: "12px 32px", fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1, width: "100%"
              }}
            >
              {loading ? "⏳ Processing..." : "⚡ Extract & Build Excel"}
            </button>
          </div>
        )}

        {/* ── Loading ── */}
        {loading && (
          <div style={{ textAlign: "center", padding: "32px 0", color: "#a5b4fc", fontFamily: "monospace", fontSize: 13 }}>
            <div style={{ width: 40, height: 40, border: "3px solid #2a2a4a", borderTopColor: "#4f46e5", borderRadius: "50%", animation: "spin .8s linear infinite", margin: "0 auto 16px" }} />
            {statusMsg}
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        )}

        {/* ── Error ── */}
        {error && (
          <div style={{ background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.4)", borderRadius: 10, padding: "14px 18px", marginBottom: 24, fontSize: 13, color: "#fca5a5" }}>
            ⚠ {error}
          </div>
        )}

        {/* ── Results ── */}
        {results && (
          <div>
            {/* Stats row */}
            <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
              {[
                { label: "Files Processed", val: results.processed },
                { label: "Records Extracted", val: results.total_records },
                { label: "Total Saved", val: totalSaved },
              ].map((s, i) => (
                <div key={i} style={{ background: "#14141f", border: "1px solid #2a2a4a", borderRadius: 10, padding: "12px 20px", flex: 1, minWidth: 140 }}>
                  <div style={{ fontSize: 11, color: "#6b6b8a", fontFamily: "monospace", marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontSize: 26, fontWeight: 700, color: "#a5b4fc" }}>{s.val}</div>
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
              <button onClick={downloadExcel} style={{ background: "#16a34a", color: "#fff", border: "none", borderRadius: 8, padding: "10px 24px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                ⬇ Download Excel
              </button>
              <button onClick={resetAll} style={{ background: "none", color: "#9ca3af", border: "1px solid #374151", borderRadius: 8, padding: "10px 20px", fontSize: 13, cursor: "pointer" }}>
                ↺ Clear All Data
              </button>
            </div>

            {/* Per-file results */}
            {results.results.map((r, ri) => (
              <div key={ri} style={{ background: "#14141f", border: "1px solid #2a2a4a", borderRadius: 12, marginBottom: 16, overflow: "hidden" }}>
                <div style={{ padding: "12px 18px", borderBottom: "1px solid #2a2a4a", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#1a1a2e" }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>📄 {r.filename}</div>
                  {r.error
                    ? <span style={{ fontSize: 12, color: "#fca5a5" }}>Error: {r.error}</span>
                    : <span style={{ fontSize: 12, background: "rgba(79,70,229,.2)", color: "#a5b4fc", padding: "3px 10px", borderRadius: 20, border: "1px solid rgba(79,70,229,.3)" }}>{r.records} records</span>
                  }
                </div>
                {r.rows && r.rows.length > 0 && (
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                      <thead>
                        <tr>
                          {HEADERS.map(h => (
                            <th key={h} style={{ padding: "8px 10px", textAlign: "left", fontSize: 10, fontWeight: 600, color: "#6b6b8a", borderBottom: "1px solid #2a2a4a", background: "#111122", whiteSpace: "nowrap", fontFamily: "monospace", textTransform: "uppercase", letterSpacing: .5 }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {r.rows.map((row, i) => (
                          <tr key={i} style={{ background: i % 2 === 0 ? "#14141f" : "#111120" }}>
                            {row.map((cell, ci) => (
                              <td key={ci} style={{ padding: "7px 10px", borderBottom: "1px solid #1e1e30", color: ci === 0 ? "#6b6b8a" : "#d1d5db", fontFamily: ci === 1 || ci === 12 ? "monospace" : "inherit", fontSize: 11, whiteSpace: ci === 1 || ci === 12 ? "normal" : "nowrap" }}>
                                {cell || "—"}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

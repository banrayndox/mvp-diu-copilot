import { Check, Code2, Copy, Download, Eye, PanelRightClose, FileText } from 'lucide-react';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { easeInOut, motion } from "motion/react";
import Editor from '@monaco-editor/react';

const Artifact = () => {
  const { artifacts } = useSelector(state => state.message);
  const [collapsed, setCollapsed] = useState(false);
  const [tab, setTab] = useState("code");
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);

  if (!artifacts || artifacts.length === 0) {
    return null;
  }

  const currentArtifact = artifacts[0];
  const activeFile = currentArtifact?.files?.[active];
  const fileContent = activeFile?.content || "";
  const fileName = activeFile?.name || "code.txt";

  const htmlFile = currentArtifact?.files?.find(f => f?.name === "index.html");
  const cssFile = currentArtifact?.files?.find(f => f?.name === "style.css");
  const jsFile = currentArtifact?.files?.find(f => f?.name === "script.js");
  const canPreview = Boolean(htmlFile);

  const previewDoc = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    ${cssFile?.content || ""}
  </style>
</head>
<body>
  ${htmlFile?.content || ""}
  <script>
    try {
      ${jsFile?.content || ""}
    } catch(err) {
      console.error(err);
    }
  </script>
</body>
</html>`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(fileContent || "");
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 1200);
  };

  const handleDownload = () => {
    try {
      const blob = new Blob([fileContent], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Download error:", e);
    }
  };

  const detectLanguage = (name = "") => {
    const lower = name.toLowerCase();
    if (lower.endsWith(".html") || lower.endsWith(".htm")) return "html";
    if (lower.endsWith(".css")) return "css";
    if (lower.endsWith(".js") || lower.endsWith(".mjs")) return "javascript";
    if (lower.endsWith(".ts") || lower.endsWith(".tsx")) return "typescript";
    if (lower.endsWith(".jsx")) return "javascript";
    if (lower.endsWith(".json")) return "json";
    if (lower.endsWith(".md")) return "markdown";
    if (lower.endsWith(".py")) return "python";
    if (lower.endsWith(".java")) return "java";
    if (lower.endsWith(".cpp") || lower.endsWith(".cxx") || lower.endsWith(".cc")) return "cpp";
    if (lower.endsWith(".c")) return "c";
    if (lower.endsWith(".cs")) return "csharp";
    if (lower.endsWith(".php")) return "php";
    if (lower.endsWith(".go")) return "go";
    if (lower.endsWith(".rs")) return "rust";
    if (lower.endsWith(".sql")) return "sql";
    if (lower.endsWith(".xml")) return "xml";
    if (lower.endsWith(".yaml") || lower.endsWith(".yml")) return "yaml";
    if (lower.endsWith(".sh")) return "shell";
    return "plaintext";
  };

  return (
    <motion.div
      initial={{ width: 420 }}
      animate={{ width: collapsed ? 56 : 460 }}
      transition={{ duration: 0.25, ease: easeInOut }}
      className="hidden lg:flex h-full border-l border-white/[0.08] flex-col overflow-hidden shrink-0 bg-[#0d0f14]"
    >
      {!collapsed ? (
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="h-14 px-4 border-b border-white/[0.08] flex items-center justify-between gap-3 shrink-0 bg-[#0a0c10]">
            <div className="flex items-center gap-2.5 min-w-0">
              <button
                onClick={() => setCollapsed(!collapsed)}
                title="Collapse artifact pane"
                className="flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-white/[0.06] transition-colors duration-150 bg-transparent border-none cursor-pointer shrink-0"
              >
                <PanelRightClose size={16} />
              </button>
              <div className="flex items-center justify-center w-6 h-6 rounded-md bg-indigo-500/15 border border-indigo-500/25 shrink-0">
                <Code2 className="text-indigo-400" size={13} />
              </div>
              <span className="text-[13px] font-semibold text-slate-200 truncate">
                {currentArtifact?.title || "Project Artifact"}
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {canPreview && (
                <div className="flex items-center bg-white/[0.06] p-0.5 rounded-lg border border-white/[0.08] mr-1">
                  <button
                    onClick={() => setTab("code")}
                    className={`flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded-md transition-colors ${
                      tab === "code" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Code2 size={12} />
                    Code
                  </button>
                  <button
                    onClick={() => setTab("preview")}
                    className={`flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded-md transition-colors ${
                      tab === "preview" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Eye size={12} />
                    Preview
                  </button>
                </div>
              )}

              <button
                onClick={handleCopy}
                title="Copy active file"
                className="flex items-center gap-1 px-2 py-1.5 text-xs text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] rounded-lg transition-colors border border-white/[0.06]"
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              </button>

              <button
                onClick={handleDownload}
                title={`Download ${fileName}`}
                className="flex items-center gap-1 px-2 py-1.5 text-xs text-slate-400 hover:text-indigo-300 hover:bg-white/[0.06] rounded-lg transition-colors border border-white/[0.06]"
              >
                <Download size={14} />
              </button>
            </div>
          </div>

          {/* File tabs */}
          {tab === "code" && currentArtifact?.files && (
            <div className="flex h-10 bg-[#10131a] border-b border-white/[0.06] overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden shrink-0">
              {currentArtifact.files.map((f, index) => {
                const isActive = active === index;
                return (
                  <button
                    key={f?.name || index}
                    onClick={() => setActive(index)}
                    className={`flex items-center gap-1.5 px-3.5 text-xs font-medium whitespace-nowrap transition-colors border-r border-white/[0.06] relative cursor-pointer bg-transparent ${
                      isActive ? "text-indigo-300 bg-white/[0.03]" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <FileText size={12} className={isActive ? "text-indigo-400" : "text-slate-500"} />
                    <span>{f?.name || `File ${index + 1}`}</span>
                    {isActive && (
                      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-indigo-500" />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Content Pane */}
          <div className="flex-1 overflow-hidden relative">
            {tab === "preview" && canPreview ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="w-full h-full bg-white"
              >
                <iframe
                  title="Artifact Live Preview"
                  srcDoc={previewDoc}
                  sandbox="allow-scripts allow-modals"
                  className="w-full h-full border-0"
                />
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="w-full h-full"
              >
                <Editor
                  theme="vs-dark"
                  language={detectLanguage(fileName)}
                  value={fileContent}
                  options={{
                    readOnly: true,
                    minimap: { enabled: false },
                    fontSize: 13,
                    wordWrap: "on",
                    automaticLayout: true,
                    scrollBeyondLastLine: false,
                    padding: { top: 14, bottom: 14 },
                    renderLineHighlight: "none",
                    lineNumbersMinChars: 3
                  }}
                />
              </motion.div>
            )}
          </div>
        </div>
      ) : (
        /* Collapsed Sidebar */
        <div className="flex h-full flex-col items-center py-4 gap-3 bg-[#0d0f14]">
          <button
            onClick={() => setCollapsed(!collapsed)}
            title="Expand artifact pane"
            className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-white/[0.06] transition-colors duration-150 bg-transparent border-none cursor-pointer shrink-0"
          >
            <PanelRightClose size={16} />
          </button>
          <div className="flex-1 flex items-center justify-center">
            <div
              style={{
                writingMode: "vertical-lr",
                transform: "rotate(180deg)"
              }}
              className="text-[11px] font-semibold text-slate-400 tracking-widest uppercase whitespace-nowrap"
            >
              {currentArtifact?.title || "Artifact"}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Artifact;
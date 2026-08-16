import { useSelector } from "react-redux";
import { Check, Copy, ExternalLink, X } from "lucide-react";
import React, { useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import MentorList from "./MentorList";
import LostFoundMatchList from "./LostFoundMatchList";

const MessageBubble = ({ role, content, images, senderId, senderEmail }) => {
  const { userData } = useSelector(state => state?.user || {});
  const [lightBox, setLightBox] = useState(null);
  const [copyCode, setCopyCode] = useState("");

  const handleCopyCode = async (code) => {
    await navigator.clipboard.writeText(code);
    setCopyCode(code);
    setTimeout(() => {
      setCopyCode("");
    }, 200);
  };

  // Determine if the message was sent by the currently logged in user
  const isMe = (senderId && userData?.userId && senderId === userData?.userId) ||
               (senderEmail && userData?.email && senderEmail === userData?.email) ||
               (role === "user" && (!senderId && !senderEmail));

  let mentorData = null;
  let lostFoundData = null;

  if (role !== "user") {
    if (typeof content === "object" && content !== null) {
      if (content.type === "mentorResults") mentorData = content;
      if (content.type === "lostFoundMatchList") lostFoundData = content;
    } else if (typeof content === "string") {
      try {
        const cleaned = content.replace(/^```json\s*/i, "").replace(/^```\s*/, "").replace(/\s*```$/, "").trim();
        const parsed = JSON.parse(cleaned);
        if (parsed?.type === "mentorResults") mentorData = parsed;
        if (parsed?.type === "lostFoundMatchList") lostFoundData = parsed;
      } catch (e) {}
    }
  }

  if (mentorData) {
    return <MentorList data={mentorData} />;
  }

  if (lostFoundData) {
    return <LostFoundMatchList data={lostFoundData} />;
  }

  return (
    <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
      <div
        className={`w-fit max-w-[92vw] md:max-w-[72%] px-4 py-2.5 rounded-2xl break-words overflow-hidden leading-relaxed ${
          isMe
            ? "bg-gradient-to-br from-indigo-500 to-violet-700 text-white rounded-tr-sm"
            : "bg-[#181a24] border border-white/10 text-slate-200 rounded-tl-sm shadow-md"
        }`}
      >
        {images.length > 0 && (
          <div className="flex flex-wrap gap-3 mt-4">
            {images.map((img, i) => {
              return (
                <img
                  onClick={() => setLightBox(img)}
                  src={img}
                  key={i}
                  leading="lazy"
                  onError={(e) => e.currentTarget.remove(e)}
                  className="w-40 h-28 rounded-xl object-cover border border-white/10 cursor-zoom-in hover:opacity-90 transition"
                />
              );
            })}
          </div>
        )}

        <Markdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ children }) => (
              <h1 className="text-2xl font-bold mt-5 mb-3">{children}</h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-xl font-semibold mt-4 mb-2">{children}</h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-lg font-semibold mt-3 mb-2">{children}</h3>
            ),
            p: ({ children }) => (
              <p className="mb-3 whitespace-pre-wrap break-word">{children}</p>
            ),
            ul: ({ children }) => (
              <ul className="list-disc pl-5 space-y-1 my-2">{children}</ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal pl-5 space-y-1 my-2">{children}</ol>
            ),
            table: ({ children }) => (
              <div className="my-5 overflow-x-auto rounded-xl border border-white/10 bg-white/5 shadow-sm">
                <table className="min-w-full border-collapse text-sm">
                  {children}
                </table>
              </div>
            ),

            thead: ({ children }) => (
              <thead className="bg-white/10 text-white">{children}</thead>
            ),

            tbody: ({ children }) => (
              <tbody className="divide-y divide-white/10">{children}</tbody>
            ),

            tr: ({ children }) => (
              <tr className="transition-colors hover:bg-white/5 even:bg-white/[0.03]">
                {children}
              </tr>
            ),

            th: ({ children }) => (
              <th className="border-b border-white/10 px-4 py-3 text-left font-semibold tracking-wide text-gray-200">
                {children}
              </th>
            ),

            td: ({ children }) => (
              <td className="px-4 py-3 align-top text-gray-300">{children}</td>
            ),
            a: ({ children, href }) => (
              <a
                href={href}
                target="_blank"
                rel="norefferer"
                className="text-indigo-400 underline inline-flex items-center gap-1"
              >
                {children}
                <ExternalLink size={14} />
              </a>
            ),
            code: ({ className, children }) => {
              const value = String(children).trim();
              if (!className) {
                return (
                  <code className="px-1.5 py-0.5 rounded bg-white/10 text-indigo-300">
                    {value}
                  </code>
                );
              }
              const language = className?.replace("language-", "");
              return (
                <div className="my-4 overflow-hidden rounded-xl border-white/10 bg-[#111318]">
                  <div className="flex items-center justify-between bg-[#1b1d24] border-b border-white/10 px-4 py-2">
                    <span className="uppercase text-xs text-slate-400">
                      {language}
                    </span>
                    <button 
                    onClick={()=>handleCopyCode(value)}
                    className="flex items-center gap-1 text-xs">
                      {copyCode === value ? (
                        <>
                          <Check size={14}/>
                          Copied
                        </>
                      ) : (
                        <>
                          {" "}
                          <Copy size={14}/>
                        </>
                      )}
                    </button>
                  </div>
                  <SyntaxHighlighter
                  language={language}
                  style={oneDark}
                  wrapLongLines
                  showLineNumbers
                  customStyle={{
                    margin: 0,
                    padding: "16px",
                    background: "#0d1117",
                    fontSize: "13px"
                  }}
                  >
                    {value}
                  </SyntaxHighlighter>
                  
                </div>
              );
            },
          }}
        >
          {content}
        </Markdown>
      </div>

      {lightBox && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6">
          <button
            onClick={() => setLightBox(null)}
            className="absolute top-5 right-5 text-white/80 hover:text-white hover:bg-white/10 rounded-full p-2"
          >
            <X />
          </button>
          <img
            src={lightBox}
            className="max-w-[90vw] max-h-[85vh] border border-white/10 shadow-2xl object-contain"
          />
        </div>
      )}
    </div>
  );
};

export default MessageBubble;

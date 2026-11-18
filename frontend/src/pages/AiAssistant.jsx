import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Bot,
  Send,
  Sparkles,
  ShieldAlert,
  HelpCircle,
  RefreshCw,
  Terminal,
  Cpu,
  Lock
} from 'lucide-react';
import { explainIncident, recommendPolicies } from '../api/aiApi';

export default function AiAssistant() {
  const [searchParams] = useSearchParams();
  const initialIncidentId = searchParams.get('incidentId');

  const [activeTab, setActiveTab] = useState(initialIncidentId ? 'INCIDENT' : 'FREE_QUERY');
  const [incidentIdInput, setIncidentIdInput] = useState(initialIncidentId || '');
  const [queryInput, setQueryInput] = useState('');
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: "Hello! I am your IntelliDLP Local AI Security Analyst, powered by a private on-premise LLM (llama3.2). All document telemetry is masked (PII redacted) prior to inference. How can I assist your investigation today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (initialIncidentId) {
      handleAnalyzeIncident(initialIncidentId);
    }
  }, [initialIncidentId]);

  const handleAnalyzeIncident = async (idToAnalyze) => {
    const targetId = idToAnalyze || incidentIdInput.trim();
    if (!targetId) return;

    const userMsg = {
      sender: 'user',
      text: `Analyze incident dossier: ${targetId}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await explainIncident(targetId);
      const explanation = res.data?.data?.explanation || res.data?.explanation || res.data?.data || 'No explanation generated.';
      const aiMsg = {
        sender: 'ai',
        text: explanation,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error('AI incident explanation error', err);
      const errMsg = {
        sender: 'ai',
        text: "Error contacting local Ollama engine. Please verify that Ollama is running on localhost:11434 with llama3.2 loaded.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendFreeQuery = async (e) => {
    e?.preventDefault();
    const prompt = queryInput.trim();
    if (!prompt) return;

    const userMsg = {
      sender: 'user',
      text: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, userMsg]);
    setQueryInput('');
    setLoading(true);

    try {
      const res = await recommendPolicies(prompt);
      const answer = res.data?.data?.recommendation || res.data?.recommendation || res.data?.data || 'Response received.';
      const aiMsg = {
        sender: 'ai',
        text: answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error('AI query error', err);
      const errMsg = {
        sender: 'ai',
        text: "Could not query Ollama. Ensure the Ollama daemon is active.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = [
    "What policies should I configure to prevent credit card and Aadhaar leaks to personal USB drives?",
    "Explain the difference between Simulation Mode and Enforced Blocking in IntelliDLP.",
    "How can I reduce false positives when monitoring source code repositories for secrets?",
  ];

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4">
      {/* Top Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              AI Security Copilot
              <span className="text-[10px] font-mono font-normal px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                OLLAMA: LLAMA 3.2
              </span>
            </h1>
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <Lock className="h-3 w-3 text-emerald-400" />
              100% On-Premise Air-Gapped Inference • Zero data sent outside host
            </p>
          </div>
        </div>

        {/* Input Mode Tabs */}
        <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700 text-xs">
          <button
            onClick={() => setActiveTab('INCIDENT')}
            className={`px-3 py-1.5 rounded font-medium transition ${
              activeTab === 'INCIDENT' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Incident Triage
          </button>
          <button
            onClick={() => setActiveTab('FREE_QUERY')}
            className={`px-3 py-1.5 rounded font-medium transition ${
              activeTab === 'FREE_QUERY' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Policy Advisory
          </button>
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-4 overflow-y-auto space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.sender === 'ai' && (
              <div className="h-8 w-8 rounded-lg bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center flex-shrink-0">
                <Bot className="h-4 w-4" />
              </div>
            )}
            <div
              className={`max-w-2xl rounded-xl p-3.5 text-sm ${
                m.sender === 'user'
                  ? 'bg-cyan-600 text-white'
                  : 'bg-slate-800/80 border border-slate-700 text-slate-200'
              }`}
            >
              <div className="whitespace-pre-wrap leading-relaxed">{m.text}</div>
              <div
                className={`text-[10px] mt-1.5 ${
                  m.sender === 'user' ? 'text-cyan-200' : 'text-slate-500'
                } text-right`}
              >
                {m.timestamp}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="h-8 w-8 rounded-lg bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center flex-shrink-0">
              <Bot className="h-4 w-4" />
            </div>
            <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3.5 text-sm text-slate-300 flex items-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin text-cyan-400" />
              <span>Analyzing telemetry with local LLM...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Suggested prompts if few messages */}
      {messages.length <= 2 && activeTab === 'FREE_QUERY' && (
        <div className="flex flex-wrap gap-2 text-xs flex-shrink-0">
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                setQueryInput(p);
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            >
              💡 {p}
            </button>
          ))}
        </div>
      )}

      {/* Bottom Input Area */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex-shrink-0">
        {activeTab === 'INCIDENT' ? (
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter Incident UUID or Code (e.g. 123e4567-e89b-12d3-a456-426614174000)..."
              value={incidentIdInput}
              onChange={(e) => setIncidentIdInput(e.target.value)}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 font-mono"
            />
            <button
              onClick={() => handleAnalyzeIncident()}
              disabled={loading || !incidentIdInput.trim()}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-sm font-semibold rounded-lg flex items-center gap-2 transition"
            >
              <Sparkles className="h-4 w-4" />
              Analyze
            </button>
          </div>
        ) : (
          <form onSubmit={handleSendFreeQuery} className="flex gap-2">
            <input
              type="text"
              placeholder="Ask for policy advice, DLP rule tuning, or threat remediation strategies..."
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              disabled={loading || !queryInput.trim()}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-sm font-semibold rounded-lg flex items-center gap-2 transition"
            >
              <Send className="h-4 w-4" />
              Ask Copilot
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

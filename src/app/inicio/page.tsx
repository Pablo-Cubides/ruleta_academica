"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
// import FileInput from "../components/file-input";
import FileInput from "../../components/file-input";

interface QuestionSet {
  id: number;
  name: string;
}

export default function InicioPage() {
  const [questionSets, setQuestionSets] = useState<QuestionSet[]>([]);
  const [selectedSet, setSelectedSet] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [fileQuestions, setFileQuestions] = useState<string[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [saveName, setSaveName] = useState<string>("");
  const [saveStatus, setSaveStatus] = useState<string>("");
  const [groupName, setGroupName] = useState('Nuevo Grupo');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch("/api/questionsets");
        if (!res.ok) return; // ignore if API not available (e.g., no DB)
        const data = await res.json();
        if (!cancelled) setQuestionSets(data);
      } catch {
        // ignore errors to allow client-only flow
      }
    };
    load();
    return () => { cancelled = true };
  }, []);

  // Merge any locally saved sets (fallback when DB not configured)
  useEffect(() => {
    try {
      const raw = localStorage.getItem('localQuestionSets');
      if (!raw) return;
  const localSets = JSON.parse(raw) as Array<{ id: string; name: string; questions: string[] }>;
      if (localSets && localSets.length) {
        setQuestionSets(prev => {
          // Avoid duplicates by name
          const names = new Set(prev.map(s => s.name));
          const combined = [...prev];
          localSets.forEach(s => {
            if (!names.has(s.name)) {
              // convert local id (string) to numeric negative id
              const numericId = typeof s.id === 'string' ? -Math.abs(parseInt(s.id.replace(/\D/g, '') || `${Date.now()}`)) : (s.id as any as number);
              combined.push({ id: numericId, name: s.name });
            }
          });
          return combined;
        });
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const handleSelectSet = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = Number(e.target.value);
    setSelectedSet(id);
    setSaveStatus("");
    setFileQuestions([]);
    setFileName("");
    if (!id) return;
    setLoading(true);
    const res = await fetch(`/api/questionsets/${id}`);
    if (res.ok) {
      const data = await res.json();
      setFileQuestions(data.questions.map((q: any) => q.text));
      setFileName(data.name);
    }
    setLoading(false);
  };

  const handleFileLoaded = (questions: string[], name: string) => {
    setFileQuestions(questions);
    setFileName(name);
    setSelectedSet(null);
    setSaveStatus("");
    // groupName already represents the desired save name
  };
  const handleSave = async () => {
    if (!fileQuestions.length || !saveName.trim()) {
      setSaveStatus('Debes cargar preguntas y asignar un nombre.');
      return;
    }
    setSaveStatus('Guardando...');
    try {
      const res = await fetch('/api/questionsets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: saveName.trim(), questions: fileQuestions })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setSaveStatus('¡Guardado exitosamente!');
        const updatedSets = await fetch('/api/questionsets').then(r => r.json());
        setQuestionSets(updatedSets);
        setFileQuestions([]);
        setFileName('');
        setGroupName('Nuevo Grupo');
        setSaveName('');
        setTimeout(() => setSaveStatus(''), 3000);
      } else {
        setSaveStatus(data.error || 'Error al guardar');
      }
    } catch (err: any) {
      setSaveStatus(`Error de conexión: ${String(err?.message ?? err)}`);
    }
  };

  return (
    <div className="flex flex-col items-center gap-8 py-12 w-full">
      <h1 className="text-4xl font-bold text-primary-400 mb-2">Inicio: Cargar o Seleccionar Preguntas</h1>
      <div className="w-full max-w-xl flex flex-col gap-6">
        <label className="font-semibold text-lg">Seleccionar conjunto guardado:</label>
        <select
          className="p-3 rounded border bg-gray-900 text-white text-xl"
          value={selectedSet ?? ""}
          onChange={handleSelectSet}
        >
          <option value="">-- Elegir conjunto --</option>
          {questionSets.map((set) => (
            <option key={set.id} value={set.id}>{set.name}</option>
          ))}
        </select>
        <div className="flex items-center gap-4 mt-4">
          <FileInput 
            groupName={groupName}
            onGroupNameChange={setGroupName}
            onUpload={handleFileLoaded} 
            onSaveSuccess={() => setSaveStatus('')} 
            showGroupNameInput={true}
            onSave={async (questions, name) => {
              setSaveStatus('Guardando...');
              try {
                const res = await fetch('/api/questionsets', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ name, questions })
                });
                if (res.ok) {
                  const updatedSets = await fetch('/api/questionsets').then(r => r.json());
                  setQuestionSets(updatedSets);
                  setFileQuestions([]);
                  setFileName('');
                  setGroupName('Nuevo Grupo');
                  setSaveStatus('¡Guardado exitosamente!');
                  setTimeout(() => setSaveStatus(''), 3000);
                } else if (res.status === 503) {
                  // fallback: store set in localStorage
                  const localRaw = localStorage.getItem('localQuestionSets');
                  const localSets = localRaw ? JSON.parse(localRaw) : [];
                  const id = `local-${Date.now()}`;
                  localSets.push({ id, name, questions });
                  localStorage.setItem('localQuestionSets', JSON.stringify(localSets));
                  // use negative numeric id for local sets
                  const numericId = -Date.now();
                  setQuestionSets(prev => [...prev, { id: numericId, name }]);
                  setFileQuestions([]);
                  setFileName('');
                  setGroupName('Nuevo Grupo');
                  setSaveStatus('Guardado localmente (sin DB)');
                  setTimeout(() => setSaveStatus(''), 3000);
                } else {
                  const data = await res.json().catch(() => ({}));
                  setSaveStatus(data.error || 'Error al guardar');
                }
              } catch (err: any) {
                setSaveStatus(`Error de conexión: ${String(err?.message ?? err)}`);
              }
            }}
          />
          {fileQuestions.length > 0 && (
            <>
              <input
                type="text"
                placeholder="Nombre para guardar"
                className="p-2 rounded border bg-gray-900 text-white text-lg"
                value={saveName}
                onChange={e => setSaveName(e.target.value)}
              />
              <button
                className="bg-primary-500 hover:bg-primary-700 text-white font-bold py-2 px-6 rounded text-lg"
                onClick={handleSave}
              >
                Guardar
              </button>
            </>
          )}
        </div>
        {saveStatus && <div className="text-yellow-400 mt-2">{saveStatus}</div>}
        {loading && <div className="text-blue-400">Cargando preguntas...</div>}
        {fileQuestions.length > 0 && (
          <div className="bg-gray-800 p-4 rounded mt-4">
            <div className="text-primary-400 font-semibold mb-2">Preguntas cargadas:</div>
            <ul className="list-disc ml-6 text-white">
              {fileQuestions.map((q, i) => (
                <li key={i}>{q}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function JugarButton({ setId, questions }: { setId?: number, questions?: string[] }) {
  const router = useRouter();
  const handleClick = () => {
    if (setId) {
      const url = `/ruleta?id=${setId}`;
      router.push(url);
    } else if (questions) {
      try {
        sessionStorage.setItem('tempQuestions', JSON.stringify(questions));
        router.push('/ruleta?temp=1');
      } catch (e) {
        const questionsJson = JSON.stringify(questions);
        const encoded = encodeURIComponent(questionsJson);
        const url = `/ruleta?questions=${encoded}`;
        router.push(url);
      }
    }
  };
  
  return (
    <button
      className="bg-green-600 hover:bg-green-800 text-white font-bold py-2 px-6 rounded text-lg"
      onClick={handleClick}
    >
      Jugar
    </button>
  );
}

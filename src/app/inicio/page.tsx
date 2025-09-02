"use client";
import React, { useEffect, useState } from "react";
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
    setSaveName(groupName); // Set saveName to the current groupName
  };

  const handleSave = async () => {
    if (!fileQuestions.length || !saveName.trim()) {
      setSaveStatus("Debes cargar preguntas y asignar un nombre.");
      return;
    }
    
    setSaveStatus("Guardando...");
    
    try {
      const payload = { 
        name: saveName.trim(), 
        questions: fileQuestions 
      };
      
      console.log('Saving question set:', payload);
      
      const res = await fetch("/api/questionsets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      let responseData;
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        responseData = await res.json();
      } else {
        const text = await res.text();
        throw new Error(`Expected JSON but received: ${text}`);
      }
      
      if (res.ok) {
        console.log('Save successful:', responseData);
        setSaveStatus("¡Guardado exitosamente!");
        // Reload the question sets list
        const updatedSets = await fetch("/api/questionsets").then(r => r.json());
        setQuestionSets(updatedSets);
        
        // Clear the form after successful save
        setFileQuestions([]);
        setSaveName("");
        setFileName("");
        setGroupName("Nuevo Grupo");
        
        // Show success message for 3 seconds
        setTimeout(() => setSaveStatus(""), 3000);
      } else {
        console.error('Save failed:', responseData);
        setSaveStatus(responseData.error || `Error al guardar: ${res.status} ${res.statusText}`);
      }
    } catch (error) {
      console.error('Error during save:', error);
      setSaveStatus(`Error de conexión: ${error.message}`);
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
          {fileQuestions.length > 0 && (
            <JugarButton questions={fileQuestions} />
          )}
          {selectedSet && (
            <JugarButton setId={selectedSet} />
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

import { useRouter } from "next/navigation";

function JugarButton({ setId, questions }: { setId?: number, questions?: string[] }) {
  const router = useRouter();
  const handleClick = () => {
    console.log('JugarButton clicked:', { setId, questions });
    if (setId) {
      const url = `/ruleta?id=${setId}`;
      console.log('Navigating to:', url);
      router.push(url);
    } else if (questions) {
      const questionsJson = JSON.stringify(questions);
      const encoded = encodeURIComponent(questionsJson);
      const url = `/ruleta?questions=${encoded}`;
      console.log('Navigating to:', url);
      console.log('Questions being passed:', questions);
      router.push(url);
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

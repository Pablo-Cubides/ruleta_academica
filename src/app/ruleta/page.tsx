"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import QuestionWheel from '../../components/QuestionWheel';

export default function RuletaPage() {
  const searchParams = useSearchParams();
  const setId = searchParams.get("id");
  const questionsParam = searchParams.get("questions");
  const tempParam = searchParams.get("temp");
  const [questions, setQuestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(!!setId);
  const [error, setError] = useState("");

  useEffect(() => {
    
    // Si hay un parámetro de preguntas, lo usamos directamente
    if (questionsParam) {
      try {
        const decoded = decodeURIComponent(questionsParam);
        const parsedQuestions = JSON.parse(decoded);
        
        if (Array.isArray(parsedQuestions) && parsedQuestions.length > 0) {
          setQuestions(parsedQuestions);
          return;
        } else {
          const errorMsg = 'Parsed questions is not an array or is empty';
          // set error message for user
          setError(errorMsg);
        }
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        const errorMsg = `Error al parsear preguntas: ${message}`;
  // Log and set error
  setError(errorMsg);
      }
    }
    
    // If temp param is present, try to read from sessionStorage
    if (tempParam) {
      try {
        const raw = sessionStorage.getItem('tempQuestions');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setQuestions(parsed);
            return;
          }
        }
        setError('No se encontraron preguntas temporales en el navegador');
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        setError(`Error al leer preguntas temporales: ${message}`);
      }
    }
    
    // Si hay un ID de conjunto, cargamos las preguntas
    if (setId) {
      setLoading(true);
      setError('');
      
      fetch(`/api/questionsets/${setId}`)
        .then(async (res) => {
          if (!res.ok) {
            const errorData = await res.text().catch(() => 'No error details');
            // API returned error body for debugging
            console.error(`API Error ${res.status}:`, errorData);
            throw new Error(`Error ${res.status}: ${errorData}`);
          }
          return res.json();
        })
        .then(data => {
          if (data?.questions?.length > 0) {
            const questionTexts = data.questions.map((q: any) => q.text);
            setQuestions(questionTexts);
          } else {
            throw new Error('No questions found in the response');
          }
        })
        .catch((error) => {
          setError(`No se pudo cargar el conjunto de preguntas`);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [setId, questionsParam]);

  if (loading) return <div className="text-2xl text-primary-400 p-12">Cargando preguntas...</div>;
  if (error) return <div className="text-2xl text-red-400 p-12">{error}</div>;
  if (!questions.length) return <div className="text-2xl text-yellow-400 p-12">No hay preguntas cargadas.</div>;

  return <QuestionWheel questions={questions} />;
}

"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import QuestionWheel from './QuestionWheel';

export default function RuletaClient() {
  const searchParams = useSearchParams();
  const setId = searchParams.get("id");
  const questionsParam = searchParams.get("questions");
  const tempParam = searchParams.get("temp");
  const [questions, setQuestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(!!setId);
  const [error, setError] = useState("");
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (questionsParam) {
      try {
        const decoded = decodeURIComponent(questionsParam);
        const parsedQuestions = JSON.parse(decoded);

        if (Array.isArray(parsedQuestions) && parsedQuestions.length > 0) {
          setQuestions(parsedQuestions);
          setInitialized(true);
          return;
        } else {
          const errorMsg = 'Parsed questions is not an array or is empty';
          setError(errorMsg);
          setInitialized(true);
        }
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        const errorMsg = `Error al parsear preguntas: ${message}`;
        setError(errorMsg);
        setInitialized(true);
      }
    }

    if (tempParam) {
      try {
        const raw = sessionStorage.getItem('tempQuestions');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setQuestions(parsed);
            setInitialized(true);
            return;
          }
        }
        setError('No se encontraron preguntas temporales en el navegador');
        setInitialized(true);
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        setError(`Error al leer preguntas temporales: ${message}`);
        setInitialized(true);
      }
    }

    if (setId) {
      setLoading(true);
      setError('');

      fetch(`/api/questionsets/${setId}`)
        .then(async (res) => {
          if (!res.ok) {
            const errorData = await res.text().catch(() => 'No error details');
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
          setInitialized(true);
        });
    }
  }, [setId, questionsParam, tempParam]);

  if (!initialized || loading) return <div className="text-2xl text-primary-400 p-12">Cargando preguntas...</div>;
  if (error) return <div className="text-2xl text-red-400 p-12">{error}</div>;
  if (!questions.length) return <div className="text-2xl text-yellow-400 p-12">No hay preguntas cargadas.</div>;

  return <QuestionWheel questions={questions} />;
}

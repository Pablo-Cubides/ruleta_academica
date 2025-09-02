"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import QuestionWheel from '@/components/QuestionWheel';

export default function RuletaPage() {
  const searchParams = useSearchParams();
  const setId = searchParams.get("id");
  const questionsParam = searchParams.get("questions");
  const [questions, setQuestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(!!setId);
  const [error, setError] = useState("");

  console.log('RuletaPage - searchParams:', { setId, questionsParam });

  useEffect(() => {
    console.log('useEffect triggered with:', { setId, questionsParam });
    
    // Si hay un parámetro de preguntas, lo usamos directamente
    if (questionsParam) {
      try {
        console.log('Parsing questionsParam:', questionsParam);
        const decoded = decodeURIComponent(questionsParam);
        console.log('Decoded questionsParam:', decoded);
        const parsedQuestions = JSON.parse(decoded);
        console.log('Parsed questions:', parsedQuestions);
        
        if (Array.isArray(parsedQuestions) && parsedQuestions.length > 0) {
          console.log('Setting questions from URL parameter');
          setQuestions(parsedQuestions);
          return;
        } else {
          const errorMsg = 'Parsed questions is not an array or is empty';
          console.error(errorMsg);
          setError(errorMsg);
        }
      } catch (e) {
        const errorMsg = `Error al parsear preguntas: ${e.message}`;
        console.error(errorMsg, e);
        setError(errorMsg);
      }
    }
    
    // Si hay un ID de conjunto, cargamos las preguntas
    if (setId) {
      console.log('Fetching questions for set ID:', setId);
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
          console.log('Received question set data:', data);
          if (data?.questions?.length > 0) {
            const questionTexts = data.questions.map((q: any) => q.text);
            console.log('Extracted question texts:', questionTexts);
            setQuestions(questionTexts);
          } else {
            throw new Error('No questions found in the response');
          }
        })
        .catch((error) => {
          console.error('Error loading question set:', error);
          setError(`No se pudo cargar el conjunto de preguntas: ${error.message}`);
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

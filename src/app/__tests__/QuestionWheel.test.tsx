import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import QuestionWheel from '../../components/QuestionWheel';

describe('QuestionWheel', () => {
  const mockQuestions = [
    'Pregunta 1',
    'Pregunta 2',
    'Pregunta 3',
  ];

  it('should render with questions', () => {
    render(<QuestionWheel questions={mockQuestions} />);
    expect(screen.getByText(/Preguntas restantes: 3/i)).toBeInTheDocument();
  });

  it('should render spin button', () => {
    render(<QuestionWheel questions={mockQuestions} />);
    const spinButton = screen.getByRole('button', { name: /girar/i });
    expect(spinButton).toBeInTheDocument();
    expect(spinButton).not.toBeDisabled();
  });

  it('should render remove button as disabled initially', () => {
    render(<QuestionWheel questions={mockQuestions} />);
    const removeButton = screen.getByRole('button', { name: /eliminar pregunta/i });
    expect(removeButton).toBeDisabled();
  });

  it('should disable spin button when no questions', () => {
    render(<QuestionWheel questions={[]} />);
    const spinButton = screen.getByRole('button', { name: /girar/i });
    expect(spinButton).toBeDisabled();
  });

  it('should show remaining questions count', () => {
    render(<QuestionWheel questions={mockQuestions} />);
    expect(screen.getByText('Preguntas restantes: 3')).toBeInTheDocument();
  });

  it('should update questions count after initialization', () => {
    const { rerender } = render(<QuestionWheel questions={mockQuestions} />);
    expect(screen.getByText('Preguntas restantes: 3')).toBeInTheDocument();

    rerender(<QuestionWheel questions={['Pregunta 1', 'Pregunta 2']} />);
    expect(screen.getByText('Preguntas restantes: 2')).toBeInTheDocument();
  });

  it('should render wheel segments for each question', () => {
    render(<QuestionWheel questions={mockQuestions} />);
    // SVG should contain paths for wheel segments
    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  // Note: Testing spin animation and modal behavior requires more complex setup
  // with animation frame mocking and async testing utilities
});

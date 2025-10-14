# API reference — Ruleta Académica

All endpoints are under `/api/questionsets`.

GET /api/questionsets
- Description: Returns a list of saved question sets with basic metadata.
- Response: `200 OK` with JSON `QuestionSet[]`. In dev, if DB absent returns `[]`.

GET /api/questionsets/:id
- Description: Returns a specific question set including its questions.
- Response: `200 OK` with JSON `{ id, name, questions: [{ id, text }] }`.
- Errors: `404 Not Found` if ID not present, `500` for DB errors.

POST /api/questionsets
- Description: Create a new question set.
- Payload (JSON):

```json
{
  "name": "Nombre del conjunto",
  "questions": ["p1", "p2", "p3"]
}
```

- Validation: Zod schema ensures `name` is non-empty string and `questions` is non-empty array of strings.
- Success: `201 Created` with created resource.
- Errors: `400 Bad Request` if validation fails; `409 Conflict` if `name` already exists; `503 Service Unavailable` if DB is not configured (fallback behaviour documented).

Notes
-----
- Endpoints are intentionally simple; add authentication/authorization before exposing in production.
- For large question lists, prefer saving on the client and passing `temp=1` sessionStorage approach to start the game immediately.

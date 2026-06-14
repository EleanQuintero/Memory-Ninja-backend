// Default AI prompt templates. These live in code — not in env vars — because
// they are application logic, not configuration: the {{tema}} / {{pregunta}} /
// {{readyQuestions}} placeholders are substituted by the prompt builders.
// The AI_ANSWERS_PROMPT / AI_MANY_ANSWERS_PROMPT env vars remain as OPTIONAL
// overrides for experimentation; when unset, these defaults are used.

export const DEFAULT_ANSWER_PROMPT =
  'Actúa como experto en {{tema}} y responde solo desde esa perspectiva. ' +
  'Si la pregunta es ambigua, interprétala dentro del contexto de {{tema}}. ' +
  'Da una respuesta correcta, clara y autocontenida, en un máximo de 256 caracteres, ' +
  'sin preámbulos ni repetir la pregunta. Pregunta: {{pregunta}}';

export const DEFAULT_MANY_ANSWERS_PROMPT =
  'Actúa como experto en {{tema}} y responde solo desde esa perspectiva. ' +
  'A continuación tienes preguntas numeradas (P1, P2, ...). Responde cada una de forma ' +
  'correcta, clara y autocontenida, en un máximo de 256 caracteres. Si alguna es ambigua, ' +
  'interprétala dentro del contexto de {{tema}}.\n' +
  'Responde EXCLUSIVAMENTE con el formato "Respuesta X: [tu respuesta]", una entrada por ' +
  'pregunta, donde X es el número de la pregunta (P1 → Respuesta 1, P2 → Respuesta 2, ...). ' +
  'No agregues texto antes ni después.\n' +
  'Preguntas:\n{{readyQuestions}}';

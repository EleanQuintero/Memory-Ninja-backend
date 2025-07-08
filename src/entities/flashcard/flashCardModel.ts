interface flashcard{
    flashcard_id?: string;
    question: string;
    answer: string;
    theme: string;
}

interface flashcardToSync {
    user_id: string 
    flashcard: flashcard[]
  }


export type {flashcard, flashcardToSync}
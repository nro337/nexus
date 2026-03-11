import { db } from "./schema";
import type { Note, CreateNoteInput, UpdateNoteInput } from "../types";
import { generateId } from "../lib/utils";

export async function createNote(input: CreateNoteInput): Promise<Note> {
  const now = new Date();
  const note: Note = {
    ...input,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  };
  await db.notes.add(note);
  return note;
}

export async function updateNote(input: UpdateNoteInput): Promise<void> {
  await db.notes.update(input.id, {
    body: input.body,
    updatedAt: new Date(),
  });
}

export async function deleteNote(id: string): Promise<void> {
  await db.notes.delete(id);
}

export async function getNotesForResource(resourceId: string): Promise<Note[]> {
  return db.notes.where("resourceId").equals(resourceId).sortBy("createdAt");
}

export async function getNoteCount(): Promise<number> {
  return db.notes.count();
}

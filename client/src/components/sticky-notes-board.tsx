import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, PenTool, Plus, Trash2 } from "lucide-react";
import { type CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from "react";

type StickyNote = {
  id: string;
  text: string;
  color: string;
  tilt: number;
  isDraft: boolean;
  isEditing: boolean;
};

interface StickyNotesBoardProps {
  storageKey: string;
  contextLabel: string;
  className?: string;
}

const MAX_NOTES = 16;
const MAX_NOTE_LENGTH = 1200;

const STICKY_COLORS = [
  "#ffe99d",
  "#ffd7ac",
  "#bdf4d2",
  "#b8e7ff",
  "#e6d1ff",
  "#ffd2df",
] as const;

const createDefaultNote = (): StickyNote => {
  const tiltOptions = [-2, -1, 0, 1, 2];
  return {
    id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
    text: "",
    color: STICKY_COLORS[Math.floor(Math.random() * STICKY_COLORS.length)],
    tilt: tiltOptions[Math.floor(Math.random() * tiltOptions.length)],
    isDraft: true,
    isEditing: false,
  };
};

const parseStoredNotes = (value: string | null): StickyNote[] => {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((item) => typeof item?.id === "string")
      .map((item) => ({
        id: String(item.id),
        text: typeof item.text === "string" ? item.text.slice(0, MAX_NOTE_LENGTH) : "",
        color: typeof item.color === "string" ? item.color : STICKY_COLORS[0],
        tilt: Number.isFinite(item.tilt) ? Number(item.tilt) : 0,
        isDraft: typeof item.isDraft === "boolean" ? item.isDraft : !(item.text || "").trim(),
        isEditing: false,
      }));
  } catch {
    return [];
  }
};

const getNoteWidth = (text: string) => {
  const contentLength = text.trim().length;
  if (contentLength >= 700) return 760;
  if (contentLength >= 450) return 620;
  if (contentLength >= 260) return 520;
  if (contentLength >= 120) return 420;
  return 320;
};

export function StickyNotesBoard({ storageKey, contextLabel, className }: StickyNotesBoardProps) {
  const [notes, setNotes] = useState<StickyNote[]>([]);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setNotes(parseStoredNotes(window.localStorage.getItem(storageKey)));
  }, [storageKey]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(storageKey, JSON.stringify(notes));
  }, [notes, storageKey]);

  const canAddMore = notes.length < MAX_NOTES;

  const noteCountLabel = useMemo(() => `${notes.length}/${MAX_NOTES}`, [notes.length]);

  const handleAddNote = () => {
    if (!canAddMore) return;
    const newNote = createDefaultNote();
    setNotes((current) => [...current, newNote]);

    window.requestAnimationFrame(() => {
      if (!trackRef.current) return;
      trackRef.current.scrollTo({
        left: trackRef.current.scrollWidth,
        behavior: "smooth",
      });
    });
  };

  const handleDeleteNote = (id: string) => {
    setNotes((current) => current.filter((note) => note.id !== id));
  };

  const updateScrollState = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;

    const maxScroll = Math.max(0, track.scrollWidth - track.clientWidth);
    setCanScrollLeft(track.scrollLeft > 2);
    setCanScrollRight(track.scrollLeft < maxScroll - 2);
  }, []);

  useEffect(() => {
    updateScrollState();
  }, [notes.length, updateScrollState]);

  useEffect(() => {
    const handleResize = () => updateScrollState();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [updateScrollState]);

  const scrollTrack = (direction: "left" | "right") => {
    const track = trackRef.current;
    if (!track) return;
    const offset = Math.max(220, track.clientWidth * 0.65);
    track.scrollBy({
      left: direction === "left" ? -offset : offset,
      behavior: "smooth",
    });
  };

  const handleUpdateText = (id: string, text: string, target?: HTMLTextAreaElement) => {
    const nextText = text.slice(0, MAX_NOTE_LENGTH);

    if (target) {
      target.style.height = "0px";
      target.style.height = `${Math.max(120, target.scrollHeight)}px`;
    }

    setNotes((current) =>
      current.map((note) =>
        note.id === id
          ? {
              ...note,
              text: nextText,
              isDraft: !nextText.trim(),
            }
          : note
      )
    );
  };

  const toggleEditing = (id: string, editing?: boolean) => {
    setNotes((current) =>
      current.map((note) =>
        note.id === id
          ? {
              ...note,
              isEditing: typeof editing === "boolean" ? editing : !note.isEditing,
            }
          : note
      )
    );
  };

  return (
    <section className={cn("app-sticky-canvas", className)}>
      <div className="app-sticky-toolbar">
        <Button
          onClick={handleAddNote}
          disabled={!canAddMore}
          size="icon"
          className="app-sticky-plus-btn h-11 w-11 rounded-full"
          data-testid="button-add-sticky-note"
          aria-label="Add sticky note"
        >
          <Plus className="h-5 w-5" />
        </Button>

        <div className="flex-1">
          <p className="app-mono text-[10px] text-[var(--app-muted)]">{contextLabel}</p>
          <p className="app-display mt-1 text-xl font-bold tracking-[-0.02em] text-[var(--app-ink)]">Sticky note canvas</p>
        </div>

        <div className="flex items-center gap-2 self-start">
          <span className="app-inline-chip">{noteCountLabel}</span>
        </div>
      </div>

      <div className="app-sticky-viewport">
        <div className={cn("app-sticky-fade app-sticky-fade-left", canScrollLeft && "is-visible")} />
        <div className={cn("app-sticky-fade app-sticky-fade-right", canScrollRight && "is-visible")} />

        <div
          ref={trackRef}
          data-lenis-prevent
          className="app-sticky-track"
          onScroll={updateScrollState}
        >
          {notes.length === 0 && (
            <div className="app-sticky-empty-note">
              <p className="text-xl font-bold text-[var(--app-ink)]">No notes yet</p>
              <p className="mt-2 text-sm text-[var(--app-muted)]">
                Tap <span className="font-semibold text-[var(--app-ink)]">+</span> to create a low-opacity draft note, then edit it.
              </p>
            </div>
          )}

          {notes.map((note) => (
            <article
              key={note.id}
              className={cn("app-sticky-note-card", note.isDraft && "app-sticky-note-draft")}
              style={
                {
                  "--sticky-card-bg": note.color,
                  "--sticky-width": `${getNoteWidth(note.text)}px`,
                  "--sticky-tilt": `${note.tilt}deg`,
                } as CSSProperties
              }
            >
              <div className="flex items-center justify-between gap-2">
                <span className="app-mono text-[10px] text-black/55">Sticky note</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => toggleEditing(note.id)}
                    className="app-sticky-note-btn"
                    aria-label={note.isEditing ? "Finish editing note" : "Edit note"}
                  >
                    <PenTool className="h-3.5 w-3.5" />
                    <span className="app-sticky-action-label">{note.isEditing ? "Done" : "Edit"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteNote(note.id)}
                    className="app-sticky-note-btn app-sticky-note-btn-danger"
                    aria-label="Delete note"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span className="app-sticky-action-label">Delete</span>
                  </button>
                </div>
              </div>

              {note.isEditing ? (
                <textarea
                  value={note.text}
                  onChange={(event) => handleUpdateText(note.id, event.target.value, event.target)}
                  onBlur={() => toggleEditing(note.id, false)}
                  className="app-sticky-note-editor"
                  placeholder="Write note details..."
                  maxLength={MAX_NOTE_LENGTH}
                  autoFocus
                />
              ) : (
                <button
                  type="button"
                  onClick={() => toggleEditing(note.id, true)}
                  className="app-sticky-note-view"
                >
                  {note.text.trim() ? note.text : "Tap edit and start typing..."}
                </button>
              )}
            </article>
          ))}
        </div>

        {canScrollLeft && (
          <button
            type="button"
            onClick={() => scrollTrack("left")}
            className="app-sticky-nav-btn app-sticky-nav-left"
            aria-label="Scroll sticky notes left"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}

        {canScrollRight && (
          <button
            type="button"
            onClick={() => scrollTrack("right")}
            className="app-sticky-nav-btn app-sticky-nav-right"
            aria-label="Scroll sticky notes right"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </section>
  );
}

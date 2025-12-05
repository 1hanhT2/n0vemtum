import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useCreateSubtask, useDeleteSubtask, useSubtasks, useUpdateSubtask } from "@/hooks/use-subtasks";

interface HabitSubtasksEditorProps {
  habitId: number;
  isGuestMode?: boolean;
}

export function HabitSubtasksEditor({ habitId, isGuestMode = false }: HabitSubtasksEditorProps) {
  const { data: subtasks = [], isLoading } = useSubtasks(habitId, { enabled: !isGuestMode });
  const createSubtask = useCreateSubtask();
  const updateSubtask = useUpdateSubtask();
  const deleteSubtask = useDeleteSubtask();

  const [newSubtaskName, setNewSubtaskName] = useState("");
  const [subtaskDrafts, setSubtaskDrafts] = useState<Record<number, string>>({});

  const activeSubtasks = useMemo(() => subtasks.filter((subtask) => subtask.isActive), [subtasks]);

  useEffect(() => {
    const drafts = activeSubtasks.reduce<Record<number, string>>((acc, subtask) => {
      acc[subtask.id] = subtask.name;
      return acc;
    }, {});

    setSubtaskDrafts(drafts);
  }, [activeSubtasks]);

  const handleAddSubtask = async () => {
    const name = newSubtaskName.trim();
    if (!name || isGuestMode) return;

    await createSubtask.mutateAsync({
      habitId,
      userId: "",
      name,
      order: activeSubtasks.length,
      isActive: true,
    });

    setNewSubtaskName("");
  };

  const handleUpdateSubtask = async (subtaskId: number) => {
    if (isGuestMode) return;
    const name = subtaskDrafts[subtaskId]?.trim();
    const existing = activeSubtasks.find((subtask) => subtask.id === subtaskId);

    if (!name || !existing || name === existing.name) return;

    await updateSubtask.mutateAsync({
      id: subtaskId,
      habitId,
      name,
    });
  };

  const handleDeleteSubtask = async (subtaskId: number) => {
    if (isGuestMode) return;

    await deleteSubtask.mutateAsync({ id: subtaskId, habitId });
  };

  if (isLoading) {
    return (
      <div className="space-y-2 bg-muted/50 rounded-lg p-3">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-5/6" />
      </div>
    );
  }

  return (
    <div className="space-y-3 bg-muted/50 rounded-lg p-3">
      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Subtasks</div>

      {activeSubtasks.length === 0 && (
        <p className="text-sm text-muted-foreground">No subtasks yet. Add a few to break this habit into steps.</p>
      )}

      {activeSubtasks.map((subtask) => (
        <div key={subtask.id} className="flex items-center gap-2">
          <Input
            value={subtaskDrafts[subtask.id] ?? ""}
            onChange={(e) =>
              setSubtaskDrafts((prev) => ({
                ...prev,
                [subtask.id]: e.target.value.slice(0, 80),
              }))
            }
            onBlur={() => handleUpdateSubtask(subtask.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleUpdateSubtask(subtask.id);
              }
            }}
            className="flex-1"
            placeholder="Subtask name"
            disabled={isGuestMode}
          />
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={() => handleDeleteSubtask(subtask.id)}
            className="text-destructive hover:text-destructive"
            disabled={isGuestMode}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}

      <div className="flex items-center gap-2">
        <Input
          value={newSubtaskName}
          onChange={(e) => setNewSubtaskName(e.target.value.slice(0, 80))}
          placeholder={isGuestMode ? "Subtasks are disabled in demo mode" : "Add a new subtask"}
          className="flex-1"
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAddSubtask();
          }}
          disabled={isGuestMode}
        />
        <Button
          type="button"
          onClick={handleAddSubtask}
          size="icon"
          disabled={!newSubtaskName.trim() || isGuestMode}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {isGuestMode && (
        <p className="text-xs text-muted-foreground">Subtasks are available once you sign in.</p>
      )}
    </div>
  );
}

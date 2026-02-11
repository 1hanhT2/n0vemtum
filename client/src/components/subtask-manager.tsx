import { useState } from 'react';
import { Plus, Trash2, Check } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useSubtasks, useCreateSubtask, useDeleteSubtask } from "@/hooks/use-subtasks";
import type { Subtask } from "@shared/schema";
import { motion, AnimatePresence } from "framer-motion";

interface SubtaskManagerProps {
  habitId: number;
  subtaskCompletions: Record<number, boolean>;
  onSubtaskToggle: (subtaskId: number, completed: boolean, habitId: number, totalSubtasks: number, completedSubtasks: number) => void;
  isDayCompleted: boolean;
  isGuestMode?: boolean;
}

export function SubtaskManager({ 
  habitId, 
  subtaskCompletions, 
  onSubtaskToggle, 
  isDayCompleted,
  isGuestMode = false 
}: SubtaskManagerProps) {
  const { data: subtasks = [], isLoading } = useSubtasks(habitId);
  const createSubtask = useCreateSubtask();
  const deleteSubtask = useDeleteSubtask();
  const [newSubtaskName, setNewSubtaskName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddSubtask = async () => {
    if (!newSubtaskName.trim() || isGuestMode) return;
    
    // Note: userId will be added by the backend from the authenticated session
    await createSubtask.mutateAsync({
      habitId,
      userId: '', // Will be set by backend
      name: newSubtaskName,
      order: subtasks.length,
      isActive: true,
    });
    
    setNewSubtaskName('');
    setIsAdding(false);
  };

  const handleDeleteSubtask = async (subtaskId: number) => {
    if (isGuestMode) return;
    await deleteSubtask.mutateAsync({ id: subtaskId, habitId });
  };

  const activeSubtasks = subtasks.filter(st => st.isActive);
  const completedCount = activeSubtasks.filter(st => subtaskCompletions[st.id]).length;

  if (isLoading) return null;

  return (
    <div className="space-y-2">
      {activeSubtasks.length > 0 && (
        <>
          <AnimatePresence>
            {activeSubtasks.map((subtask) => (
              <motion.div
                key={subtask.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 pl-2 group"
              >
                <Checkbox
                  data-testid={`checkbox-subtask-${subtask.id}`}
                  checked={subtaskCompletions[subtask.id] || false}
                  onCheckedChange={(checked) => onSubtaskToggle(subtask.id, checked as boolean, habitId, activeSubtasks.length, completedCount)}
                  disabled={isDayCompleted}
                  className="h-4 w-4"
                />
                <span className={`text-sm flex-1 ${subtaskCompletions[subtask.id] ? 'line-through text-muted-foreground' : ''}`}>
                  {subtask.name}
                </span>
                {!isDayCompleted && !isGuestMode && (
                  <Button
                    data-testid={`button-delete-subtask-${subtask.id}`}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteSubtask(subtask.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          <div className="pl-2 text-xs text-muted-foreground">
            {completedCount} / {activeSubtasks.length} completed
          </div>
        </>
      )}

      {!isDayCompleted && (
        <div className="pl-2">
          {isAdding ? (
            <div className="flex items-center gap-2" data-testid="div-add-subtask-form">
              <Input
                data-testid="input-subtask-name"
                value={newSubtaskName}
                onChange={(e) => setNewSubtaskName(e.target.value)}
                placeholder="Subtask name..."
                className="h-8 text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddSubtask();
                  if (e.key === 'Escape') {
                    setIsAdding(false);
                    setNewSubtaskName('');
                  }
                }}
                autoFocus
                disabled={isGuestMode}
              />
              <Button
                data-testid="button-save-subtask"
                size="sm"
                onClick={handleAddSubtask}
                disabled={!newSubtaskName.trim() || isGuestMode}
                className="h-8"
              >
                <Check className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              data-testid="button-add-subtask"
              variant="ghost"
              size="sm"
              onClick={() => setIsAdding(true)}
              className="h-8 text-xs text-muted-foreground hover:text-foreground"
              disabled={isGuestMode}
            >
              <Plus className="h-3 w-3 mr-1" />
              Add subtask
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

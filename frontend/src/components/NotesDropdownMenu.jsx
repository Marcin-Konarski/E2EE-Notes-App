import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { EllipsisVertical, SquarePen, Trash2, AlertTriangle } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/DropDownMenu'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "@/components/ui/dialog"
import useNotes from '@/hooks/useNotes'

const NotesDropdownMenu = ({ currentNote, onRename }) => {
  const navigate = useNavigate();
  const { deleteNote } = useNotes();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const handleDelete = async () => {
    setIsDeleting(true);
    setDeleteError(null);

    const result = await deleteNote(currentNote.id);
    
    if (result.success) {
      setShowDeleteDialog(false);
      navigate('/notes');
    } else {
      setDeleteError(result.error);
      setIsDeleting(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className='p-0 m-0 size-7 rounded-md hover:bg-muted' variant='ghost'>
            <EllipsisVertical className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-48" align="end">
          <DropdownMenuGroup>
            <DropdownMenuItem className='cursor-pointer' onClick={() => { onRename() }} >
              <span className="flex items-center justify-between w-full">
                Rename
                <SquarePen className="size-4" />
              </span>
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuItem className='cursor-pointer text-destructive focus:text-destructive' onClick={() => { setShowDeleteDialog(true) }}>
            <span className="flex items-center justify-between w-full">
              Delete
              <Trash2 className="size-4" />
            </span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Note</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{currentNote.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {deleteError && (
            <Alert variant="destructive">
              <AlertTriangle className="size-4" />
              <AlertDescription>{deleteError}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default NotesDropdownMenu
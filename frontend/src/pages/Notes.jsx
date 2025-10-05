import { Link, Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

import useNotes from "@/hooks/useNotes";
import { useUserContext } from "@/hooks/useUserContext";
import { useNotesContext } from "@/hooks/useNotesContext";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor'
import NotesDropdownMenu from "@/components/NotesDropdownMenu";
import DisappearingAlert from "@/components/DisappearingAlert";
import { Input } from "@/components/tiptap-ui-primitive/input";
import { Button } from "@/components/ui/Button";
import EditorAnonymous from "@/pages/EditorAnonymous";
import { cn } from "@/lib/utils";


const Notes = () => {
  const newNotePage = useLocation();
  const { user } = useUserContext();
  const { notes } = useNotesContext();

  if (!user) {
    return <EditorAnonymous />
  }

  return (
    <>
      {/* Mobile Layout */}
      <div className='flex-1 h-full w-full overflow-hidden lg:hidden'>
        <SimpleEditor />
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block h-full w-full">
        <ResizablePanelGroup direction="horizontal" className="w-full h-full border-t-1">
          <ResizablePanel defaultSize={12} minSize={10} maxSize={30} className='min-w-56'>
            <div className="flex w-full h-full items-start justify-start p-4">
              <div className='flex flex-col w-full gap-0'>
                {notes.map(note => (
                  <ListItem key={note.id} item={note} />
                ))}
              </div>
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={88}>
            <Outlet />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </>
  );
}


const ListItem = ({ item }) => {
  const { saveUpdateNote } = useNotes();
  const [isHovered, setIsHovered] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newTitle, setNewTitle] = useState(item.title);
  const [renameError, setRenameError] = useState(null);

  const handleRename = async () => {
    if (!newTitle.trim() || newTitle === item.title) {
      setIsRenaming(false);
      setNewTitle(item.title);
      return;
    }

    const status = await saveUpdateNote(item.id, { title: newTitle, body: item.body });
    if (status.error) {
      setRenameError(status.error);
      setNewTitle(item.title);
    }
    setIsRenaming(false);
  };

  if (isRenaming) {
    return (
      <div className="w-full px-3 border-2 rounded-sm">
        <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} onBlur={handleRename}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleRename();
            } else if (e.key === 'Escape') {
              setIsRenaming(false);
              setNewTitle(item.title);
            }
          }}
          autoFocus onFocus={(e) => e.target.select()} className="h-9 text-sm"
        />
      </div>
    );
  }

  return (<>

    {renameError && <div className='absolute z-20'>
      <DisappearingAlert title="Oops!" time="5s" variant="destructive" color="red-500">{renameError}</DisappearingAlert>
    </div>}

    <div className="relative w-full" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <Button variant="ghost" className={cn("flex flex-row gap-2 w-full rounded-md p-3",
          "leading-none text-sm font-medium justify-between hover:bg-accent transition-colors"
        )} asChild>
        <div className="w-full flex items-center justify-between">
          <Link to={item?.id || '/notes/new'} className='flex-1 flex items-center min-w-0'>
            <span className="truncate">{item.title}</span>
          </Link>
          <div className={cn("flex-shrink-0 transition-opacity",isHovered ? "opacity-100" : "opacity-0")} onClick={(e) => e.stopPropagation()}>
            <NotesDropdownMenu currentNote={item} onRename={() => {setIsRenaming(true); setRenameError(null);}} />
          </div>
        </div>
      </Button>
    </div>
  </>);
}


export default Notes
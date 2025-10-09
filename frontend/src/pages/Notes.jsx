import { Link, Outlet, useParams } from "react-router-dom";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

import useNotes from "@/hooks/useNotes";
import { useUserContext } from "@/hooks/useUserContext";
import { useNotesContext } from "@/hooks/useNotesContext";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import NotesDropdownMenu from "@/components/NotesDropdownMenu";
import DisappearingAlert from "@/components/DisappearingAlert";
import { Input } from "@/components/tiptap-ui-primitive/input";
import { Button } from "@/components/ui/Button";
import EditorAnonymous from "@/pages/EditorAnonymous";
import { cn } from "@/lib/utils";
import NotesListMobile from "./NotesListMobile";
import Editor from "./Editor";


const Notes = () => {
  const params = useParams();
  const { user } = useUserContext();
  const { notes } = useNotesContext();

  const myNotes = useMemo(() => {
    return notes.filter(note => note.permission === 'O');
  }, [notes]);

  const sharedNotes = useMemo(() => {
    console.log(notes);
    return notes.filter(note => note.permission !== 'O');
  }, [notes])

  if (!user) {
    return <EditorAnonymous />
  }

  return (
    <>
      {/* Mobile Layout */}
      <div className='flex-1 h-full w-full overflow-hidden lg:hidden'>
        <Outlet />
        {/* {params.noteId
          ? <Outlet />
          : <NotesListMobile notesList={notes}/>
        } */}
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block h-full w-full">
        <ResizablePanelGroup direction="horizontal" className="w-full h-full border-t-1">
          <ResizablePanel defaultSize={12} minSize={10} maxSize={30} className='min-w-56'>
            <div className="flex w-full h-full items-start justify-start p-4">
              <div className='flex flex-col w-full gap-2'>
                <CollapsibleSection title="My notes" notes={myNotes} defaultOpen={true} />
                <CollapsibleSection title="Shared to me" notes={sharedNotes} defaultOpen={true} />
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


const CollapsibleSection = ({ title, notes, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="flex flex-col w-full">
      <button onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2 py-2 rounded-md hover:bg-accent/50 transition-colors group">
        {isOpen ? (
          <ChevronDown className="size-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        ) : (
          <ChevronRight className="size-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        )}
        <span className="text-sm font-semibold text-foreground/90 group-hover:text-foreground transition-colors">
          {title}
        </span>
        <span className="text-xs text-muted-foreground ml-auto">
          {notes.length}
        </span>
      </button>
      
      {isOpen && (
        <div className="flex flex-col gap-0.5 mt-1 ml-2">
          {notes.length === 0 ? (
            <div className="px-3 py-2 text-xs text-muted-foreground italic">
              No notes yet
            </div>
          ) : (
            notes.map(note => (
              <ListItem key={note.id} item={note} />
            ))
          )}
        </div>
      )}
    </div>
  );
};


const ListItem = memo(({ item }) => {
  const params = useParams();
  const { saveUpdateNote } = useNotes();
  const [isHovered, setIsHovered] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newTitle, setNewTitle] = useState(item.title);
  const [renameError, setRenameError] = useState(null);

  const handleRename = useCallback(async () => {
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
  }, [newTitle, item.title, item.body, item.id, saveUpdateNote]);

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
          `leading-none text-sm font-medium justify-between ${params.noteId === item?.id ? 'bg-accent/60 hover:bg-accent transition-colors' : 'hover:bg-accent/70 transition-colors'}`
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
});


export default Notes
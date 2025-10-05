import { Link, Outlet } from "react-router-dom";
import { useState } from "react";

import { useUserContext } from "@/hooks/useUserContext";
import { useNotesContext } from "@/hooks/useNotesContext";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor'
import { Button } from "@/components/ui/Button";
import EditorAnonymous from "@/pages/EditorAnonymous";
import { cn } from "@/lib/utils";
import NotesDropdownMenu from "@/components/NotesDropdownMenu";


const Notes = () => {
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
          <ResizablePanel defaultSize={15} minSize={12} maxSize={30} className='min-w-56'>
            <div className="flex w-full h-full items-start justify-start p-4">
              <div className='flex flex-col w-full gap-0'>
                {notes.map(note => (
                  <ListItem key={note.id} item={note} />
                ))}
              </div>
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={85}>
            <Outlet />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </>
  );
}


const ListItem = ({ item }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="relative w-full" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <Button variant="ghost" className={cn("flex flex-row gap-2 w-full rounded-md p-3",
          "leading-none text-sm font-medium justify-between hover:bg-accent transition-colors"
        )} asChild>
        <div className="w-full flex items-center justify-between">
          <Link to={item.id} className='flex-1 flex items-center min-w-0'>
            <span className="truncate">{item.title}</span>
          </Link>
          <div className={cn("flex-shrink-0 transition-opacity",isHovered ? "opacity-100" : "opacity-0")} onClick={(e) => e.stopPropagation()}>
            <NotesDropdownMenu currentNote={item} />
          </div>
        </div>
      </Button>
    </div>
  );
}


export default Notes
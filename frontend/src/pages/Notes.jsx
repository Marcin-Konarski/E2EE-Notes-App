import { Link, Outlet } from "react-router-dom";

import { useUserContext } from "@/hooks/useUserContext";
import { useNotesContext } from "@/hooks/useNotesContext";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor'
import { Button } from "@/components/ui/Button";
import EditorAnonymous from "@/pages/EditorAnonymous";
import { cn } from "@/lib/utils";


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
          <ResizablePanel defaultSize={12} className='min-w-56'>
            <div className="flex w-full h-full items-center justify-center p-6">
              <div className='flex flex-col'>
                {notes.map(
                  note => <ListItem key={note.id} item={note} />
                )}
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


const ListItem = ({ item, onClick }) => {
  return (
    <Button onClick={onClick} variant="ghost" className={cn( "flex flex-row gap-2",
      "w-full rounded-xs p-3 leading-none text-sm font-semibold justify-start" )} asChild >
        <Link to={item.id}>{item.title}</Link>
    </Button>
  );
}


export default Notes
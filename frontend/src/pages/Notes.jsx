import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor'

const Notes = () => {

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
            <div className="flex h-full items-center justify-center p-6">
              <span className="font-semibold">Sidebar</span>
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={88}>
            <div className="simple-editor-wrapper h-full w-full flex flex-col items-start justify-start">
              <div className='flex-1 h-full w-full overflow-hidden'>
                <SimpleEditor />
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </>
  );
}

export default Notes
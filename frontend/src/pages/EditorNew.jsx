import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor';


const EditorNew = () => {
    return (
        <div className="simple-editor-wrapper h-full w-full flex flex-col items-start justify-start">
            <div className='flex-1 h-full w-full overflow-hidden'>
                <SimpleEditor content={null} />
            </div>
        </div>
    );
}

export default EditorNew
import { useNavigate, useParams } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react';

import { useNotesContext } from '@/hooks/useNotesContext';
import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor';
import Blank from '@/pages/Blank';
import NotesService from '@/services/NotesService';


const Editor = () => {
    const navigate = useNavigate();
    const { noteId } = useParams();
    const { notes } = useNotesContext();
    const [isLoading, setIsLoading] = useState(true);

    // Find current note based on id from URL based on clicked note to display according body
    const currentNote = useMemo(() => {
        return notes.find(note => String(note.id) === String(noteId))
    }, [noteId, notes]);

    // Find if any note matches id from URL. If not don't display editor at all
    const validId = useMemo(() => {
        return notes.some(note => String(note.id) === String(noteId))
    }, [noteId])

    // Set loading to false once we have notes so that note's body is correctly displayed in editor
    useEffect(() => {
        if (notes.length > 0)
            setIsLoading(false);
    }, [notes]);
    
    const handleEditorUpdate = async ({ json, html }) => {
        if (!currentNote) return;

        try {
            await NotesService.updateNote(currentNote.id, {body: JSON.stringify(json)});
        } catch (err) {
            console.log(err);
        }
    };

    if (!validId || !currentNote) {
        return <Blank />
    }

    return (<>
        {!isLoading && notes.length !== 0 &&
        <div className="simple-editor-wrapper h-full w-full flex flex-col items-start justify-start">
            <div className='flex-1 h-full w-full overflow-hidden'>
                <SimpleEditor onClose={() => navigate('/notes')} content={currentNote && currentNote.body} />
            </div>
        </div>}
    </>);
}

export default Editor
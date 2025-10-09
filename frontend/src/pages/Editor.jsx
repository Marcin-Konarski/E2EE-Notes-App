import { useNavigate, useParams } from 'react-router-dom'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import useNotes from '@/hooks/useNotes';
import { useNotesContext } from '@/hooks/useNotesContext';
import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor';
import Blank from '@/pages/Blank';


const Editor = () => {
    const navigate = useNavigate();
    const { noteId } = useParams();
    const { saveUpdateNote } = useNotes();
    const { notes, getNoteBody, noteEdits, currentNoteId, setCurrentNoteId, storageNoteIdKey } = useNotesContext();
    const [isLoading, setIsLoading] = useState(true);
    // const previousNoteIdRef = useRef(null);


    // Find current note based on id from URL based on clicked note to display according body
    const currentNote = useMemo(() => {
        return notes.find(note => String(note.id) === String(noteId));
    }, [noteId, notes]);

    // Find if any note matches id from URL. If not don't display editor at all
    const validId = useMemo(() => {
        return notes.some(note => String(note.id) === String(noteId))
    }, [noteId, notes])

    // Get the current body (edited or original)
    const currentBody = useMemo(() => {
        if (currentNote?.id) {
            return getNoteBody(currentNote.id);
        }
        return ''
    }, [currentNote, getNoteBody])

    const handleKeyDown = useCallback((event) => {
        if (event.ctrlKey && event.key === 's') {
            event.preventDefault();

            if (currentNote?.id) {
                const editedBody = noteEdits[currentNote.id];
                if (editedBody !== undefined && currentNote.body !== JSON.stringify(editedBody)) {
                    saveUpdateNote(currentNote.id, {
                        title: currentNote.title,
                        body: JSON.stringify(editedBody)
                    }).then(() => {
                        console.log('Note saved successfully');
                    }).catch(err => {
                        console.error('Failed to save note:', err);
                    });
                }
            }
        }
    }, [currentNote, noteEdits, saveUpdateNote]);

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]);

    // Set loading to false once we have notes so that note's body is correctly displayed in editor (waiting for backend to fetch notes before rendering)
    useEffect(() => {
        if (notes.length > 0) {
            setIsLoading(false);
        }
    }, [notes, setCurrentNoteId]);

    // useEffect(() => {
    //     const savePreviousNote = async () => {
    //         const previousNoteId = previousNoteIdRef.current;

    //         if (previousNoteId && previousNoteId !== currentNote?.id) { // If there was a previous note
    //             const previousOriginalNote = notes.find(note => note.id === previousNoteId); // Get the state of previous note's original state (unedited, from backend)
    //             const previousEditedNoteBody = JSON.stringify(noteEdits[previousNoteId]); // Get the edited body (content) state of previous note

    //             // Check is note was edited at all (initial state is undefined thus one need to check for this as well)
    //             if (previousOriginalNote && previousEditedNoteBody !== undefined && previousOriginalNote.body !== previousEditedNoteBody) {
    //                 saveUpdateNote(previousNoteId, {title: previousOriginalNote.title, body: previousEditedNoteBody}) //?!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!? HERE TITLE IS OLD ONE!! TODO: IMPLEMENT TITLE EDITING FUNCTIONALITY
    //                                 .catch(err => console.log('Background save failed: ', err));
    //             }
    //         }

    //         // Update ref immediately - don't wait for save
    //         if (currentNote?.id) {
    //             previousNoteIdRef.current = currentNote.id;
    //         }
    //     }

    //     if (currentNote?.id && previousNoteIdRef.current === null) {
    //         previousNoteIdRef.current = currentNote.id; // Initialize ref on the first render
    //     }

    //     savePreviousNote();
    // }, [currentNote?.id, notes, noteEdits, saveUpdateNote])

    // Update currentNoteId in context and localStorage whenever noteId changes
    useEffect(() => {
        if (currentNote?.id) {
            setCurrentNoteId(currentNote.id);
            localStorage.setItem(storageNoteIdKey, currentNote.id);
        }
    }, [currentNote]);

    if (isLoading || !validId || !currentNote) {
        return <Blank />
    }

    return (<>
        {!isLoading && notes.length !== 0 &&
        <div className="simple-editor-wrapper h-full w-full flex flex-col items-start justify-start">
            <div className='flex-1 h-full w-full overflow-hidden'>
                <SimpleEditor key={currentNoteId} onClose={() => navigate('/notes')} content={currentBody} />
            </div>
        </div>}
    </>);
}

export default Editor
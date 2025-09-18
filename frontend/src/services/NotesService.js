import apiClient from '@/services/ApiClient';

class NotesService {

    fetchNotes() {
        const controller = new AbortController();
        const request = apiClient.get('/notes/notes/me/', { signal: controller.signal });

        return { request, cancel: () => controller.abort() } // This cancel method from controller is used to cancel a request if needed. TODO: Remove if unused
    }
}

export default new NotesService




/// How to use:

// import NotesService from '@/services/NotesService';

//   const [notes, setNotes] = useState(null)
//   const [loading, setLoading] = userState(false) 


//   const onSubmitNotes = () => {
//     setLoading(true)
//     const { request, cancel } = NotesService.fetchNotes();
//     request
//         .then({
//              res => setNotes(res => res.data);
//              setLoading(false);
//          })
//         .catch(err => {
//              if (err instanceof CanceledError) return;
//              console.log(err.response.data);
//              setLoading(false);
//         });
//     console.log(notes);
//     return () => cancel();
//   }
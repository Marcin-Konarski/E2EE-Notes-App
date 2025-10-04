import { apiClient } from "@/services/ApiClient"

class NotesService {

    fetchNotes() {
        return apiClient.get('/notes/notes/me/');
    }

    createNote(data) {
        return apiClient.post('/notes/notes/', data);
    }

    //! CONSIDER REMOVING THIS ENDPOINT!!!!!!!!!!!!!!!!!!!!!!
    fetchSpecificNotes(id) {
        return apiClient.get(`/notes/notes/:${id}/`);
    }

    updateNote(id, data) {
        return apiClient.put(`/notes/notes/${id}/`, data);
    }

    deleteNote(id) {
        return apiClient.delete(`/notes/notes/${id}/`);
    }

}

export default new NotesService

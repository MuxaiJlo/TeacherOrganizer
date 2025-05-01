const API_URL = '/api/LessonDetails';


export const getAccessibleLessonDetails = async () => {
    try {
        const response = await fetch(`${API_URL}/accessible`);
        if (!response.ok) {
            const message = `Помилка HTTP: ${response.status}`;
            throw new Error(message);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching lesson details:', error);
        throw error;
    }
};


export const getLessonDetailsById = async (id) => {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        if (!response.ok) {
            const message = `Помилка HTTP: ${response.status}`;
            throw new Error(message);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Error fetching lesson details with id ${id}:`, error);
        throw error;
    }
};


export const createLessonDetails = async ({ lessonId, content, accessibleUserIds = [] }) => {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ lessonId, content, accessibleUserIds }),
        });
        if (!response.ok) {
            const message = `Помилка HTTP: ${response.status}`;
            throw new Error(message);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error creating lesson details:', error);
        throw error;
    }
};

export const updateLessonDetails = async (id, content) => {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ content }),
        });
        if (!response.ok) {
            const message = `Помилка HTTP: ${response.status}`;
            throw new Error(message);
        }
    } catch (error) {
        console.error(`Error updating lesson details with id ${id}:`, error);
        throw error;
    }
};

export const updateLessonDetailsAccess = async (id, userIds) => {
    try {
        const response = await fetch(`${API_URL}/${id}/access`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userIds }),
        });
        if (!response.ok) {
            const message = `Помилка HTTP: ${response.status}`;
            throw new Error(message);
        }
    } catch (error) {
        console.error(`Error updating access for lesson details with id ${id}:`, error);
        throw error;
    }
};


export const deleteLessonDetails = async (id) => {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            const message = `Помилка HTTP: ${response.status}`;
            throw new Error(message);
        }
    } catch (error) {
        console.error(`Error deleting lesson details with id ${id}:`, error);
        throw error;
    }
};


export const addUserAccess = async (lessonDetailsId, userId) => {
    try {
        const response = await fetch(`${API_URL}/${lessonDetailsId}/users/${userId}`, {
            method: 'POST',
        });
        if (!response.ok) {
            const message = `Помилка HTTP: ${response.status}`;
            throw new Error(message);
        }
    } catch (error) {
        console.error(`Error adding user access for user ${userId} to lesson details ${lessonDetailsId}:`, error);
        throw error;
    }
};


export const removeUserAccess = async (lessonDetailsId, userId) => {
    try {
        const response = await fetch(`${API_URL}/${lessonDetailsId}/users/${userId}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            const message = `Помилка HTTP: ${response.status}`;
            throw new Error(message);
        }
    } catch (error) {
        console.error(`Error removing user access for user ${userId} from lesson details ${lessonDetailsId}:`, error);
        throw error;
    }
};


export const getLessonDetailsByLessonId = async (lessonId) => {
    try {
        const allDetails = await getAccessibleLessonDetails();
        return allDetails.find(details => details.lessonId === lessonId) || null;
    } catch (error) {
        console.error(`Error fetching lesson details for lesson ${lessonId}:`, error);
        throw error;
    }
};

export default {
    getAccessibleLessonDetails,
    getLessonDetailsById,
    createLessonDetails,
    updateLessonDetails,
    updateLessonDetailsAccess,
    deleteLessonDetails,
    addUserAccess,
    removeUserAccess,
    getLessonDetailsByLessonId,
};
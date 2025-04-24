import axios from 'axios';

const API_URL = '/api/LessonDetails';

/**
 * Отримати всі деталі уроків, доступні поточному користувачу
 * @returns {Promise<Array>} Масив доступних деталей уроків
 */
export const getAccessibleLessonDetails = async () => {
    try {
        const response = await axios.get(`${API_URL}/accessible`);
        return response.data;
    } catch (error) {
        console.error('Error fetching lesson details:', error);
        throw error;
    }
};

/**
 * Отримати конкретні деталі уроку за ідентифікатором
 * @param {number} id - ID деталей уроку
 * @returns {Promise<Object>} Об'єкт деталей уроку
 */
export const getLessonDetailsById = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching lesson details with id ${id}:`, error);
        throw error;
    }
};

/**
 * Створити нові деталі уроку
 * @param {Object} lessonDetails - Об'єкт з даними деталей уроку
 * @param {number} lessonDetails.lessonId - ID уроку
 * @param {string} lessonDetails.content - Вміст деталей уроку
 * @param {Array<string>} lessonDetails.accessibleUserIds - Масив ID користувачів з доступом
 * @returns {Promise<Object>} Створені деталі уроку
 */
export const createLessonDetails = async ({ lessonId, content, accessibleUserIds = [] }) => {
    try {
        const response = await axios.post(API_URL, {
            lessonId,
            content,
            accessibleUserIds
        });
        return response.data;
    } catch (error) {
        console.error('Error creating lesson details:', error);
        throw error;
    }
};

/**
 * Оновити вміст деталей уроку
 * @param {number} id - ID деталей уроку
 * @param {string} content - Новий вміст деталей уроку
 * @returns {Promise<void>}
 */
export const updateLessonDetails = async (id, content) => {
    try {
        await axios.put(`${API_URL}/${id}`, { content });
    } catch (error) {
        console.error(`Error updating lesson details with id ${id}:`, error);
        throw error;
    }
};

/**
 * Оновити список користувачів з доступом до деталей уроку
 * @param {number} id - ID деталей уроку
 * @param {Array<string>} userIds - Масив ID користувачів, які матимуть доступ
 * @returns {Promise<void>}
 */
export const updateLessonDetailsAccess = async (id, userIds) => {
    try {
        await axios.put(`${API_URL}/${id}/access`, { userIds });
    } catch (error) {
        console.error(`Error updating access for lesson details with id ${id}:`, error);
        throw error;
    }
};

/**
 * Видалити деталі уроку
 * @param {number} id - ID деталей уроку
 * @returns {Promise<void>}
 */
export const deleteLessonDetails = async (id) => {
    try {
        await axios.delete(`${API_URL}/${id}`);
    } catch (error) {
        console.error(`Error deleting lesson details with id ${id}:`, error);
        throw error;
    }
};

/**
 * Додати користувача до списку з доступом
 * @param {number} lessonDetailsId - ID деталей уроку
 * @param {string} userId - ID користувача
 * @returns {Promise<void>}
 */
export const addUserAccess = async (lessonDetailsId, userId) => {
    try {
        await axios.post(`${API_URL}/${lessonDetailsId}/users/${userId}`);
    } catch (error) {
        console.error(`Error adding user access for user ${userId} to lesson details ${lessonDetailsId}:`, error);
        throw error;
    }
};

/**
 * Видалити користувача зі списку з доступом
 * @param {number} lessonDetailsId - ID деталей уроку
 * @param {string} userId - ID користувача
 * @returns {Promise<void>}
 */
export const removeUserAccess = async (lessonDetailsId, userId) => {
    try {
        await axios.delete(`${API_URL}/${lessonDetailsId}/users/${userId}`);
    } catch (error) {
        console.error(`Error removing user access for user ${userId} from lesson details ${lessonDetailsId}:`, error);
        throw error;
    }
};

/**
 * Отримати деталі уроку за ID уроку
 * @param {number} lessonId - ID уроку
 * @returns {Promise<Object|null>} Об'єкт деталей уроку або null, якщо не знайдено
 */
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
    getLessonDetailsByLessonId
};
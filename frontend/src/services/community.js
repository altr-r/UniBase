import api from "./api";

export const getComments = async (startupId) => {
  const response = await api.get(`/community/${startupId}/comments`);
  return response.data;
};

export const addComment = async (startupId, content) => {
  const response = await api.post(`/community/${startupId}/comments`, {
    content,
  });
  return response.data;
};

export const getRatings = async (startupId) => {
  const response = await api.get(`/community/${startupId}/rates`);
  return response.data;
};

// Note: Backend expects "score" (1-10)
export const addRating = async (startupId, score, feedback) => {
  const response = await api.post(`/community/${startupId}/rates`, {
    score,
    feedback,
  });
  return response.data;
};


export const getMyFavorites = async () => {
  const response = await api.get('/community/me/favorites');
  return response.data;
};

export const toggleFavorite = async (startupId) => {
  const response = await api.post(`/community/${startupId}/favorites`);
  return response.data;
};

export const getFavoriteCount = async (startupId) => {
  const response = await api.get(`/community/${startupId}/favorites`);
  return response.data.count; 
};
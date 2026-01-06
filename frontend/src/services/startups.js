import api from "./api";

// Get all startups (can accept query params like ?sector=AI)
export const getAllStartups = async (filters = {}) => {
  // Remove empty/blank filters so backend only receives meaningful params
  const cleanFilters = Object.fromEntries(
    Object.entries(filters || {}).filter(
      ([_, v]) => v !== null && v !== undefined && String(v).trim() !== ""
    )
  );

  const params = new URLSearchParams(cleanFilters).toString();
  const response = await api.get(`/startups${params ? `?${params}` : ""}`);
  return response.data;
};

// Get one startup by ID
export const getStartupById = async (id) => {
  const response = await api.get(`/startups/${id}`);
  return response.data;
};

// Create a new startup (Founders only)
export const createStartup = async (data) => {
  const response = await api.post("/startups", data);
  return response.data;
};

export const getMyStartups = async () => {
  const response = await api.get("/startups/me");
  return response.data;
};

// update startup
export const updateStartup = async (id, data) => {
  const response = await api.put(`/startups/${id}`, data);
  return response.data;
};

// deleting startup
export const deleteStartup = async (id) => {
  const response = await api.delete(`/startups/${id}`);
  return response.data;
};

// get all the existing sectors
export const getSectors = async () => {
  const response = await api.get("/startups/sectors");
  return response.data;
};

// get all the existing tags
export const getTags = async () => {
  const response = await api.get('/startups/tags');
  return response.data;
};
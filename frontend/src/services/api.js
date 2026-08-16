const API_URL = (import.meta.env.VITE_API_URL || "https://qr-feedback-bres.onrender.com/api").replace(/\/$/, "");
export const apiRequest = async (path, options = {}) => {
  const response = await fetch(`${API_URL}${path}`, options);
  const data = await response.json().catch(() => ({}));

  return { response, data };
};

export const submitFeedback = async (data) => {
  const { data: responseData } = await apiRequest("/feedback/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return responseData;
};

export const verifyAdmin = (token) => apiRequest("/admin/verify", {
  headers: { Authorization: `Bearer ${token}` },
});

export const loginAdmin = (credentials) => apiRequest("/admin/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(credentials),
});

export const fetchAdminFeedback = (token, { page = 1, limit = 10 } = {}) => {
  const url = new URL(`${API_URL}/feedback`, window.location.origin);
  url.searchParams.set("page", String(page));
  url.searchParams.set("limit", String(limit));

  return fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  }).then(async (response) => {
    const data = await response.json().catch(() => ({}));
    return { response, data };
  });
};

export const fetchAdminStats = (token) => apiRequest("/feedback/stats", {
  headers: { Authorization: `Bearer ${token}` },
});

export const deleteFeedback = (token, id) => apiRequest(`/feedback/${id}`, {
  method: "DELETE",
  headers: { Authorization: `Bearer ${token}` },
});

export const exportFeedbackCSV = (token) => apiRequest("/feedback/export", {
  headers: { Authorization: `Bearer ${token}` },
});

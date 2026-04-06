const BASE_URL = "https://backend-qlmf.onrender.com";

const handleResponse = async (response) => {
  if (response.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.href = "/";
    return;
  }
  return response.json();
};

export const apiGet = async (endpoint) => {
  const token = localStorage.getItem("token");

  console.log("API GET CALL:", endpoint);
  console.log("TOKEN USED:", token);  // 🔥 IMPORTANT

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return handleResponse(response);
};

export const apiRequest = async (url, method, data) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${BASE_URL}${url}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const result = await res.json();

  if (!res.ok) {
    console.error("API ERROR:", result);
    throw new Error(result.message || "Something went wrong");
  }

  return result;
};
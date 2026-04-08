const BASE_URL = import.meta.env.VITE_API_URL;
const handleResponse = async (response) => {
  // console.log("BASE URL:", BASE_URL);
  if (response.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.href = "/";
    return;
  }

  const text = await response.text();  // 🔥 read raw first

  try {
    return JSON.parse(text); // try parsing
  } catch (err) {
    console.error("NON-JSON RESPONSE:", text);
    throw new Error("Server error (non-JSON response)");
  }
};
export const apiGet = async (url) => {
  const token = localStorage.getItem("token");

  const fullUrl = BASE_URL + url;
  // console.log("GET:", fullUrl);

  const res = await fetch(fullUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  return handleResponse(res);
};

export const apiRequest = async (url, method, body) => {
  const token = localStorage.getItem("token");

  const fullUrl = BASE_URL + url;
  // console.log("REQUEST:", fullUrl);

  const res = await fetch(fullUrl, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  return handleResponse(res);
};
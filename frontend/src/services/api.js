const BASE_URL = "https://backend-qlmf.onrender.com";

const handleResponse = async (response) => {
  console.log("BASE URL:", BASE_URL);
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
  console.log("SENDING TOKEN:", token);
  const res = await fetch(BASE_URL + url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
console.log("FULL URL:", BASE_URL + url);
  return res.json();
};
export const apiRequest = async (url, method, body) => {
  const token = localStorage.getItem("token");

  const res = await fetch(BASE_URL + url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  return res.json();
};
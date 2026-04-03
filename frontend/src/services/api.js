const BASE_URL = "http://localhost:5000/api"

const handleResponse = async(response)=>{
  if(response.status === 401){
    localStorage.removeItem("token")
    localStorage.removeItem("role")

    window.location.href = "/"

    return;
  }
  return response.json()
}
//generic GET
export const apiGet = async (endpoint)=>{
  const token = localStorage.getItem("token")
  const response = await fetch(`${BASE_URL}${endpoint}`,{
    headers:{
      Authorization:`Bearer ${token}`
    }
  })
  return handleResponse(response)
}

//generic POST / PUT / PATCH

export const apiRequest = async (url, method, data) => {

  const token = localStorage.getItem("token"); // 🔥 GET TOKEN

  const res = await fetch(`http://localhost:5000/api${url}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`   // 🔥 IMPORTANT
    },
    body: JSON.stringify(data)
  });

  const result = await res.json();

  if (!res.ok) {
    console.error("API ERROR:", result);
    throw new Error(result.message || "Something went wrong");
  }

  return result;
};
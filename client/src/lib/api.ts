import { API_BASE } from "@/lib/queryClient";

export async function signupUser(email: string, mobile: string) {
  const res = await fetch(`${API_BASE}/api/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      mobile,
    }),
  });

  if (!res.ok) {
    throw new Error("Signup failed");
  }

  return res.json();
}

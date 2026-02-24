"use server";

import { supabase } from "@/lib/supabase";

export async function submitComplaint(word: string, type: string) {
  try {
    const { data, error } = await supabase
      .from("word_complaints")
      .insert([{ word, status: "PENDING", type }]);

    if (error) {
      console.error("Supabase insert error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err: unknown) {
    console.error("Failed to submit complaint:", err);
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function fetchAllComplaints() {
  try {
    const { data, error } = await supabase
      .from("word_complaints")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (err: unknown) {
    console.error("Failed to fetch complaints:", err);
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function updateComplaintStatus(id: number, status: string, word?: string, type?: string) {
  try {
    const { data, error } = await supabase
      .from("word_complaints")
      .update({ status })
      .eq("id", id);

    if (error) throw error;

    // If the complaint is accepted:
    if (status === "ACCEPTED" && word) {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

      if (type === "rejected") {
        // ...and it was originally a rejected word, add it to the backend dictionary
        try {
          const response = await fetch(`${apiUrl}/dictionary/add`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ word }),
          });
          
          if (!response.ok) {
            console.error("Failed to add word to backend dictionary:", await response.text());
          }
        } catch (backendErr) {
          console.error("Error calling backend dictionary endpoint:", backendErr);
        }
      } else if (type === "accepted") {
        // ...and it was originally an accepted word (mistakenly accepted), remove it from the backend dictionary
        try {
          const response = await fetch(`${apiUrl}/dictionary/remove`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ word }),
          });
          
          if (!response.ok) {
            console.error("Failed to remove word from backend dictionary:", await response.text());
          }
        } catch (backendErr) {
          console.error("Error calling backend dictionary endpoint:", backendErr);
        }
      }
    }

    return { success: true, data };
  } catch (err: unknown) {
    console.error("Failed to update complaint:", err);
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}


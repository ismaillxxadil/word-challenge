import React from "react";
import { checkAdminAuth } from "../../actions/auth";
import { fetchAllComplaints } from "../../actions/complaint";
import { redirect } from "next/navigation";
import AdminLogsClient from "./AdminLogsClient";

export default async function AdminLogsPage() {
  const isAuthed = await checkAdminAuth();
  if (!isAuthed) {
    redirect("/admin");
  }

  const res = await fetchAllComplaints();
  const complaints = res.success && res.data ? res.data : [];

  return <AdminLogsClient initialComplaints={complaints} />;
}

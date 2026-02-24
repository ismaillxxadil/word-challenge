"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, RefreshCcw, Search, Filter, MessageSquareWarning, ChevronDown, CheckCircle2, History, X } from "lucide-react";
import { logoutAdmin } from "../../actions/auth";
import { fetchAllComplaints, updateComplaintStatus } from "../../actions/complaint";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { toast } from "sonner";

interface Complaint {
  id: number;
  word: string;
  status: string;
  type?: string;
  created_at: string;
}

interface AdminLogsClientProps {
  initialComplaints: Complaint[];
}

export default function AdminLogsClient({ initialComplaints }: AdminLogsClientProps) {
  const [complaints, setComplaints] = useState<Complaint[]>(initialComplaints);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    await logoutAdmin();
    router.push("/admin");
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetchAllComplaints();
      if (res.success && res.data) {
        setComplaints(res.data);
        toast.success("تم تحديث البيانات");
      }
    } catch {
      toast.error("فشل في تحديث البيانات");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleStatusChange = async (id: number, newStatus: string, word: string, type?: string) => {
    // Optimistic update
    const previous = [...complaints];
    setComplaints(complaints.map(c => c.id === id ? { ...c, status: newStatus } : c));
    
    const res = await updateComplaintStatus(id, newStatus, word, type);
    
    if (res.success) {
      toast.success("تم تحديث حالة الشكوى");
    } else {
      toast.error("فشل تحديث الحالة");
      // Revert optimistic update
      setComplaints(previous);
    }
  };

  const filteredLogs = complaints.filter(log => {
    const matchesSearch = log.word.includes(searchQuery);
    const matchesFilter = filterStatus === "ALL" || log.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-sans selection:bg-indigo-500/30 selection:text-indigo-200" dir="rtl">
      {/* Background elegant gradient mesh */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[25%] -right-[10%] w-[70vw] h-[70vw] rounded-full bg-indigo-900/10 blur-[120px]" />
        <div className="absolute top-[60%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-slate-800/20 blur-[100px]" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-20 mix-blend-overlay" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto p-4 sm:p-8">
        {/* Header */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-12 bg-slate-900/50 p-6 rounded-3xl border border-slate-700/50 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20 border border-indigo-400/20">
              <History className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">سجلات الشكاوى</h1>
              <p className="text-slate-400 text-sm mt-1">إدارة الكلمات المرفوضة والمبلغ عنها</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button 
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-all active:scale-95 disabled:opacity-50"
            >
              <RefreshCcw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline font-bold text-sm">تحديث</span>
            </button>
            <button 
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white rounded-xl border border-rose-500/20 transition-all active:scale-95 flex-1 sm:flex-initial"
            >
              <LogOut className="w-4 h-4" />
              <span className="font-bold text-sm">تسجيل الخروج</span>
            </button>
          </div>
        </header>

        {/* Filters Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1 group">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
            <input 
              type="text"
              placeholder="ابحث عن كلمة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-700/50 text-white rounded-2xl py-3.5 pr-12 pl-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 backdrop-blur-sm transition-all"
            />
          </div>

          <div className="relative group min-w-[200px]">
            <Filter className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors pointer-events-none" />
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-700/50 text-white rounded-2xl py-3.5 pr-12 pl-10 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 backdrop-blur-sm transition-all appearance-none font-bold"
            >
              <option value="ALL">جميع الحالات</option>
              <option value="PENDING">معلقة (PENDING)</option>
              <option value="ACCEPTED">مقبولة (ACCEPTED)</option>
              <option value="REJECTED">مرفوضة (REJECTED)</option>
            </select>
            <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-slate-950/50 border-b border-slate-800 text-slate-400 text-sm">
                  <th className="px-6 py-5 font-bold">الكلمة</th>
                  <th className="px-6 py-5 font-bold">النوع (السبب)</th>
                  <th className="px-6 py-5 font-bold">تاريخ الشكوى</th>
                  <th className="px-6 py-5 font-bold">الحالة الحالية</th>
                  <th className="px-6 py-5 font-bold text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={4}>
                        <div className="flex flex-col items-center justify-center py-24 text-slate-500">
                          <MessageSquareWarning className="w-16 h-16 mb-4 opacity-20" />
                          <p className="text-lg font-bold text-slate-400">لا توجد شكاوى لعرضها</p>
                          <p className="text-sm mt-1">جرب تغيير عوامل التصفية أو البحث</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log, idx) => (
                      <motion.tr 
                        key={log.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: idx * 0.05 }}
                        className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors group"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-xl font-black text-white bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700/50">{log.word}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {log.type === "accepted" ? (
                            <span className="inline-flex items-center gap-1.5 text-xs text-amber-400 bg-amber-500/10 px-2 py-1 rounded-md">
                              مقبولة بالخطأ
                            </span>
                          ) : log.type === "rejected" ? (
                            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md">
                              مرفوضة بالخطأ
                            </span>
                          ) : log.type === "locked" ? (
                             <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 bg-slate-500/10 px-2 py-1 rounded-md">
                              كلمة قفل
                            </span>
                          ) : (
                            <span className="text-xs text-slate-500">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-slate-400 text-sm font-medium">
                          {format(new Date(log.created_at), "dd MMMM yyyy, hh:mm a", { locale: ar })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border ${
                            log.status === 'PENDING' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                            log.status === 'ACCEPTED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                            'bg-rose-500/10 text-rose-500 border-rose-500/20'
                          }`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${
                              log.status === 'PENDING' ? 'bg-amber-500 animate-pulse' :
                              log.status === 'ACCEPTED' ? 'bg-emerald-500' :
                              'bg-rose-500'
                            }`} />
                            {log.status === 'PENDING' ? 'قيد المراجعة' : log.status === 'ACCEPTED' ? 'تم القبول' : 'مرفوضة'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                            {log.status !== 'ACCEPTED' && (
                              <button
                                onClick={() => handleStatusChange(log.id, 'ACCEPTED', log.word, log.type)}
                                title="تحديد كمقبولة"
                                className="w-9 h-9 flex items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 transition-all hover:scale-110 active:scale-95"
                              >
                                <CheckCircle2 className="w-5 h-5" />
                              </button>
                            )}
                            {log.status !== 'REJECTED' && (
                              <button
                                onClick={() => handleStatusChange(log.id, 'REJECTED', log.word, log.type)}
                                title="تحديد كمرفوضة"
                                className="w-9 h-9 flex items-center justify-center rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white border border-rose-500/20 transition-all hover:scale-110 active:scale-95"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            )}
                            {log.status !== 'PENDING' && (
                              <button
                                onClick={() => handleStatusChange(log.id, 'PENDING', log.word, log.type)}
                                title="إعادة للمعلقة"
                                className="w-9 h-9 flex items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white border border-amber-500/20 transition-all hover:scale-110 active:scale-95"
                              >
                                <RefreshCcw className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
          
          <div className="bg-slate-950/50 border-t border-slate-800 p-4 text-center text-xs text-slate-500 font-medium">
            إجمالي السجلات: {filteredLogs.length}
          </div>
        </div>

      </div>
    </div>
  );
}

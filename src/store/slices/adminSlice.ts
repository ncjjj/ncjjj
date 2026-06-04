import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

// ─── Shared domain types ──────────────────────────────────────────────────────

export interface ConsultationRequest {
  id: string;
  serviceName: string;
  fullName: string;
  email: string;
  phone: string;
  firmName: string | null;
  address: string;
  note: string | null;
  status: "pending" | "seen" | "contacted";
  createdAt: string;
}

export interface AdminProfileRow {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  firmName: string | null;
  createdAt: string;
  userId?: string | null;
  serviceAccess?: string | null;
}

export interface DueTaskItem {
  id: string;
  type: "document" | "consultation";
  userId?: string | null;
  userName: string;
  userEmail: string;
  userPhone: string;
  serviceName: string;
  documentType?: string;
  documentYear?: number;
  financialYear?: string;
  fileName?: string;
  fileUrl?: string;
  note?: string;
  createdAt: string;
  status: string;
}

export interface DashboardStats {
  totalRegisteredUsers: number;
  totalGstUsers: number;
  totalTdsUsers: number;
  totalIncomeTaxUsers: number;
  currentFinancialYear: string;
  incomeTaxPendency: {
    due: number;
    wip: number;
    complete: number;
  };
  totalDueTasks: number;
  totalWipTasks: number;
  totalCompleteTasks: number;
  dueTasksList: DueTaskItem[];
  wipTasksList: DueTaskItem[];
  completeTasksList: DueTaskItem[];
}

// ─── Slice state ──────────────────────────────────────────────────────────────

interface AdminState {
  adminProfile: { username: string; email: string } | null;
  consultationRequests: ConsultationRequest[];
  profiles: AdminProfileRow[];
  stats: DashboardStats | null;
  socketStatus: "connected" | "disconnected";
  activeTab: string;
  loading: boolean;
  loadingStats: boolean;
}

const initialState: AdminState = {
  adminProfile: null,
  consultationRequests: [],
  profiles: [],
  stats: null,
  socketStatus: "disconnected",
  activeTab: "overview",
  loading: true,
  loadingStats: true,
};

// ─── Slice ────────────────────────────────────────────────────────────────────

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    setAdminProfile(
      state,
      action: PayloadAction<{ username: string; email: string } | null>
    ) {
      state.adminProfile = action.payload;
    },
    setConsultationRequests(state, action: PayloadAction<ConsultationRequest[]>) {
      state.consultationRequests = action.payload;
    },
    updateConsultationRequest(state, action: PayloadAction<ConsultationRequest>) {
      const index = state.consultationRequests.findIndex(
        (r) => r.id === action.payload.id
      );
      if (index !== -1) {
        state.consultationRequests[index] = action.payload;
      }
    },
    setProfiles(state, action: PayloadAction<AdminProfileRow[]>) {
      state.profiles = action.payload;
    },
    updateProfile(state, action: PayloadAction<AdminProfileRow>) {
      const index = state.profiles.findIndex((p) => p.id === action.payload.id);
      if (index !== -1) {
        state.profiles[index] = action.payload;
      }
    },
    setStats(state, action: PayloadAction<DashboardStats | null>) {
      state.stats = action.payload;
    },
    setSocketStatus(
      state,
      action: PayloadAction<"connected" | "disconnected">
    ) {
      state.socketStatus = action.payload;
    },
    setActiveTab(state, action: PayloadAction<string>) {
      state.activeTab = action.payload;
    },
    setAdminLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setAdminLoadingStats(state, action: PayloadAction<boolean>) {
      state.loadingStats = action.payload;
    },
    updateTaskStatus(
      state,
      action: PayloadAction<{
        taskId: string;
        type: "document" | "consultation";
        newStatus: string;
      }>
    ) {
      if (!state.stats) return;
      const { taskId, type, newStatus } = action.payload;

      let foundTask: DueTaskItem | undefined;
      let currentListKey: "dueTasksList" | "wipTasksList" | "completeTasksList" | undefined;

      const lists: Array<"dueTasksList" | "wipTasksList" | "completeTasksList"> = [
        "dueTasksList",
        "wipTasksList",
        "completeTasksList",
      ];

      for (const listKey of lists) {
        const item = state.stats[listKey].find((t) => t.id === taskId && t.type === type);
        if (item) {
          foundTask = item;
          currentListKey = listKey;
          break;
        }
      }

      if (!foundTask || !currentListKey) return;

      // Remove from current list
      state.stats[currentListKey] = state.stats[currentListKey].filter(
        (t) => !(t.id === taskId && t.type === type)
      );

      // Update task status
      foundTask.status = newStatus;

      // Determine target list key
      let targetListKey: "dueTasksList" | "wipTasksList" | "completeTasksList";
      if (
        (type === "document" && newStatus === "uploaded") ||
        (type === "consultation" && newStatus === "pending")
      ) {
        targetListKey = "dueTasksList";
      } else if (
        (type === "document" && newStatus === "verified") ||
        (type === "consultation" && newStatus === "seen")
      ) {
        targetListKey = "wipTasksList";
      } else {
        targetListKey = "completeTasksList";
      }

      // Add to target list and sort desc
      state.stats[targetListKey].push(foundTask);
      state.stats[targetListKey].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      // Recalculate totals
      state.stats.totalDueTasks = state.stats.dueTasksList.length;
      state.stats.totalWipTasks = state.stats.wipTasksList.length;
      state.stats.totalCompleteTasks = state.stats.completeTasksList.length;
      state.stats.incomeTaxPendency = {
        due: state.stats.dueTasksList.length,
        wip: state.stats.wipTasksList.length,
        complete: state.stats.completeTasksList.length,
      };
    },
  },
});

export const {
  setAdminProfile,
  setConsultationRequests,
  updateConsultationRequest,
  setProfiles,
  updateProfile,
  setStats,
  setSocketStatus,
  setActiveTab,
  setAdminLoading,
  setAdminLoadingStats,
  updateTaskStatus,
} = adminSlice.actions;

export default adminSlice.reducer;

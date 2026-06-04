import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UserDocumentItem {
  id: string;
  name: string;
  type: string;
  url: string | null;
  status: "Uploaded";
}

export interface YearlyDocumentItem {
  id: string;
  documentYear: number;
  documentSlot: string;
  fileName: string;
  filePath: string;
  signedUrl: string | null;
  mimeType: string | null;
  createdAt: string;
}

export interface PermanentDocumentNumbers {
  aadharNumber: string;
  panNumber: string;
  accountNumber: string;
  gstNumber: string;
}

export interface PermanentDocumentItem {
  id: string;
  documentType: string;
  documentLabel: string;
  documentDescription: string;
  fileName: string;
  fileUrl: string;
  storagePath: string;
  signedUrl: string | null;
  documentSignedUrl?: string | null;
  mimeType: string | null;
  aadharNumber: string | null;
  panNumber: string | null;
  accountNumber: string | null;
  gstNumber: string | null;
  uploadDescription: string | null;
  createdAt: string;
}

// ─── Slice state ──────────────────────────────────────────────────────────────

const emptyNumbers: PermanentDocumentNumbers = {
  aadharNumber: "",
  panNumber: "",
  accountNumber: "",
  gstNumber: "",
};

interface UserState {
  profileImageUrl: string;
  documents: UserDocumentItem[];
  documentsLoading: boolean;
  yearlyDocuments: YearlyDocumentItem[];
  yearlyDocumentsLoading: boolean;
  permanentDocuments: PermanentDocumentItem[];
  permanentDocumentNumbers: PermanentDocumentNumbers;
  permanentDocumentsLoading: boolean;
}

const initialState: UserState = {
  profileImageUrl: "/images/default-avatar.png",
  documents: [],
  documentsLoading: false,
  yearlyDocuments: [],
  yearlyDocumentsLoading: false,
  permanentDocuments: [],
  permanentDocumentNumbers: emptyNumbers,
  permanentDocumentsLoading: false,
};

// ─── Slice ────────────────────────────────────────────────────────────────────

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setProfileImageUrl(state, action: PayloadAction<string>) {
      state.profileImageUrl = action.payload;
    },
    setDocuments(state, action: PayloadAction<UserDocumentItem[]>) {
      state.documents = action.payload;
    },
    setDocumentsLoading(state, action: PayloadAction<boolean>) {
      state.documentsLoading = action.payload;
    },
    setYearlyDocuments(state, action: PayloadAction<YearlyDocumentItem[]>) {
      state.yearlyDocuments = action.payload;
    },
    setYearlyDocumentsLoading(state, action: PayloadAction<boolean>) {
      state.yearlyDocumentsLoading = action.payload;
    },
    setPermanentDocuments(state, action: PayloadAction<PermanentDocumentItem[]>) {
      state.permanentDocuments = action.payload;
    },
    setPermanentDocumentNumbers(
      state,
      action: PayloadAction<PermanentDocumentNumbers>
    ) {
      state.permanentDocumentNumbers = action.payload;
    },
    setPermanentDocumentsLoading(state, action: PayloadAction<boolean>) {
      state.permanentDocumentsLoading = action.payload;
    },
    resetUserState() {
      return initialState;
    },
  },
});

export const {
  setProfileImageUrl,
  setDocuments,
  setDocumentsLoading,
  setYearlyDocuments,
  setYearlyDocumentsLoading,
  setPermanentDocuments,
  setPermanentDocumentNumbers,
  setPermanentDocumentsLoading,
  resetUserState,
} = userSlice.actions;

export default userSlice.reducer;

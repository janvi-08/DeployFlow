import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, Organisation } from '../types';

interface AuthState {
  user: User | null;
  activeOrgId: string | null;
  organisations: Organisation[];
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  activeOrgId: localStorage.getItem('deployflow_active_org_id'),
  organisations: [],
  isAuthenticated: false,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; organisations?: Organisation[] }>
    ) => {
      state.user = action.payload.user;
      state.isAuthenticated = true;
      if (action.payload.organisations && action.payload.organisations.length > 0) {
        state.organisations = action.payload.organisations;
        const isValid = action.payload.organisations.some((o) => o.id === state.activeOrgId);
        if (!isValid) {
          state.activeOrgId = action.payload.organisations[0].id;
          localStorage.setItem('deployflow_active_org_id', action.payload.organisations[0].id);
        }
      }
    },
    setActiveOrgId: (state, action: PayloadAction<string>) => {
      state.activeOrgId = action.payload;
      localStorage.setItem('deployflow_active_org_id', action.payload);
    },
    setOrganisations: (state, action: PayloadAction<Organisation[]>) => {
      state.organisations = action.payload;
      const isValid = action.payload.some((o) => o.id === state.activeOrgId);
      if ((!state.activeOrgId || !isValid) && action.payload.length > 0) {
        state.activeOrgId = action.payload[0].id;
        localStorage.setItem('deployflow_active_org_id', action.payload[0].id);
      }
    },
    clearAuth: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.organisations = [];
      state.activeOrgId = null;
      localStorage.removeItem('deployflow_active_org_id');
    },
  },
});

export const { setCredentials, setActiveOrgId, setOrganisations, clearAuth } = authSlice.actions;
export default authSlice.reducer;

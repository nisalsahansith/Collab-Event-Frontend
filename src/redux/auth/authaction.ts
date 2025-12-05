import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

// Types
export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthPayload {
  token: string;
  user: User;
}

export interface SignupData {
  name: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

// Signup
export const signupUser = createAsyncThunk<AuthPayload, SignupData>(
  "auth/signup",
  async (data, thunkAPI) => {
    try {
      const response = await api.post("/auth/signup", data);
      return response.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Signup failed");
    }
  }
);

// Login
export const loginUser = createAsyncThunk<AuthPayload, LoginData>(
  "auth/login",
  async (data, thunkAPI) => {
    try {
      const response = await api.post("/auth/login", data);
      return response.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Login failed");
    }
  }
);

// Load logged user from token
export const loadUser = createAsyncThunk<User>(
  "auth/load-user",
  async (_, thunkAPI) => {
    try {
      const response = await api.get("/auth/me");
      return response.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue("Failed to load user");
    }
  }
);

// Logout
export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, thunkAPI) => {
    try {
      const response = await api.post("/auth/logout");
      return response.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue("Logout failed");
    }
  }
);

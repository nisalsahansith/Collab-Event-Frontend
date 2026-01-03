import { createAsyncThunk, type AsyncThunkAction, type Dispatch } from "@reduxjs/toolkit";
import api from "../../services/api";
import axios from "axios";

export interface Post {
  _id: string;
  description: string;
  owner: string;
  imageURL: string;
  tags: string[];
  createdAt: string;
}

export const fetchPosts = createAsyncThunk(
  "posts/fetchPosts",
  async (_, thunkAPI) => {
    try {
      const res = await api.get("/post"); 
      
      return res.data.data; 
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);


// Define the payload type
interface CreateEventPayload {
  description: string;
  image?: File;
  tags?: string[];
}

// Async thunk
export const createEvent = createAsyncThunk<Event, CreateEventPayload>(
  "event/create",
  async (data, thunkAPI) => {
    try {
      const formData = new FormData();
      formData.append("description", data.description);
      if (data.image) formData.append("image", data.image);
      if (data.tags) data.tags.forEach((tag) => formData.append("tags", tag));

      const response = await api.post("/post/create", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return response.data as Event;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to create event"
      );
    }
  }
);

// Dispatch example
// const handleSubmit = () => {
//   const payload: CreateEventPayload = {
//     description,
//     image: imageFile,
//     tags,
//   };

//   dispatch(createEvent(payload));
// };


// Sponsor an event
export const sponsorEvent = createAsyncThunk<Event, string>(
  "event/sponsor",
  async (eventId, thunkAPI) => {
    try {
      const response = await api.post(`/events/${eventId}/sponsor`);
      return response.data as Event;
    } catch (err: any) {
      return thunkAPI.rejectWithValue("Failed to sponsor event");
    }
  }
);
function dispatch(arg0: AsyncThunkAction<Event, CreateEventPayload, { state?: unknown; dispatch?: Dispatch; extra?: unknown; rejectValue?: unknown; serializedErrorType?: unknown; pendingMeta?: unknown; fulfilledMeta?: unknown; rejectedMeta?: unknown; }>) {
  throw new Error("Function not implemented.");
}


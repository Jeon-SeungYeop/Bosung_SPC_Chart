import { createSlice } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";

const storedUser = localStorage.getItem("user");

const defaultUser = {
  id: uuidv4(),
  name: "autovation",
  role: "visitor",
};


export const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: storedUser || null,
    isAuth: !!storedUser,
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuth = true;
      localStorage.setItem("user", action.payload);
    },
    logOut: (state, action) => {
      state.user = null;
      state.isAuth = false;
      localStorage.removeItem("user");
      localStorage.removeItem("menuitems");
    },
  },
});

export const { setUser, logOut } = authSlice.actions;
export default authSlice.reducer;

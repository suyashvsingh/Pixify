import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { signInWithPopup, signOut, getAdditionalUserInfo } from "firebase/auth";
import { auth, provider, db, storage } from "../../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  collection,
  addDoc,
  getDocs,
  setDoc,
  getDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { v4 } from "uuid";

const userName = localStorage.getItem("userName");
const userId = localStorage.getItem("userId");

const initialState = {
  isLoggedIn: userId ? true : false,
  userName: userName ? userName : null,
  userId: userId ? userId : null,
  displayData: [],
  currentPost: {
    imageUrl: null,
    title: null,
    userId: null,
    likedBy: null,
    likedByLoggedInUser: false,
  },
  isError: false,
  message: "",
};

export const onLogin = createAsyncThunk("pixify/onLogin", async (thunkAPI) => {
  try {
    const response = await signInWithPopup(auth, provider);
    if (getAdditionalUserInfo(response).isNewUser) {
      const docRef = await doc(db, "users", auth.currentUser.uid);
      await setDoc(docRef, {
        userName: auth.currentUser.displayName,
        likedPosts: [],
        postedPosts: [],
      });
    }
  } catch (error) {
    return thunkAPI.rejectWithValue(error.message);
  }
});

export const onLogout = createAsyncThunk(
  "pixify/onLogout",
  async (thunkAPI) => {
    try {
      await signOut(auth, provider);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const fetchData = createAsyncThunk(
  "pixify/fetchData",
  async (thunkAPI) => {
    try {
      const querySnapshot = await getDocs(collection(db, "posts"));
      let data = [];
      querySnapshot.docs.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
      });
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const onPost = createAsyncThunk(
  "pixify/onPost",
  async ({ file, title, userName, userId }, thunkAPI) => {
    if (file === null) {
      return thunkAPI.rejectWithValue("Select an image");
    }

    if (!title) {
      return thunkAPI.rejectWithValue("Add a title");
    }

    if (file["type"].split("/")[0] !== "image") {
      return thunkAPI.rejectWithValue("Selected file is not an image");
    }

    try {
      const storageRef = ref(storage, `images/${file.name + v4()}`);

      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);

      await addDoc(collection(db, "posts"), {
        userId: userId,
        imageUrl: url,
        title: title,
        likedBy: [],
      });
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const getIndiPost = createAsyncThunk(
  "pixify/getIndiPost",
  async (id, thunkAPI) => {
    const docRef = doc(db, "posts", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      return thunkAPI.rejectWithValue("No post with this id");
    }
  }
);

export const onLike = createAsyncThunk(
  "pixify/onLike",
  async ({ id, userId }, thunkAPI) => {
    try {
      let docRef = doc(db, "posts", id);
      let docSnap = await getDoc(docRef);
      if (!docSnap.data().likedBy.includes(userId)) {
        await updateDoc(docRef, {
          likedBy: [...docSnap.data().likedBy, userId],
        });
        docRef = doc(db, "users", userId);
        docSnap = await getDoc(docRef);
        await updateDoc(docRef, {
          likedPosts: [...docSnap.data().likedPosts, id],
        });
      }
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const onUnlike = createAsyncThunk(
  "pixify/onUnlike",
  async ({ id, userId }, thunkAPI) => {
    try {
      let docRef = doc(db, "posts", id);
      let docSnap = await getDoc(docRef);
      const updatedLikedBy = await docSnap
        .data()
        .likedBy.filter((indiUserId) => indiUserId !== userId);
      await updateDoc(docRef, {
        likedBy: updatedLikedBy,
      });
      docRef = doc(db, "users", userId);
      docSnap = await getDoc(docRef);
      const updatedLikedPosts = await docSnap
        .data()
        .likedPosts.filter((indiLikedPosts) => indiLikedPosts !== id);
      await updateDoc(docRef, {
        likedPosts: updatedLikedPosts,
      });
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

const pixifySlice = createSlice({
  name: "pixifySlice",
  initialState,
  reducers: {
    resetCurrPost: (state) => {
      state.currentPost.imageUrl = null;
      state.currentPost.title = null;
      state.currentPost.userId = null;
      state.currentPost.likedBy = null;
      state.currentPost.likedByLoggedInUser = false;
    },
  },
  extraReducers: {
    [onLogin.fulfilled]: (state) => {
      state.isLoggedIn = true;
      localStorage.setItem("userId", auth.currentUser.uid);
      localStorage.setItem(
        "userName",
        auth.currentUser.displayName.split(" ")[0]
      );
      state.userId = auth.currentUser.uid;
      state.userName = auth.currentUser.displayName.split(" ")[0];
      state.isError = false;
      state.message = `Welcome ${state.userName}`;
    },
    [onLogin.rejected]: (state, { payload }) => {
      state.isError = true;
      state.message = payload;
    },

    [onLogout.fulfilled]: (state, action) => {
      state.isLoggedIn = false;
      state.userName = null;
      state.userId = null;
      state.displayData = [];
      state.message = "Logged out";
      localStorage.removeItem("userName");
      localStorage.removeItem("userId");
      state.isError = false;
    },
    [onLogout.rejected]: (state, { payload }) => {
      state.isError = true;
      state.message = payload;
    },

    [fetchData.fulfilled]: (state, { payload }) => {
      state.displayData = payload;
      state.message = "";
      state.isError = false;
    },
    [fetchData.rejected]: (state, { payload }) => {
      state.isError = true;
      state.message = payload;
    },

    [onPost.fulfilled]: (state) => {
      state.isError = false;
      state.message = "Post successfull";
    },
    [onPost.rejected]: (state, { payload }) => {
      state.isError = true;
      state.message = payload;
    },

    [getIndiPost.fulfilled]: (state, { payload }) => {
      const { userId } = payload;
      payload.likedBy.includes(userId)
        ? (state.currentPost.likedByLoggedInUser = true)
        : (state.currentPost.likedByLoggedInUser = false);

      state.isError = false;
      state.currentPost.imageUrl = payload.imageUrl;
      state.currentPost.title = payload.title;
      state.currentPost.userId = payload.userId;
      state.currentPost.likedBy = payload.likedBy;
    },
    [getIndiPost.rejected]: (state, { payload }) => {
      state.message = payload;
      state.isError = true;
    },

    [onLike.fulfilled]: (state) => {
      state.isError = false;
    },

    [onUnlike.fulfilled]: (state) => {
      state.isError = false;
    },
  },
});

export const { resetCurrPost } = pixifySlice.actions;

export default pixifySlice.reducer;

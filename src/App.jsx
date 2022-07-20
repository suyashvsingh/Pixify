import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";
import Login from "./pages/Login";
import CreatePost from "./pages/CreatePost";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import IndiPost from "./pages/IndiPost";
import LikedPosts from "./pages/LikedPosts";
import MyPosts from "./pages/MyPosts";

const App = () => {
  const { isLoggedIn, isError, message } = useSelector((store) => store.pixify);

  useEffect(() => {
    if (isError) {
      toast.error(message, {
        duration: 2000,
      });
    } else if (message) {
      toast.success(message, {
        duration: 2000,
      });
    }
  }, [isError, message]);

  return (
    <div className="bg-gradient-to-br min-h-screen from-blue-900 via-sky-900 to-blue-900 bg-no-repeat">
      {isLoggedIn && <Header />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Home />} />
        <Route path="/createpost" element={<CreatePost />} />
        <Route path="/post/:id" element={<IndiPost />} />
        <Route path="/likedposts" element={<LikedPosts />} />
        <Route path="/myposts" element={<MyPosts />} />
      </Routes>
    </div>
  );
};

export default App;

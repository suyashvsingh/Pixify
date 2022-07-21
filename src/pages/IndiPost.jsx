import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  getIndiPost,
  onUnlike,
  onLike,
  resetCurrPost,
  getUserNameFromUserId,
} from "../features/pixify/pixifySlice";
import ClipLoader from "react-spinners/ClipLoader";
import { FaHeart } from "react-icons/fa";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

const IndiPost = () => {
  const [loading, setLoading] = useState(true);
  // const [userName, setUserName] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentPost, isLoggedIn, userId } = useSelector(
    (store) => store.pixify
  );
  const { userName } = currentPost;
  const { id } = useParams();

  // const getUserNameFromUserId = async (userId) => {
  //   const docRef = await doc(db, "users", userId);
  //   const docSnap = await getDoc(docRef);
  //   setUserName(await docSnap.data().userName.split(" ")[0]);
  // };

  const fetchIndiPost = async () => {
    let response = await dispatch(getIndiPost(id));
    if (response.error) {
      navigate("/");
    }
    response = await dispatch(
      getUserNameFromUserId({ userId: response.payload.userId })
    );
    if (response.error) {
      navigate("/");
    }
    setLoading(false);
  };

  const handleOnClickLike = async () => {
    await dispatch(onLike({ id, userId }));
    fetchIndiPost({ userId });
  };

  const handleOnClickUnlike = async () => {
    await dispatch(onUnlike({ id, userId }));
    fetchIndiPost({ userId });
  };

  useEffect(() => {
    setLoading(true);
    fetchIndiPost();
    return () => {
      dispatch(resetCurrPost());
    };
  }, [isLoggedIn, dispatch, id]);

  if (loading) {
    return (
      <section className="w-full">
        <div className="p-8">
          <div className="max-w-[400px] m-auto">
            <div className="w-full flex items-center justify-center">
              <ClipLoader loading={loading} size={50} color="white" />
            </div>
          </div>
        </div>
      </section>
    );
  } else {
    return (
      <section className="w-full">
        <div className="p-8">
          <div className="max-w-[400px] m-auto">
            <div className="flex flex-col w-full">
              <div className="m-auto w-full">
                <img
                  src={currentPost.imageUrl}
                  alt={currentPost.title}
                  className="w-full rounded-2xl shadow-2xl"
                />
              </div>
              <div className="m-auto w-full mt-8 flex flex-col justify-between">
                <div className="flex items-center justify-between w-full">
                  <div className="font-bold text-2xl">{currentPost.title}</div>
                  <div className="flex items-center justify-center">
                    <div className="fa-icon-heart-div hover:scale-105 duration-300 cursor-pointer">
                      {currentPost.likedByLoggedInUser ? (
                        <FaHeart
                          className="fa-icon-heart"
                          color="red"
                          onClick={(id) => handleOnClickUnlike(id)}
                        />
                      ) : (
                        <FaHeart
                          className="fa-icon-heart"
                          onClick={(id) => handleOnClickLike(id)}
                        />
                      )}
                    </div>
                    <div className="ml-2 w-2">{currentPost.likedBy.length}</div>
                  </div>
                </div>
                {userName}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }
};

export default IndiPost;

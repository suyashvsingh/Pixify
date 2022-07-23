import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getUserNameFromUserId } from "../features/pixify/pixifySlice";

const Card = ({ userId, imageUrl, title, id }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userName } = useSelector((store) => store.pixify).currentPost;

  useEffect(() => {
    dispatch(getUserNameFromUserId({ userId }));
  }, [dispatch]);

  return (
    <div>
      <div
        className="max-w-[200px] hover:scale-105 duration-300 cursor-pointer"
        onClick={() => navigate(`/post/${id}`)}
      >
        <img
          src={imageUrl}
          alt="photos"
          className="rounded-xl shadow-xs shadow-black"
        />
      </div>
      <div className="flex flex-col mt-3">
        <p className="font-bold text-sm">{title}</p>
        <p className="text-sm">{userName}</p>
      </div>
    </div>
  );
};

export default Card;

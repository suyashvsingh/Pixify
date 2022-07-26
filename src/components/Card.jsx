import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { getUserNameFromUserId } from "../features/pixify/pixifySlice";

const Card = ({ postUserId, imageUrl, title, id }) => {
  const [userName, setUserName] = useState();
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    const response = await dispatch(
      getUserNameFromUserId({ userId: postUserId })
    );
    setUserName(response.payload);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return <></>;
  }

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

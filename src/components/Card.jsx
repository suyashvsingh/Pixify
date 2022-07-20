import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { getDoc, doc } from "firebase/firestore";

const Card = ({ userId, imageUrl, title, id }) => {
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  const getUserNameFromUserId = async () => {
    const docRef = await doc(db, "users", userId);
    const docSnap = await getDoc(docRef);
    setUserName(await docSnap.data().userName.split(" ")[0]);
  };

  useEffect(() => {
    getUserNameFromUserId();
  }, []);

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

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  loadMoreHome,
  loadMorePostedPosts,
  loadMoreLikedPosts,
} from "../features/pixify/pixifySlice";
import ClipLoader from "react-spinners/ClipLoader";

const LoadMore = ({ issuer, search }) => {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const { lastDoc, userId, startIdxPostedPosts, startIdxLikedPosts } =
    useSelector((store) => store.pixify);

  const handleOnClickLoadMore = async () => {
    setLoading(true);
    if (issuer === "Home") {
      await dispatch(loadMoreHome({ lastDoc, search }));
    }
    if (issuer === "MyPosts") {
      await dispatch(loadMorePostedPosts({ userId, startIdxPostedPosts }));
    }
    if (issuer === "LikedPosts") {
      await dispatch(loadMoreLikedPosts({ userId, startIdxLikedPosts }));
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <section className="w-full">
        <div className="p-8">
          <div className="max-w-[400px] m-auto">
            <div className="w-full flex items-center justify-center">
              <ClipLoader loading={loading} size={20} color="white" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full">
      <div className="p-8">
        <div className="w-full m-auto max-w-[1000px]">
          <div
            className="flex items-center justify-center font-semibold cursor-pointer hover:scale-95 duration-300"
            onClick={handleOnClickLoadMore}
          >
            Load More
          </div>
        </div>
      </div>
    </section>
  );
};

export default LoadMore;

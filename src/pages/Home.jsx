import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchData } from "../features/pixify/pixifySlice";
import Card from "../components/Card";

const Home = () => {
  const dispatch = useDispatch();
  const { isLoggedIn, displayData } = useSelector((store) => store.pixify);

  useEffect(() => {
    dispatch(fetchData());
  }, [isLoggedIn, dispatch]);

  if (displayData.length === 0) {
    return (
      <>
        <section className="w-full">
          <div className="p-8">
            <div className="w-full m-auto max-w-[700px]">
              <div>
                <input
                  type="text"
                  placeholder="Search pictures"
                  className="w-full text-sm p-4 rounded-full bg-gradient-to-r from-gray-800 to-slate-900"
                />
              </div>
            </div>
          </div>
        </section>
        <section className="w-full">
          <div className="p-8">
            <div className="m-auto max-w-[1000px]">
              <div className="flex items-center justify-center">
                <div className="text-xl font-bold">So Empty :(</div>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <section className="w-full">
        <div className="p-8">
          <div className="w-full m-auto max-w-[700px]">
            <div>
              <input
                type="text"
                placeholder="Search pictures"
                className="w-full text-sm p-4 rounded-full bg-gradient-to-r from-gray-800 to-slate-900 "
              />
            </div>
          </div>
        </div>
      </section>
      <section className="w-full">
        <div className="p-8">
          <div className="m-auto max-w-[1000px] ">
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
              {displayData.map((post) => {
                return <Card {...post} key={post.id} />;
              })}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;

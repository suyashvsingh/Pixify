import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchData } from "../features/pixify/pixifySlice";
import Card from "../components/Card";
import { useNavigate, useSearchParams } from "react-router-dom";

const Home = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const dispatch = useDispatch();
  const { displayData } = useSelector((store) => store.pixify);

  const handleOnClickSearch = (e) => {
    e.preventDefault();
    navigate(`/?q=${searchText}`);
    setSearchText("");
  };

  const handleOnChange = (e) => {
    setSearchText(e.target.value);
  };

  useEffect(() => {
    dispatch(fetchData({ q: searchParams.get("q") }));
  }, [dispatch, searchParams]);

  if (displayData.length === 0) {
    return (
      <>
        <section className="w-full">
          <div className="p-8">
            <div className="w-full m-auto max-w-[700px]">
              <form onSubmit={(e) => handleOnClickSearch(e)}>
                <input
                  type="text"
                  placeholder="Search pictures"
                  className="w-full text-sm p-4 rounded-full bg-gradient-to-r from-gray-800 to-slate-900"
                  value={searchText}
                  onChange={(e) => handleOnChange(e)}
                />
              </form>
            </div>
          </div>
        </section>
        <section className="w-full">
          <div className="p-8">
            <div className="m-auto max-w-[1000px]">
              <div className="flex items-center justify-center">
                <div className="text-xl font-bold">So Empty 😔</div>
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
            <form onSubmit={(e) => handleOnClickSearch(e)}>
              <input
                type="text"
                placeholder="Search pictures"
                className="w-full text-sm p-4 rounded-full bg-gradient-to-r from-gray-800 to-slate-900"
                value={searchText}
                onChange={(e) => handleOnChange(e)}
              />
            </form>
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

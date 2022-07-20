import { useSelector, useDispatch } from "react-redux";
import { onLogout } from "../features/pixify/pixifySlice";
import { FaSignOutAlt, FaRegPlusSquare, FaUser } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import icon from "../assets/icon.png";

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { userName } = useSelector((store) => store.pixify);

  const handleOnClickSignOut = async () => {
    dispatch(onLogout());
  };

  return (
    <section className="w-full">
      <div className="p-8 pb-0 md:pb-4 xl:pb-8 pt-4 xl:pt-8">
        <div className="m-auto max-w-[1000px] ">
          <div className="w-full grid grid-cols-2">
            <div className="w-16 cursor-pointer" onClick={() => navigate("/")}>
              <img src={icon} alt="" />
            </div>
            <div className="flex justify-end items-center">
              <div className="cursor-pointer hover:scale-90 duration-300">
                <FaRegPlusSquare
                  size={20}
                  onClick={() => navigate("/createpost")}
                />
              </div>
              <div className="ml-5 md:ml-8  cursor-pointer hover:scale-90 duration-300">
                <FaSignOutAlt size={20} onClick={handleOnClickSignOut} />
              </div>
              <div className="ml-5 md:ml-8  cursor-pointer hover:scale-90 duration-300">
                <FaUser size={20} />
              </div>
            </div>
            <div className="flex justify-start items-end">
              <div className="font-semibold text-sm md:text-xl mt-2">{`Hi, ${userName}!`}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Header;

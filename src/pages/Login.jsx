import icon from "../assets/icon.png";
import googlelogo from "../assets/googlelogo.png";
import { useDispatch, useSelector } from "react-redux";
import { onLogin } from "../features/pixify/pixifySlice";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoggedIn } = useSelector((store) => store.pixify);

  useEffect(() => {
    if (isLoggedIn) {
      navigate("/");
    }
  });

  const handleOnClickContinueWithGoogle = async () => {
    await dispatch(onLogin());
    navigate("/");
  };

  return (
    <section className="w-full h-screen">
      <div className="p-8 h-full">
        <div className="m-auto max-w-[1000px] h-full">
          <div className="h-full flex flex-col items-center justify-center">
            <div className="w-[200px] sm:w-[250px] md:w-[280px] xl:w-[300px]">
              <img src={icon} alt="pixify-logo" />
            </div>
            <button
              className="text-xltext-grey-500 py-2 px-6 rounded-full border-0 text-md font-medium bg-blue-50 text-blue-900 hover:cursor-pointer hover:bg-amber-50  hover:text-amber-700 hover:scale-105 duration-300 mt-8"
              onClick={handleOnClickContinueWithGoogle}
            >
              <div className="flex items-center justify-center">
                <div className="font-medium text-base">Continue with</div>
                <div className="w-10">
                  <img src={googlelogo} alt="google-logo" />
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Login;

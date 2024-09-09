import { SignupInput } from "@paulthedev/blogger-common";
import { ChangeEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { BACKEND_URL } from "../config";

export const Auth = ({ type }: { type: "signup" | "signin" }) => {
  // getting the types from the backend to the frontend   //deep dive --- trpc

  const navigate = useNavigate();

  const [postInputs, setPostInputs] = useState<SignupInput>({
    name: "",
    email: "",
    password: "",
  });

  //based on the types it need to send the request
  async function sendRequest() {
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/v1/user/${type === "signup" ? "signup" : "signin"}`,
        postInputs
      );
      // postinputs is the data that is sent to the backend
      // so the unnecessary data like,// the name will be ignored in case for signin
      const jwt = response.data;
      localStorage.setItem("token", jwt); //stores the jwt token in the local storage
      navigate("/blogs");
    } catch (e) {
      // alert the user that the request failed
      console.log(e);
      alert("An error occurred while signin up.");
    }
  }

  return (
    <div className="h-screen flex justify-center flex-col">
      {/* {JSON.stringify(postInputs)} */}
      <div className="flex justify-center">
        <div>
          <div className="px-10">
            <div className="text-3xl font-extrabold">Create an Account</div>
            <div className="text-slate-500">
              {type === "signin"
                ? "Don't have an account?"
                : "Already have an account?"}
              <Link
                className="pl-2 underline"
                to={type === "signin" ? "/signup" : "/signin"}
              >
                {type === "signin" ? "Sign Up" : "Login"}
              </Link>
            </div>
          </div>
          <div className="pt-4">
            <LabelInput
              label="Username"
              placeholder="Enter your username"
              // onChange={(e) => {
              //   // c is the current state // c is given as an input to the function
              //   setPostInputs((c) => ({
              //     ...c, //existing inputs are added
              //     name: e.target.value, // update the name
              //   }));

              //alternative
              onChange={(e) => {
                setPostInputs({
                  ...postInputs, //existing inputs are added
                  name: e.target.value, // update the name
                });
              }}
            />
            {type === "signup" ? (
              <LabelInput
                label="Email"
                placeholder="m@example.com"
                // onChange={(e) => {
                //   setPostInputs((c) => ({
                //     ...c, //existing inputs are added  //spread operator
                //     name: e.target.value, // update the name
                //   }));
                // }}

                //alternative
                onChange={(e) => {
                  setPostInputs({
                    ...postInputs, //existing inputs are added
                    email: e.target.value, // update the email
                  });
                }}
              />
            ) : null}
            <LabelInput
              label="Password"
              // type helps to select the type of input
              type="password"
              placeholder="password"
              onChange={(e) => {
                setPostInputs((c) => ({
                  ...c, //existing inputs are added
                  password: e.target.value, // update the password
                }));
              }}
            />
            <button
              onClick={sendRequest} //this is how you pass the function in react
              //no need to call the function //onClick={sendRequest()} //this is wrong
              type="button"
              className="mt-8 w-full text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
            >
              {/* {type === "signin" ? "Sign In" : "Sign Up"} */}
              {type === "signup" ? "Sign Up" : "Sign In"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface LabelInputTypes {
  label: string;
  placeholder: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void; //figure out the type of e
  type?: string;
}

function LabelInput({ label, placeholder, onChange, type }: LabelInputTypes) {
  return (
    <div>
      <div>
        <label className="block mb-2 text-sm font-bold text-black pt-4">
          {label}
        </label>
        <input
          onChange={onChange}
          type={type || "text"}
          id="first_name"
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
          placeholder={placeholder}
          required
        />
      </div>{" "}
    </div>
  );
}

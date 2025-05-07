"use client";
import React, { useEffect, useState } from "react";
import Cookie from "js-cookie";
import Loading from "@/components/Loading";
import Link from "next/link";

const Register = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [load, setLoad] = useState(false);
  const [vLoad, setvLoad] = useState(false);
  const [msg, setMsg] = useState("");
  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationMsg, setVerificationMsg] = useState("");
  const [token, setToken] = useState("");
  const [time, setTime] = useState(0);
  const [isResendDisabled, setIsResendDisabled] = useState(false);

  // Handle registration logic
  const handleRegister = async () => {
    setLoad(true);
    setMsg("");
    const response = await fetch("/api/register", {
      method: "POST",
      body: JSON.stringify({ username, password, email }),
      headers: { "Content-Type": "application/json" },
    });

    const json = await response.json();
    if (json.ok === true) {
      setShowVerification(true);
      setMsg("Check your email for the verification code!");
      setToken(json.token);
    } else {
      setMsg(json.message);
    }
    setLoad(false);
  };

  // Resend verification code
  const handleResendVerification = async () => {
    if (isResendDisabled) return;

    setIsResendDisabled(true);
    setTime(30);

    // Request to resend verification code
    const response = await fetch("/api/resendVerification", {
      method: "POST",
      body: JSON.stringify({ email }),
      headers: { "Content-Type": "application/json" },
    });

    const json = await response.json();
    if (json.ok) {
      setMsg("Verification code resent. Check your email.");
    } else {
      setMsg(json.message);
    }

    // Start 30-second countdown
    const interval = setInterval(() => {
      setTime((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsResendDisabled(false); // Re-enable the resend button after 30 seconds
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    // Set initial 30-second countdown when verification is shown
    if (showVerification) {
      setTime(30);
    }
  }, [showVerification]);

  // Handle verification logic
  const handleVerification = async () => {
    setvLoad(true);
    const response = await fetch("/api/verifyCode", {
      method: "POST",
      body: JSON.stringify({ email, code: verificationCode }),
      headers: { "Content-Type": "application/json" },
    });

    const json = await response.json();
    if (json.ok === true) {
      Cookie.set("authorization", token, {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
      window.location.assign(window.location.origin + "/home");
    } else {
      setVerificationMsg(json.message);
    }
    setvLoad(false);
  };

  return (
    <main className="w-screen h-screen bg-slate-100 font-sans flex">
      <Link
        className="absolute top-4 right-4 flex bg-white rounded-lg text-black w-32 text-center px-10 py-4 h-14 justify-end"
        href="/login"
      >
        Log In
      </Link>
      <div className="w-16! md:w-2/4 h-fit m-auto bg-white rounded-md box-border space-y-4">
        <div className="flex bg-black w-full h-16 items-center justify-center text-white rounded-t-md text-center text-3xl">
          Register
        </div>
        <h2 className="text-black flex justify-center font-bold text-xl">
          SIGN UP FOR ANSWERS!
        </h2>
        <div>
          <label className="mx-6 text-lg" htmlFor="username">
            Username:
          </label>
          <input
            onChange={(e) => setUsername(e.target.value)}
            type="text"
            id="username"
            placeholder="Username"
            className="mx-6 text-xl border-2 outline-none rounded-md p-2 w-11/12 mt-1"
          />
        </div>
        <div>
          <label className="mx-6 text-lg" htmlFor="email">
            Email:
          </label>
          <input
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            id="email"
            placeholder="Email"
            className="mx-6 text-xl border-2 outline-none rounded-md p-2 w-11/12 mt-1"
          />
        </div>
        <div>
          <label className="mx-6 text-lg" htmlFor="password">
            Password:
          </label>
          <input
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            id="password"
            placeholder="Password"
            className="mx-6 text-xl border-2 outline-none rounded-md p-2 w-11/12 mt-1"
          />
        </div>
        <button
          onClick={handleRegister}
          className="bg-black px-4 py-4 !my-8 text-white rounded-md w-11/12 mx-6"
        >
          {load ? <Loading /> : "Register"}
        </button>
        <p className="my-2 text-lg text-black text-center">{msg}</p>
      </div>

      {/* Verification Modal */}
      {showVerification && (
        <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 space-y-4 w-96">
            <h2 className="text-2xl font-bold text-center">Verify Your Email</h2>
            <p className="text-sm text-gray-600 text-center">
              Enter the verification code sent to your email to activate your
              account.
            </p>
            <input
              type="text"
              placeholder="Enter verification code"
              onChange={(e) => setVerificationCode(e.target.value)}
              className="w-full border-2 p-2 rounded-md"
            />
            <button
              onClick={handleVerification}
              className="w-full bg-black text-white py-2 rounded-md"
            >
              {vLoad ? <Loading /> : "Verify"}
            </button>
            <span
              onClick={handleResendVerification}
              className={`text-center text-sm font-bold cursor-pointer ${
                isResendDisabled ? "text-gray-500" : "text-blue-500"
              }`}
            >
              Resend {isResendDisabled ? `(${time})` : ""}
            </span>
            <p className="text-center text-red-600">{verificationMsg}</p>
          </div>
        </div>
      )}
    </main>
  );
};

export default Register;

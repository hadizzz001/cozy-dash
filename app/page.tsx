"use client"


import { useRouter } from 'next/navigation'
import axios from "axios";
import React, { useState } from "react";
import $ from 'jquery';





const login = () => {
    const router = useRouter()


    if (typeof window !== "undefined") {
        var tabID = sessionStorage.tabID &&
            sessionStorage.closedLastTab !== '2' ?
            sessionStorage.tabID :
            sessionStorage.tabID = Math.random();
        sessionStorage.closedLastTab = '2';
        $(window).on('unload beforeunload', function () {
            sessionStorage.closedLastTab = '1';
        });
    }

 


 



const handleSubmit = async (e) => {
  e.preventDefault();

  const username = e.target.username.value;
  const password = e.target.pass.value;

  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Login failed");
      return;
    }

    // ✅ Login success
    console.log("Logged in:", data);
    alert("Success");
    router.push("/dashboard");
  } catch (error) {
    console.error("Login error:", error);
    alert("Something went wrong.");
  }
};








return (
  <div className="w-full h-screen flex justify-center items-center bg-gray-100">
    <div className="w-full max-w-xs">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
      >
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="username"
          >
            Username
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="username"
            name="username"
            type="text"
            placeholder="Username"
          />
        </div>

        <div className="mb-6">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="password"
          >
            Password
          </label>
          <input
            className="shadow appearance-none border border-red-500 rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
            id="password"
            name="pass"
            type="password"
            placeholder="******************"
          />
   
        </div>

        <div className="flex items-center justify-between">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
          >
            Sign In
          </button>
        </div>
      </form>

      <style
        dangerouslySetInnerHTML={{
          __html: "\n#sidenavv { display: none; }",
        }}
      />
    </div>
  </div>
);

};

export default login;
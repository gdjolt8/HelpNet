"use client";
import React, { useEffect, useState } from 'react';
import Cookies from "js-cookie";
import { getToken } from '@/lib/functions';
import { PhotoIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { supabase } from '@/lib/supabaseClient';

const Settings = () => {
    const [username, setUsername] = useState("");
    const [modal, setModal] = useState(false);
    const [files, setFiles] = useState<FileList>();
    const [msg, setMsg] = useState("");
    useEffect(() => {
        const fetchData = async () => {
            const token = String(Cookies.get("authorization"));
            try {
                const account = (await getToken(token)).account;
                setUsername(account.username);
            } catch (e) {
                console.log(e);
            }
        };

        fetchData();
    }, []);

    const uploadImages = async () => {
        const imageUrls: string[] = [];
      
        for (const image of files as FileList) {
          const fileName = `images/${Date.now()}-${image.name}`;
          const { data, error } = await supabase.storage.from("images").upload(fileName, image);
      
          if (error) {
            console.error("Error uploading image:", error.message);
            continue;
          }
      
          const { publicUrl } = supabase.storage.from("images").getPublicUrl(data.path).data;
          imageUrls.push(publicUrl);
        }

        const res = await fetch("/api/setProfilePicture", {
            method: "POST",
            body: JSON.stringify({authorization: Cookies.get("authorization"), image_url: imageUrls[0]})
        });
        const txt = await res.json();
        if (txt.ok) {
            setMsg("Changed profile picture successfully.");
        }
        console.log(txt);
    };


    return (
        <main className="w-screen h-screen bg-gray-800 font-sans flex flex-col text-black">
            <h1 className="text-4xl font-bold mx-[3rem] mt-[3rem] mb-[1.5rem] text-white">Settings</h1>
            <div className="bg-gray-700 mx-12 rounded-lg w-[93%] h-[80%]">
                <div>
                    <h2 className="mx-3 mt-3.5 mb-1.5 text-[1.2rem] text-white">Username:</h2>
                    <div className='flex flex-row space-x-4 box-border'>
                        <input type="text" value={username} disabled className='bg-white text-xl rounded-md px-8 w-[24rem] py-2 outline-2 outline-gray-400 mx-3 disabled:bg-gray-500 disabled:text-gray-600 disabled:cursor-not-allowed'></input>
                        <button onClick={() => { setModal(true) }} className='bg-blue-700 px-3 max-w-24 py-1 text-white rounded-md'>Change username</button>
                    </div>
                </div>
                <div>
                    <h2 className="mx-3 mt-3.5 mb-1.5 text-[1.2rem] text-white">Profile Picture:</h2>
                    <div className="relative">
                        <PhotoIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400 mx-3 my-1.5" />
                        <input
                            type="file"
                            name="images"
                            tabIndex={-1}
                            onChange={(e) => {setFiles(e.target.files as FileList)}}
                            accept="image/jpeg, image/png, image/webp, image/gif, video/mp4, video/quicktime"
                            multiple={true}
                            className="text-white mx-3 w-[95%] px-10 py-2 border border-gray-300 rounded-lg shadow-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 hover:file:bg-blue-500 file:text-white file:cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                        />
                    </div>
                    <div className='flex flex-row'>
                        <button onClick={uploadImages} className="bg-blue-700 text-white px-6 py-3 rounded-md mx-3 my-2 hover:bg-blue-900">Change</button>
                        <p className='text-green-500 my-5 mx-2 text-md'>{msg}</p>
                    </div>
                </div>
                <button onClick={() => {window.location.href = "/home"}} className="mt-[50.5%] lg:mt-[24%] mx-2 bg-blue-700 text-white rounded-md px-8 py-3">Return Home</button>
                {modal && (
                    <div className="absolute top-0 left-0 w-full h-full bg-black bg-current/25 flex items-center justify-center">
                        <div className="bg-white rounded-lg p-6 space-y-4 w-96">
                            <XCircleIcon onClick={() => setModal(false)} className='size-6 p-0 my-0 mx-[95%] text-red-500 cursor-pointer'></XCircleIcon>
                            <h2 className="text-2xl font-bold text-center">Purchase Username Change</h2>
                            <p className="text-sm text-gray-600 text-center">
                                $5,000 is required to change your username.
                            </p>
                            <input
                                type="text"
                                placeholder="Credit card number"
                                className="w-full border-2 p-2 rounded-md"
                            />
                            <button
                                className="w-full bg-black text-white py-2 rounded-md"
                            >
                                {"Send"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </main>
    )
};

export default Settings;

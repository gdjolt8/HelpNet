"use client";
import React, { useState } from 'react'
import Cookie from 'js-cookie';
import Loading from '@/components/Loading';
import Link from 'next/link';
const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [load, setLoad] = useState(false);
    return (
    <main className='w-screen h-screen bg-slate-100 font-sans flex'>
        <div className='w-16 md:w-2/4 h-fit m-auto bg-white rounded-md box-border space-y-4'>
            <div className='flex bg-black w-full h-16 items-center justify-center text-white rounded-t-md text-center text-3xl'>Login to HelpNet</div>
            <h2 className='text-black flex justify-center font-bold text-xl'></h2>
            <div>
                <label className='mx-6 text-lg text-black' htmlFor="username">Username:</label>
                <input onChange={(e) => setUsername(e.target.value)} type='text' id="username" placeholder='Username' className='mx-6 text-xl border-2 outline-none rounded-md p-2 w-11/12 mt-1 text-black'></input>
            </div>
            <div>
                <label className='mx-6 text-lg text-black' htmlFor="password">Password:</label>
                <input onChange={(e) => setPassword(e.target.value)} type='password' id="password" placeholder='Password' className='mx-6 text-xl border-2 outline-none rounded-md p-2 w-11/12 mt-1 text-black'></input>
            </div>
            <button onClick={async () => {
                setLoad(true);
                const response = await fetch("/api/login", {
                    method: "POST",
                    body: JSON.stringify({username, password}),
                    headers: {'Content-Type': 'application/json'}
                });
                const json = await response.json();
                if (json.ok == true) {
                    Cookie.set("authorization", json.token, {
                        expires: new Date(Date.now() + 7*24*60*60*1000)
                    });
                    window.location.assign(window.location.origin + '/home');
                }
                setLoad(false);
            }} className='bg-black px-4 py-4 !my-8 text-white rounded-md w-11/12 mx-6'>{load ? <Loading /> : "Login"}</button>
            <div className='absolute flex flex-row gap-x-4 text-lg font-medium justify-center'>
                {"Don't have an account?"}
                <Link href="/register" className='hover:underline'>Sign Up</Link>
            </div>
        </div>
    </main>
  )
}

export default Login;
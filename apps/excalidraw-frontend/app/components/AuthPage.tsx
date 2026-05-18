"use client"

import axios from "axios";
import { useRouter } from "next/navigation";
import { useRef } from "react"

export default function AuthPage({ isSignin }: { isSignin: boolean }) {

    const refUsername = useRef(null);
    const refPassword = useRef(null);
    const router = useRouter();
    const myHeaders = new Headers();

    async function sendRequest() {
        const username = refUsername.current?.value;
        const password = refPassword.current?.value;

        if (username == null || password == null || username == "" || password == "") {
            alert("Please enter username and password");
            return;
        }

        if (isSignin) {
            const response = await axios.post("http://localhost:3004/signin", {
                username,
                password
            })
            alert(response.data.message);
            localStorage.setItem("token", response.data.token);
            myHeaders.set("Authorization", response.data.token);
            router.push("/canvas/room4");
        } else {
            const response = await axios.post("http://localhost:3004/signup", {
                username,
                password
            })
            alert(response.data.message);
            if (response.data.message === "you have successfully signed up") {
                router.push("/signin")
            }
        }
    }

    return <div className="w-screen h-screen flex justify-center items-center">

        <div className="p-2 m-2 bg-white rounded">
            <div className="p-2">
                <input ref={refUsername} type="text" placeholder="Enter Username" className="text-black border" />
            </div>
            <div className="p-2">
                <input ref={refPassword} type="password" placeholder="Enter Password" className="text-black border" />
            </div>
            <div className="p-2">
                <button onClick={sendRequest} className="text-black border">{isSignin ? "Signin" : "Signup"}</button>
            </div>
        </div>

    </div>
}
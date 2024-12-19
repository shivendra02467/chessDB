import React, { useEffect, useState } from "react";

const Login = ({ setIsLoggedIn }) => {
    useEffect(() => {
        document.title = 'Login';
    }, []);

    const [formData, setFormData] = useState({ email: "", password: "" });

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch("/api/users/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const data = await response.json();
            if (response.ok) {
                localStorage.setItem("token", data.token);
                setIsLoggedIn(true);
                window.location.href = "/";
                alert("Login successful!");
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error("Error:", error);
            alert("An error occurred. Please try again.");
        }
    };

    return (
        <div style={{ padding: "20px" }}>
            <div></div>
            <form onSubmit={handleSubmit}>
                <input name="email" type="email" placeholder="Email" onChange={handleChange} />
                <input name="password" type="password" placeholder="Password" onChange={handleChange} />
                <button type="submit">Login</button>
            </form>
        </div>
    );
};

export default Login;


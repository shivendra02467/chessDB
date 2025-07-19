import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import socket from "../services/socket"

const Play = () => {
    const [challenges, setChallenges] = useState([]);
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    useEffect(() => {
        fetch('/api/challenges', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(res => res.json())
            .then(data => setChallenges(data));

        socket.on('start-game', ({ challengeId }) => {
            navigate(`/game/${challengeId}`);
        });

        socket.emit('join-lobby');

        const handleAdded = (challenge) => {
            setChallenges((prev) => [...prev, challenge]);
        };

        const handleRemoved = (id) => {
            setChallenges((prev) => prev.filter(c => c._id !== id));
        };

        socket.on('challenge-added', handleAdded);
        socket.on('challenge-removed', handleRemoved);

        return () => {
            socket.off('start-game');
            socket.off('challenge-added', handleAdded);
            socket.off('challenge-removed', handleRemoved);
        };
    }, []);

    const createChallenge = async () => {
        const res = await fetch('/api/challenges', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            }
        });
        const challenge = await res.json();
        socket.emit('join-challenge', challenge._id);
    };

    const acceptChallenge = async (id) => {
        socket.emit('join-challenge', id);
        await fetch(`/api/challenges/${id}/accept`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` }
        });
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: "20px",
            gap: '10px',

        }}>
            <h1>Live Game Challenges</h1>
            <div>
                <button onClick={createChallenge}>Create New Challenge</button>
            </div>
            {challenges.length === 0 ? (
                <p>No open challenges yet.</p>
            ) : (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '10px',

                }}>
                    {
                        challenges.map(challenge => (
                            <div
                                key={challenge._id}
                                style={{
                                    border: "2px solid #888888",
                                    padding: "15px",
                                    width: "250px",
                                    textAlign: "center",
                                }}
                            >
                                Challenge by {challenge.challenger}{" "}
                                <button onClick={() => acceptChallenge(challenge._id)}>Accept</button>
                            </div>
                        ))
                    }
                </div>
            )}
        </div>
    );
};

export default Play;

import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import './Video.css';

function Video() {
    const videoRefs = useRef([]);
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchVideos = async () => {
            try {
                const response = await axios.get("http://localhost:3000/videos");
                setVideos(response.data);
            } catch (error) {
                console.error("Error fetching videos:", error);
                setError("Failed to load videos. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchVideos();
    }, []);

    return (
        <div className="video-wrapper">
            <h2 className="title">🎥 Video Gallery</h2>

            {loading && <p>Loading videos...</p>}
            {error && <p className="error">{error}</p>}

            <div className="video-container">
                {videos.length > 0 ? (
                    videos.map((video, index) => (
                        <video 
                            key={index} 
                            controls 
                            ref={el => videoRefs.current[index] = el} 
                            className="video"
                        >
                            <source src={video.url} type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                    ))
                ) : (
                    <p>No videos available.</p>
                )}
            </div>
        </div>
    );
}

export default Video;

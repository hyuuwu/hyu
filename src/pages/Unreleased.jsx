import React, { useState, useEffect } from 'react';
import './Unreleased.css';
import { supabase } from '../supabaseClient';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

export default function Unreleased() {
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);

    // Player state
    const [playingId, setPlayingId] = useState(null);
    const [currentSong, setCurrentSong] = useState(null);
    const [audioRef] = useState(() => {
        const audio = new Audio();
        audio.crossOrigin = "anonymous";
        return audio;
    });

    // Progress state
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);

    // Audio Visualizer Context
    const [audioContext, setAudioContext] = useState(null);
    const [analyser, setAnalyser] = useState(null);
    const canvasRef = React.useRef(null);
    const requestRef = React.useRef();

    useEffect(() => {
        async function fetchSongs() {
            const { data, error } = await supabase
                .from('songs')
                .select('*')
                .order('created_at', { ascending: false });

            if (!error && data) {
                setSongs(data);
            }
            setLoading(false);
        }

        fetchSongs();

        const updateTime = () => setCurrentTime(audioRef.currentTime);
        const updateDuration = () => setDuration(audioRef.duration);
        const handleEnded = () => setPlayingId(null);

        audioRef.addEventListener('timeupdate', updateTime);
        audioRef.addEventListener('loadedmetadata', updateDuration);
        audioRef.addEventListener('ended', handleEnded);

        return () => {
            audioRef.removeEventListener('timeupdate', updateTime);
            audioRef.removeEventListener('loadedmetadata', updateDuration);
            audioRef.removeEventListener('ended', handleEnded);
            audioRef.pause();
            audioRef.src = '';
        };
    }, [audioRef]);

    useEffect(() => {
        audioRef.volume = isMuted ? 0 : volume;
    }, [volume, isMuted, audioRef]);

    // Initializer for the AudioContext which requires a user gesture
    const initAudioVisualizer = () => {
        if (!audioContext) {
            const actx = new (window.AudioContext || window.webkitAudioContext)();
            const anl = actx.createAnalyser();

            // Connect the audio element to the analyser, then to destination
            const source = actx.createMediaElementSource(audioRef);
            source.connect(anl);
            anl.connect(actx.destination);

            anl.fftSize = 256;

            setAudioContext(actx);
            setAnalyser(anl);
        } else if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
    };

    // Visualization loop
    const renderVisualizer = () => {
        if (!analyser || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        analyser.getByteFrequencyData(dataArray);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const barWidth = (canvas.width / bufferLength) * 2.5;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
            const barHeight = (dataArray[i] / 255) * canvas.height;

            // Glowing cyan look
            ctx.fillStyle = `rgba(0, 229, 255, ${dataArray[i] / 255})`;
            ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

            x += barWidth + 1;
        }

        requestRef.current = requestAnimationFrame(renderVisualizer);
    };

    useEffect(() => {
        if (playingId && analyser) {
            requestRef.current = requestAnimationFrame(renderVisualizer);
        } else {
            cancelAnimationFrame(requestRef.current);
        }
        return () => cancelAnimationFrame(requestRef.current);
    }, [playingId, analyser]);

    const togglePlay = (song) => {
        initAudioVisualizer();

        if (playingId === song.id) {
            audioRef.pause();
            setPlayingId(null);
        } else {
            // New song or resuming different song
            if (currentSong?.id !== song.id) {
                audioRef.src = song.audio_url;
                setCurrentSong(song);
            }
            audioRef.play();
            setPlayingId(song.id);
        }
    };

    const handleProgressChange = (e) => {
        const time = e.target.value;
        audioRef.currentTime = time;
        setCurrentTime(time);
    };

    const handleVolumeChange = (e) => {
        setVolume(e.target.value);
        setIsMuted(e.target.value === '0');
    };

    const formatTime = (time) => {
        if (isNaN(time)) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')} `;
    };

    return (
        <div className="unreleased-container fade-in" style={{ paddingBottom: currentSong ? '100px' : '0' }}>
            <h2 className="mb-2 text-center" style={{ fontSize: '2.5rem' }}>Unreleased Vault</h2>
            <p className="text-center text-secondary mb-2" style={{ maxWidth: 500, margin: '0 auto 2rem' }}>
                Beats and other stuff i been trying to make, {'>'}:3
            </p>

            {loading ? (
                <div className="text-center text-secondary">Loading tracks...</div>
            ) : songs.length === 0 ? (
                <div className="glass-panel text-center">
                    <p className="text-secondary">
                        The vault is empty right now. New sounds incoming.
                    </p>
                </div>
            ) : (
                <div className="songs-list">
                    {songs.map(song => (
                        <div key={song.id} className="glass-panel song-card mb-1 fade-in">
                            <button
                                className="play-btn"
                                onClick={() => togglePlay(song)}
                            >
                                {playingId === song.id ? <Pause size={24} color="#121212" fill="#121212" /> : <Play size={24} color="#121212" fill="#121212" />}
                            </button>
                            <div className="song-info">
                                <h3>{song.title}</h3>
                                <p className="text-secondary text-sm">{song.description || 'No description available.'}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {currentSong && (
                <div className="bottom-player glass-panel">
                    <div className="player-content">
                        <div className="now-playing">
                            <h4>{currentSong.title}</h4>
                            <p className="text-secondary text-sm">HYU44E</p>
                        </div>

                        <div className="player-controls">
                            <canvas ref={canvasRef} className="visualizer-canvas" width="800" height="80"></canvas>
                            <button onClick={() => togglePlay(currentSong)} className="control-btn play-btn-small" style={{ zIndex: 2 }}>
                                {playingId === currentSong.id ? <Pause size={20} color="#121212" fill="#121212" /> : <Play size={20} color="#121212" fill="#121212" />}
                            </button>

                            <div className="progress-container">
                                <span className="time-text">{formatTime(currentTime)}</span>
                                <input
                                    type="range"
                                    min="0"
                                    max={duration || 100}
                                    value={currentTime}
                                    onChange={handleProgressChange}
                                    className="progress-slider"
                                />
                                <span className="time-text">{formatTime(duration)}</span>
                            </div>
                        </div>

                        <div className="volume-container">
                            <button onClick={() => setIsMuted(!isMuted)} className="control-btn">
                                {isMuted || volume == 0 ? <VolumeX size={20} color="#fff" /> : <Volume2 size={20} color="#fff" />}
                            </button>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.05"
                                value={isMuted ? 0 : volume}
                                onChange={handleVolumeChange}
                                className="volume-slider"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

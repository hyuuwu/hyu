import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

export default function Unreleased() {
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);

    // Player state
    const [playingId, setPlayingId] = useState(null);
    const [currentSong, setCurrentSong] = useState(null);
    const [audioRef] = useState(new Audio());

    // Progress state
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);

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

    const togglePlay = (song) => {
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
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="unreleased-container fade-in" style={{ paddingBottom: currentSong ? '100px' : '0' }}>
            <h2 className="mb-2 text-center" style={{ fontSize: '2.5rem' }}>Unreleased Vault</h2>
            <p className="text-center text-secondary mb-2" style={{ maxWidth: 500, margin: '0 auto 2rem' }}>
                Beats and other stuff i been trying to make, >:3
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
                            <button onClick={() => togglePlay(currentSong)} className="control-btn play-btn-small">
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

            <style jsx="true">{`
                .song-card {
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                    padding: 1.5rem;
                    transition: transform 0.3s ease, background 0.3s ease;
                }

                .song-card:hover {
                    background: rgba(255, 255, 255, 0.08);
                    transform: translateY(-2px);
                }

                .play-btn {
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    background: var(--play-color);
                    border: none;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    flex-shrink: 0;
                    transition: transform 0.2s ease;
                }

                .play-btn:hover {
                    transform: scale(1.05);
                }

                .play-btn:active {
                    transform: scale(0.95);
                }

                .song-info h3 {
                    margin: 0 0 0.25rem 0;
                    font-size: 1.2rem;
                }

                .text-sm {
                    font-size: 0.9rem;
                    margin: 0;
                }

                /* Bottom Player CSS */
                .bottom-player {
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    width: 100%;
                    padding: 1rem 2rem;
                    background: rgba(18, 18, 18, 0.95);
                    border-radius: 0;
                    border: none;
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                    z-index: 1000;
                    backdrop-filter: blur(15px);
                }

                .player-content {
                    max-width: 800px;
                    margin: 0 auto;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 1rem;
                }

                .now-playing {
                    flex: 1;
                    min-width: 0;
                }

                .now-playing h4 {
                    margin: 0;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .player-controls {
                    flex: 2;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.5rem;
                }

                .play-btn-small {
                    width: 35px;
                    height: 35px;
                    border-radius: 50%;
                    background: var(--play-color);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .progress-container {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }

                .time-text {
                    font-size: 0.8rem;
                    color: var(--text-secondary);
                    min-width: 40px;
                }

                .volume-container {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: flex-end;
                    gap: 0.5rem;
                }

                .control-btn {
                    background: none;
                    border: none;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0.8;
                    transition: opacity 0.2s;
                }

                .control-btn:hover {
                    opacity: 1;
                }

                input[type=range] {
                    -webkit-appearance: none;
                    background: transparent;
                }

                input[type=range]:focus {
                    outline: none;
                }

                input[type=range]::-webkit-slider-runnable-track {
                    width: 100%;
                    height: 4px;
                    cursor: pointer;
                    background: rgba(255,255,255,0.2);
                    border-radius: 2px;
                }

                input[type=range]::-webkit-slider-thumb {
                    height: 12px;
                    width: 12px;
                    border-radius: 50%;
                    background: var(--play-color);
                    cursor: pointer;
                    -webkit-appearance: none;
                    margin-top: -4px;
                }

                .progress-slider {
                    flex: 1;
                }

                .volume-slider {
                    width: 80px;
                }

                @media (max-width: 600px) {
                    .player-content {
                        flex-direction: column;
                        gap: 0.5rem;
                    }
                    .volume-container {
                        display: none; /* Hide volume on mobile to save space */
                    }
                    .now-playing {
                        text-align: center;
                    }
                }
            `}</style>
        </div>
    );
}

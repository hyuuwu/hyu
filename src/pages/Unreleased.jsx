import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Play, Pause } from 'lucide-react';

export default function Unreleased() {
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [playingId, setPlayingId] = useState(null);
    const [audioRef] = useState(new Audio());

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

        return () => {
            audioRef.pause();
            audioRef.src = '';
        };
    }, [audioRef]);

    const togglePlay = (song) => {
        if (playingId === song.id) {
            audioRef.pause();
            setPlayingId(null);
        } else {
            audioRef.src = song.audio_url;
            audioRef.play();
            setPlayingId(song.id);
        }
    };

    audioRef.onended = () => setPlayingId(null);

    return (
        <div className="unreleased-container fade-in">
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
                    font - size: 0.9rem;
                margin: 0;
        }
      `}</style>
        </div>
    );
}

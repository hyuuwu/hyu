import React from 'react';
import { Play, Music } from 'lucide-react';

export default function Home() {
    return (
        <div className="home-container fade-in">
            <div className="profile-section text-center">
                <div className="profile-image">
                    <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRG2wTMbbHrZReGIhof_dhET6yV-pgCBByBfg&s" alt="HYU44E Profile" className="profile-img-tag" />
                </div>
                <h1 className="mt-2 mb-1">HYU44E</h1>
                <p className="bio-text">
                    Luiz, AkA Hyuaae, Is a producer, musician, developer(i made this website :D)
                    and an artist. Most known by his music, he makes most of them in FL Studio,
                    Logic Pro or garageband. Buy/Listen to his music now at the links below!
                </p>

                <div className="links-section mt-2">
                    <a href="https://open.spotify.com/artist/6ioSe48zKczycCV21mHzmg" className="social-link spotify" aria-label="Spotify">
                        <Music size={24} color="#fff" />
                    </a>
                    <a href="https://music.youtube.com/channel/UCgQ7c9DsARrBpvCfbMKnRlw" className="social-link play" aria-label="Play" alt="Yt music">
                        <Play size={24} color="#ffffffff" fill="#ffffffff" />
                    </a>
                </div>
            </div>

            <style jsx="true">{`
                .home-container {
                    display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 70vh;
        }

                .profile-image {
                    width: 200px;
                height: 200px;
                border-radius: 50%;
                background: #000;
                margin: 0 auto;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                border: 1px solid rgba(255,255,255,0.05);
                overflow: hidden;
                transition: transform 0.5s ease;
        }

                .profile-img-tag {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
        }

                .profile-image:hover {
                    transform: scale(1.02);
        }

                h1 {
                    font - size: 3rem;
                font-weight: 800;
                letter-spacing: -1px;
        }

                .bio-text {
                    color: var(--text-secondary);
                max-width: 600px;
                margin: 0 auto;
                font-size: 1.1rem;
                line-height: 1.8;
        }

                .links-section {
                    display: flex;
                justify-content: center;
                gap: 1.5rem;
        }

                .social-link {
                    display: flex;
                align-items: center;
                justify-content: center;
                width: 50px;
                height: 50px;
                border-radius: 50%;
                transition: transform 0.3s ease, filter 0.3s ease;
        }

                .social-link:hover {
                    transform: translateY(-5px);
                filter: brightness(1.2);
                opacity: 1;
        }

                .spotify {
                    background - color: #E61280; /* Magenta-ish like in the screenshot */
        }

                .play {
                    background - color: var(--play-color);
        }
      `}</style>
        </div >
    );
}

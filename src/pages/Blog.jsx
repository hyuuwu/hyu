import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import ReactMarkdown from 'react-markdown';

export default function Blog() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchPosts() {
            const { data, error } = await supabase
                .from('blog_posts')
                .select('*')
                .order('created_at', { ascending: false });

            if (!error && data) {
                setPosts(data);
            }
            setLoading(false);
        }

        fetchPosts();
    }, []);

    return (
        <div className="blog-container fade-in">
            <h2 className="mb-2 text-center" style={{ fontSize: '2.5rem' }}>Journal</h2>

            {loading ? (
                <div className="text-center text-secondary">Loading posts...</div>
            ) : posts.length === 0 ? (
                <div className="glass-panel">
                    <p className="text-center text-secondary">
                        No posts available right now. Check back later.
                    </p>
                </div>
            ) : (
                <div className="posts-list">
                    {posts.map(post => (
                        <article key={post.id} className="glass-panel mb-2 fade-in">
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{post.title}</h3>
                            <div className="text-secondary" style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
                                {new Date(post.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </div>
                            <div className="post-content markdown-body">
                                <ReactMarkdown>{post.content}</ReactMarkdown>
                            </div>
                        </article>
                    ))}
                </div>
            )}

            <style jsx="true">{`
                .markdown-body {
                    line-height: 1.8;
                }
                .markdown-body h1, .markdown-body h2, .markdown-body h3, .markdown-body h4 {
                    margin-top: 1.5rem;
                    margin-bottom: 0.5rem;
                    font-weight: 600;
                    color: #fff;
                }
                .markdown-body h1 { font-size: 2rem; }
                .markdown-body h2 { font-size: 1.5rem; }
                .markdown-body h3 { font-size: 1.25rem; }
                .markdown-body p { margin-bottom: 1rem; }
                .markdown-body a { color: var(--play-color); text-decoration: underline; }
                .markdown-body ul, .markdown-body ol { margin-left: 2rem; margin-bottom: 1rem; }
                .markdown-body li { margin-bottom: 0.25rem; }
                .markdown-body blockquote {
                    border-left: 4px solid var(--play-color);
                    padding-left: 1rem;
                    color: var(--text-secondary);
                    font-style: italic;
                    margin: 1.5rem 0;
                    background: rgba(255, 255, 255, 0.05);
                    padding: 1rem;
                    border-radius: 4px;
                }
                .markdown-body code {
                    background: rgba(0, 0, 0, 0.5);
                    padding: 0.2rem 0.4rem;
                    border-radius: 4px;
                    font-family: monospace;
                    font-size: 0.9em;
                }
                .markdown-body pre {
                    background: rgba(0, 0, 0, 0.5);
                    padding: 1rem;
                    border-radius: 8px;
                    overflow-x: auto;
                    margin-bottom: 1rem;
                }
                .markdown-body pre code {
                    background: none;
                    padding: 0;
                }
                .markdown-body img {
                    max-width: 100%;
                    border-radius: 8px;
                    margin: 1rem 0;
                }
            `}</style>
        </div>
    );
}

import React, { useState, useEffect } from 'react';
import './Blog.css';
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
        </div>
    );
}

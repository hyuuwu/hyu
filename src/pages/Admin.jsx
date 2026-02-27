import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { LogOut, Upload, Send } from 'lucide-react';

export default function Admin() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Dashboard state
  const [activeTab, setActiveTab] = useState('blog');

  // Blog form
  const [blogTitle, setBlogTitle] = useState('');
  const [blogContent, setBlogContent] = useState('');

  // Song form
  const [songTitle, setSongTitle] = useState('');
  const [songDesc, setSongDesc] = useState('');
  const [audioFile, setAudioFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const submitBlogPost = async (e) => {
    e.preventDefault();
    setUploading(true);
    const { error } = await supabase.from('blog_posts').insert([{ title: blogTitle, content: blogContent }]);
    if (error) alert(error.message);
    else {
      alert('Blog post published!');
      setBlogTitle('');
      setBlogContent('');
    }
    setUploading(false);
  };

  const submitSong = async (e) => {
    e.preventDefault();
    if (!audioFile) return alert('Please select an audio file');
    setUploading(true);

    const fileExt = audioFile.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage.from('audio').upload(filePath, audioFile);

    if (uploadError) {
      alert('Upload error: ' + uploadError.message);
      setUploading(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage.from('audio').getPublicUrl(filePath);

    const { error: dbError } = await supabase.from('songs').insert([
      { title: songTitle, description: songDesc, audio_url: publicUrlData.publicUrl }
    ]);

    if (dbError) alert('DB error: ' + dbError.message);
    else {
      alert('Song uploaded successfully!');
      setSongTitle('');
      setSongDesc('');
      setAudioFile(null);
    }
    setUploading(false);
  };

  if (loading) return <div className="text-center mt-4 fade-in">Loading...</div>;

  if (!session) {
    return (
      <div className="admin-container fade-in" style={{ maxWidth: 400, margin: '0 auto' }}>
        <h2 className="mb-2 text-center">Admin Login</h2>
        <div className="glass-panel">
          <form onSubmit={handleLogin}>
            <input
              type="email"
              className="input-field"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              className="input-field"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit" className="btn" style={{ width: '100%' }}>Login</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="mb-2">
        <h2>Dashboard</h2>
        <button onClick={handleLogout} className="btn" style={{ background: 'transparent', border: '1px solid var(--text-secondary)', color: 'var(--text-secondary)' }}>
          <LogOut size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} /> Logout
        </button>
      </div>

      <div className="admin-tabs mb-2">
        <button className={`tab-btn ${activeTab === 'blog' ? 'active' : ''}`} onClick={() => setActiveTab('blog')}>New Blog Post</button>
        <button className={`tab-btn ${activeTab === 'song' ? 'active' : ''}`} onClick={() => setActiveTab('song')}>Upload Song</button>
      </div>

      <div className="glass-panel">
        {activeTab === 'blog' && (
          <form onSubmit={submitBlogPost} className="fade-in">
            <h3>Write a Post</h3>
            <input type="text" className="input-field mt-1" placeholder="Title" value={blogTitle} onChange={(e) => setBlogTitle(e.target.value)} required />
            <textarea className="input-field" rows="6" placeholder="Content (Markdown supported)" value={blogContent} onChange={(e) => setBlogContent(e.target.value)} required />
            <button type="submit" className="btn" disabled={uploading}>
              {uploading ? 'Publishing...' : <><Send size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} /> Publish Post</>}
            </button>
          </form>
        )}

        {activeTab === 'song' && (
          <form onSubmit={submitSong} className="fade-in">
            <h3>Upload Unreleased Track</h3>
            <input type="text" className="input-field mt-1" placeholder="Song Title" value={songTitle} onChange={(e) => setSongTitle(e.target.value)} required />
            <textarea className="input-field" rows="3" placeholder="Description/Vibe (Optional)" value={songDesc} onChange={(e) => setSongDesc(e.target.value)} />
            <input type="file" accept="audio/*" className="input-field" onChange={(e) => setAudioFile(e.target.files[0])} required />
            <button type="submit" className="btn" disabled={uploading}>
              {uploading ? 'Uploading...' : <><Upload size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} /> Upload Track</>}
            </button>
          </form>
        )}
      </div>

      <style jsx="true">{`
        .admin-tabs {
          display: flex;
          gap: 1rem;
        }
        .tab-btn {
          flex: 1;
          padding: 1rem;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: var(--text-secondary);
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
        }
        .tab-btn.active {
          background: rgba(255,255,255,0.15);
          color: var(--text-primary);
          border-color: rgba(255,255,255,0.3);
        }
      `}</style>
    </div>
  );
}

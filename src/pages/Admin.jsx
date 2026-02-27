import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { LogOut, Upload, Send, Trash2, Edit2, X } from 'lucide-react';

export default function Admin() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Dashboard state
  const [activeTab, setActiveTab] = useState('blog');

  // Lists
  const [posts, setPosts] = useState([]);
  const [songs, setSongs] = useState([]);

  // Blog form
  const [blogId, setBlogId] = useState(null);
  const [blogTitle, setBlogTitle] = useState('');
  const [blogContent, setBlogContent] = useState('');

  // Song form
  const [songId, setSongId] = useState(null);
  const [songTitle, setSongTitle] = useState('');
  const [songDesc, setSongDesc] = useState('');
  const [audioFile, setAudioFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchData();
      }
      setLoading(false);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchData();
    });
  }, []);

  const fetchData = async () => {
    const { data: pData } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false });
    const { data: sData } = await supabase.from('songs').select('*').order('created_at', { ascending: false });
    if (pData) setPosts(pData);
    if (sData) setSongs(sData);
  };

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

  // ----- BLOG LOGIC -----
  const submitBlogPost = async (e) => {
    e.preventDefault();
    setUploading(true);

    if (blogId) {
      // Update
      const { error } = await supabase.from('blog_posts').update({ title: blogTitle, content: blogContent }).eq('id', blogId);
      if (error) alert(error.message);
      else alert('Blog post updated!');
    } else {
      // Insert
      const { error } = await supabase.from('blog_posts').insert([{ title: blogTitle, content: blogContent }]);
      if (error) alert(error.message);
      else alert('Blog post published!');
    }

    setBlogId(null);
    setBlogTitle('');
    setBlogContent('');
    setUploading(false);
    fetchData();
  };

  const editPost = (post) => {
    setBlogId(post.id);
    setBlogTitle(post.title);
    setBlogContent(post.content);
    window.scrollTo(0, 0);
  };

  const deletePost = async (id) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    await supabase.from('blog_posts').delete().eq('id', id);
    fetchData();
  };

  const cancelBlogEdit = () => {
    setBlogId(null);
    setBlogTitle('');
    setBlogContent('');
  };

  // ----- SONG LOGIC -----
  const submitSong = async (e) => {
    e.preventDefault();

    if (!songId && !audioFile) return alert('Please select an audio file for a new song.');
    setUploading(true);

    let finalAudioUrl = null;

    if (audioFile) {
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
      finalAudioUrl = publicUrlData.publicUrl;
    }

    if (songId) {
      // Update
      const updateData = { title: songTitle, description: songDesc };
      if (finalAudioUrl) updateData.audio_url = finalAudioUrl; // Only update URL if new file given

      const { error } = await supabase.from('songs').update(updateData).eq('id', songId);
      if (error) alert('DB error: ' + error.message);
      else alert('Song updated successfully!');
    } else {
      // Insert
      const { error: dbError } = await supabase.from('songs').insert([
        { title: songTitle, description: songDesc, audio_url: finalAudioUrl }
      ]);
      if (dbError) alert('DB error: ' + dbError.message);
      else alert('Song uploaded successfully!');
    }

    setSongId(null);
    setSongTitle('');
    setSongDesc('');
    setAudioFile(null);
    setUploading(false);
    fetchData();
  };

  const editSong = (song) => {
    setSongId(song.id);
    setSongTitle(song.title);
    setSongDesc(song.description || '');
    setAudioFile(null); // Require re-upload if they want to change audio, else keep old
    window.scrollTo(0, 0);
  };

  const deleteSong = async (song) => {
    if (!window.confirm('Are you sure you want to delete this song?')) return;

    // Optionally: delete from storage bucket if you map the URL back to filename
    // To keep it simple, we just delete from DB right now
    await supabase.from('songs').delete().eq('id', song.id);
    fetchData();
  };

  const cancelSongEdit = () => {
    setSongId(null);
    setSongTitle('');
    setSongDesc('');
    setAudioFile(null);
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
        <button className={`tab-btn ${activeTab === 'blog' ? 'active' : ''}`} onClick={() => setActiveTab('blog')}>Manage Blog</button>
        <button className={`tab-btn ${activeTab === 'song' ? 'active' : ''}`} onClick={() => setActiveTab('song')}>Manage Songs</button>
      </div>

      <div className="glass-panel mb-2">
        {activeTab === 'blog' && (
          <div className="fade-in">
            <form onSubmit={submitBlogPost}>
              <h3>{blogId ? 'Edit Post' : 'Write a New Post'}</h3>
              <input type="text" className="input-field mt-1" placeholder="Title" value={blogTitle} onChange={(e) => setBlogTitle(e.target.value)} required />
              <textarea className="input-field" rows="6" placeholder="Content (Markdown supported)" value={blogContent} onChange={(e) => setBlogContent(e.target.value)} required />
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" className="btn" disabled={uploading}>
                  {uploading ? 'Publishing...' : <><Send size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} /> {blogId ? 'Update Post' : 'Publish Post'}</>}
                </button>
                {blogId && (
                  <button type="button" className="btn" onClick={cancelBlogEdit} style={{ background: 'transparent', border: '1px solid var(--text-secondary)' }}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {activeTab === 'song' && (
          <div className="fade-in">
            <form onSubmit={submitSong}>
              <h3>{songId ? 'Edit Track' : 'Upload New Track'}</h3>
              <input type="text" className="input-field mt-1" placeholder="Song Title" value={songTitle} onChange={(e) => setSongTitle(e.target.value)} required />
              <textarea className="input-field" rows="3" placeholder="Description/Vibe (Optional)" value={songDesc} onChange={(e) => setSongDesc(e.target.value)} />

              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                {songId ? 'Select a new audio file only if you want to replace the current one:' : 'Select Audio File:'}
              </label>
              <input type="file" accept="audio/*" className="input-field" onChange={(e) => setAudioFile(e.target.files[0])} required={!songId} />

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" className="btn" disabled={uploading}>
                  {uploading ? 'Saving...' : <><Upload size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} /> {songId ? 'Update Track' : 'Upload Track'}</>}
                </button>
                {songId && (
                  <button type="button" className="btn" onClick={cancelSongEdit} style={{ background: 'transparent', border: '1px solid var(--text-secondary)' }}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Lists below the form */}
      <h3 className="mb-2">Existing {activeTab === 'blog' ? 'Posts' : 'Songs'}</h3>
      <div className="lists-container">
        {activeTab === 'blog' && posts.map(post => (
          <div key={post.id} className="glass-panel mb-1 list-item">
            <div className="list-info">
              <h4>{post.title}</h4>
              <p className="text-secondary" style={{ fontSize: '0.8rem' }}>{new Date(post.created_at).toLocaleDateString()}</p>
            </div>
            <div className="list-actions">
              <button onClick={() => editPost(post)} className="action-btn edit"><Edit2 size={18} /></button>
              <button onClick={() => deletePost(post.id)} className="action-btn delete"><Trash2 size={18} /></button>
            </div>
          </div>
        ))}

        {activeTab === 'song' && songs.map(song => (
          <div key={song.id} className="glass-panel mb-1 list-item">
            <div className="list-info">
              <h4>{song.title}</h4>
              <p className="text-secondary" style={{ fontSize: '0.8rem' }}>{song.description}</p>
            </div>
            <div className="list-actions">
              <button onClick={() => editSong(song)} className="action-btn edit"><Edit2 size={18} /></button>
              <button onClick={() => deleteSong(song)} className="action-btn delete"><Trash2 size={18} /></button>
            </div>
          </div>
        ))}

        {((activeTab === 'blog' && posts.length === 0) || (activeTab === 'song' && songs.length === 0)) && (
          <p className="text-secondary text-center">No items found.</p>
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
        .list-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.5rem;
        }
        .list-info h4 {
          margin: 0 0 0.2rem 0;
        }
        .list-info p {
          margin: 0;
        }
        .list-actions {
          display: flex;
          gap: 0.5rem;
        }
        .action-btn {
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 8px;
          transition: background 0.2s;
        }
        .action-btn:hover {
          background: rgba(255,255,255,0.1);
        }
        .action-btn.edit {
          color: var(--play-color);
        }
        .action-btn.delete {
          color: #ff4757;
        }
      `}</style>
    </div>
  );
}

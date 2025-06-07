import { useState, useEffect } from 'react';
import '../styles/Profile.css';

function Profile() {
  const [profile, setProfile] = useState({ name: '', dateOfBirth: '', standard: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('http://localhost:5000/get-profile?userId=default_user');
        const data = await response.json();
        if (data.error) throw new Error(data.error);
        setProfile(data.profile || { name: '', dateOfBirth: '', standard: '' });
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const response = await fetch('http://localhost:5000/save-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'default_user', ...profile }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      alert('Profile saved successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Error saving profile.');
    }
  };

  return (
    <div className="profile">
      <h1>Profile</h1>
      <div className="profile-picture">
        <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </div>
      <div className="profile-form">
        <input
          type="text"
          name="name"
          placeholder="name"
          value={profile.name}
          onChange={handleChange}
        />
        <div className="input-group">
          <input
            type="text"
            name="dateOfBirth"
            placeholder="Date of birth"
            value={profile.dateOfBirth}
            onChange={handleChange}
          />
          <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <div className="input-group">
          <select name="standard" value={profile.standard} onChange={handleChange}>
            <option value="">Standard</option>
            <option value="V">V</option>
            <option value="VI">VI</option>
            <option value="VII">VII</option>
            <option value="VIII">VIII</option>
            <option value="IX">IX</option>
            <option value="X">X</option>
          </select>
          <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        <button className="edit-btn">Edit profile</button>
        <button className="save-btn" onClick={handleSave}>Save</button>
      </div>
    </div>
  );
}

export default Profile;
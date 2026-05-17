import "../home.scss";

const Home = () => {
    
  return (
    <main className='home'>
      <section className='hero-section'>
        <div className='hero-content'>
          <span className='tag'>AI Interview Assistant</span>

          <h1>
            Build Your Personalized
            <span> Interview Blueprint</span>
          </h1>

          <p>
            Upload your resume, add a target role, and receive AI-generated
            interview preparation strategies tailored to your profile.
          </p>
        </div>
      </section>

      <section className='workspace'>
        <div className='job-card'>
          <div className='card-title'>Job Target</div>

          <textarea placeholder='Paste the target job description...' />
        </div>

        <div className='profile-card'>
          <div className='upload-card'>
            <input type='file' id='resume' accept='.pdf,.doc,.docx' />

            <label htmlFor='resume'>
              <div className='upload-icon'>↑</div>

              <h3>Upload Resume</h3>

              <p>PDF or DOCX · Max 5MB</p>
            </label>
          </div>

          <div className='profile-divider'>Candidate Snapshot</div>

          <textarea placeholder='Write a short introduction about your skills and experience...' />
        </div>
      </section>

      <section className='action-panel'>
        <div className='ai-note'>
          AI analysis usually takes around 20–30 seconds.
        </div>

        <button className='generate-btn'>Generate Interview Blueprint</button>
      </section>
    </main>
  );
};

export default Home;

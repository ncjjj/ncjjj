"use client";

import "./AboutCAFirm.css";

export default function AboutCAFirm() {
  return (
    <div className="about-ca-firm-wrapper panel">

      <div className="main-layout">

        {/* ================= LEFT: VISION SECTION ================= */}
        <section className="vision-section">
        
        <h2 className="title">Visionaries’ Note</h2>

        <div className="vision-layout">

          {/* LEFT LINE */}
          <div className="timeline">
            <div className="line"></div>
          </div>

          {/* RIGHT CARDS */}
          <div className="cards">

            <div className="vision-card">
              <img src="../images/image1.png" alt="Nemi Chand Jain" />
              <div className="content">
                <h4>Late Shri Nemi Chand Jain</h4>
                <p>
                  Built the firm on integrity, diligence, and justice. His mission
                  was to make legal services accessible and dependable.
                </p>
              </div>
            </div>

            <div className="vision-card">
              <img src="../images/image2.png" alt="Sanjay Jain" />
              <div className="content">
                <h4>Shri Sanjay Jain</h4>
                <p>
                  Carried forward the legacy with modern perspective, blending
                  tradition with innovation.
                </p>
              </div>
            </div>

          </div>

        </div>

        </section>

        {/* ================= RIGHT: ABOUT SECTION ================= */}
        <section className="about">
        
        <h2 className="title">About NCJ Legal LLP</h2>

        <div className="about-content">

          {/* TEXT */}
          <div className="about-text">
            <p>
              Founded in the early 1960s by Late Shri Nemi Chand Jain, the firm began as Nemi Chand Jain & Associates.
            </p>

            <p>
              The firm was further expanded under the leadership of Shri Sanjay Jain, continuing as Senior Partner.
            </p>

            <p>
              In 2019, Mr. Shobhit Jain joined as Partner, bringing a modern outlook while preserving the firm’s legacy.
            </p>
          </div>

          {/* LEGACY CARD */}
          <div className="about-card">
            <h4>Our Legacy</h4>
            <p>
              Built on trust, ethics, and decades of expertise in taxation and legal advisory.
            </p>
          </div>

        </div>

        </section>

      </div>

    </div>
  );
}
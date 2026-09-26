import Navbar from "./Navbar";
import "../App.css";

function About() {
  return (
    <>
      <Navbar />

      <main className="about-page">
        <section className="about">
          <div className="about-container">

            <div className="about-header">
              <div className="about-tag">
                ABOUT / SOURCE LENS
              </div>

              <h1>
                See Beyond
                <br />
                <span>the Source Code.</span>
              </h1>

              <p className="about-intro">
                Source Lens is an intelligent codebase analysis and visualization platform built to transform complex software projects into a clear, understandable view of their architecture.
              </p>
            </div>

            <div className="about-content">

              <div className="about-block">
                <span className="about-number"></span>

                <div>
                  <h2>Why Source Lens?</h2>

                  <p>
                    Modern software projects can contain hundreds or even
                    thousands of files, modules, dependencies, APIs, and
                    connections. Understanding how everything fits together
                    can take significant time.
                  </p>

                  <p>
                    Source Lens analyzes the structure of a project and
                    presents those relationships visually, helping developers
                    understand an unfamiliar codebase faster.
                  </p>
                </div>
              </div>

              <div className="about-block">
                <span className="about-number"></span>

                <div>
                  <h2>From Code to Architecture</h2>

                  <p>
                    Source Lens scans the selected project, identifies files,
                    folders, imports, dependencies, APIs, and relationships,
                    and converts that information into an interactive
                    architectural view.
                  </p>

                  <div className="about-flow">
                    <span>CODE</span>
                    <span>→</span>
                    <span>ANALYZE</span>
                    <span>→</span>
                    <span>VISUALIZE</span>
                    <span>→</span>
                    <span>UNDERSTAND</span>
                  </div>
                </div>
              </div>

              <div className="about-block">
                <span className="about-number"></span>

                <div>
                  <h2>Built For Developers</h2>

                  <p>
                    Source Lens is designed for developers, students,
                    development teams, and anyone who needs to explore and
                    understand complex software systems.
                  </p>
                </div>
              </div>

            </div>

            <div className="about-footer">
              <span>DND AUTOMATION</span>
              <span>SOURCE LENS</span>
              <span>CODE · ANALYZE · VISUALIZE · UNDERSTAND</span>
            </div>

          </div>
        </section>
      </main>
    </>
  );
}

export default About;
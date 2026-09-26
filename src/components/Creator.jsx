import Navbar from "./Navbar";
import NeevImage from "../assets/Neev.jpeg";

function Creator() {
  return (
    <>
      <Navbar />

      <main className="creator-page">
        <section className="creator">

          <div className="creator-container">

            {/* LEFT SIDE */}

            <div className="creator-left">

              <div className="creator-image-wrapper">
                <img
                  src={NeevImage}
                  alt="Neev Dinkar"
                  className="creator-image"
                />
              </div>

              <div className="creator-image-info">
                <span>SOURCE LENS</span>
                <span>CREATOR</span>
              </div>

            </div>


            {/* RIGHT SIDE */}

            

            <div className="creator-right">

              <h1>
                Neev 
                <span> Dinkar</span>
              </h1>

              <h2>
                Founder - DND Automation
              </h2>

              <p>
               I’m Nani, FOUNDER & CEO of DND Automation, building at the intersection of Artificial Intelligence, Cybersecurity, Robotics, and Automation.
              </p>

              <p>
                Turning ambitious ideas into real products, prototypes, and systems. At DND Automation, I lead the development of technology projects focused on AI agents, intelligent automation, cybersecurity, autonomous robotics, drones, and next-generation developer tools.
              </p>

              <p>
                My approach is simple: Catch The Phish Before It Catches You.
              </p>

              <p>
                My long-term vision is to build technology that is not just impressive on paper, but useful, scalable, and capable of solving real-world problems.
              </p>

              <p>
                CEO @ DND Automation <br />
                Building the future through AI, Automation & Engineering.
              </p>


              <div className="creator-meta">

                <div>
                  <span>PROJECT</span>
                  <strong>Source Lens</strong>
                </div>

                <div>
                  <span>ORGANIZATION</span>
                  <strong>DND Automation</strong>
                </div>

              </div>

            </div>

          </div>

        </section>
      </main>
    </>
  );
}

export default Creator;
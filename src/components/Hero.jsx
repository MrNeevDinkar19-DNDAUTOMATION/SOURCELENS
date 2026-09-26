const Hero = () => {
  return (
    <section className="hero">
      <div className="hero-content">
        <div className="hero-badge">
          <span className="hero-badge-dot"></span>
          AI-Powered Codebase Intelligence
        </div>

        <h1>
          See your codebase
          <span> as an architecture.</span>
        </h1>

        <p>
          Source Lens transforms your entire software project into an
          intelligent architecture map. Understand files, folders,
          dependencies, APIs, and connections in one place.
        </p>

        <div className="hero-actions">
          <button className="hero-primary-btn" onClick={() => navigate("/dashboard")}>
            Analyze Your Codebase
            <span>→</span>
          </button>

          <button className="hero-secondary-btn" onClick={() => navigate("/about")}>
            Explore Source Lens
          </button>
        </div>

        <div className="hero-stats">
          <div className="hero-stat">
            <strong>01</strong>
            <span>Recursive Mapping</span>
          </div>

          <div className="hero-stat">
            <strong>02</strong>
            <span>Dependency Analysis</span>
          </div>

          <div className="hero-stat">
            <strong>03</strong>
            <span>API Intelligence</span>
          </div>
        </div>
      </div>

      <div className="hero-visual">
        <div className="architecture-window">
          <div className="window-header">
            <div className="window-dots">
              <span className="span1"></span>
              <span className="span2"></span>
              <span className="span3"></span>
            </div>

            <div className="window-title">
              SOURCE-LENS / ARCHITECTURE
            </div>
          </div>

          <div className="architecture-map">
            <div className="map-label frontend-label">
              FRONTEND
            </div>

            <div className="map-node node-app">
              <div className="node-icon">JS</div>
              <div>
                <strong>App.jsx</strong>
                <small>Application</small>
              </div>
            </div>

            <div className="map-node node-api">
              <div className="node-icon">API</div>
              <div>
                <strong>api.js</strong>
                <small>API Client</small>
              </div>
            </div>

            <div className="map-label backend-label">
              BACKEND
            </div>

            <div className="map-node node-server">
              <div className="node-icon">PY</div>
              <div>
                <strong>main.py</strong>
                <small>Server</small>
              </div>
            </div>

            <div className="map-node node-service">
              <div className="node-icon">FN</div>
              <div>
                <strong>service.py</strong>
                <small>Service</small>
              </div>
            </div>

            <div className="map-core">
              <span>CORE</span>
              <strong>Source Lens</strong>
            </div>

            <div className="connection connection-one"></div>
            <div className="connection connection-two"></div>
            <div className="connection connection-three"></div>
            <div className="connection connection-four"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
import "./AnimatedBackground.css";

const AnimatedBackground = () => {
  return (
    <>
      <div className="bright-gradient-bg">
        <div className="light-blob blob-1"></div>
        <div className="light-blob blob-2"></div>
      </div>

      <div className="floating-icons-container">
        <div className="bg-icon icon-heart"></div>
        <div className="bg-icon icon-cross"></div>
        <div className="bg-icon icon-pill"></div>
        <div className="bg-icon icon-heart2"></div>
        <div className="bg-icon icon-plus"></div>
      </div>
    </>
  );
};

export default AnimatedBackground;

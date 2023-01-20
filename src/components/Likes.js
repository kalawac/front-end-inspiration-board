import "./Likes.css";

const Likes = (props) => {
  return (
    <>
      <span id="num-likes"> {props.likes} ♥️ </span>
      <button className="like-and-delete-buttons"> +1 </button>
    </>
  );
};

export default Likes;

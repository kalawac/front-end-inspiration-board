import React, { useState, useEffect } from "react";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import axios from "axios";

import "./App.css";

import LogInView from "./routes/LogInView";
import LogInForm from "./routes/LogInForm";
import SignUpForm from "./routes/SignUpForm";
import Home from "./routes/Home";
import CreateBoard from "./routes/CreateBoard";
import SingleBoardView from "./routes/SingleBoardView";
import ErrorPage from "./error-page";
// import DUMMY_BOARD_DATA from "./components/dummyData";

// const genericDummyFunc = (arg1 = null) => {
//   console.log("This is the dummy function");
// };

// const WAIT = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// const kBaseUrl = 'http://localhost:5000';
const kBaseUrl = "https://hackspo-be.herokuapp.com";

const getAllBoardsAPI = async () => {
  try {
    const response = await axios.get(`${kBaseUrl}/boards`);
    return response.data;
  } catch (err) {
    console.log(err);
  }
};

function App() {
  let [loggedIn, setLoggedIn] = useState({
    userId: null,
    repeatLogin: false,
    repeatSignUp: false,
  });

  let [appData, setAppData] = useState([]);
  let [cardDataByBoard, setCardDataByBoard] = useState([]);

  const logUserOut = () => {
    setLoggedIn({
      userId: null,
      repeatLogin: false,
      repeatSignUp: false,
    });
  };

  const getBoardArr = async () => {
    const boardArr = await getAllBoardsAPI();
    return setAppData(boardArr);
  };

  const sortBoardsByMostRecent = async (appData) => {
    const boardArr = await getAllBoardsAPI();
    boardArr.reverse();
    return setAppData(boardArr);
  };

  const sortBoardsByMostCards = async (appData) => {
    const boardArr = await getAllBoardsAPI();
    boardArr.sort((a, b) => b.num_cards - a.num_cards);
    return setAppData(boardArr);
  };

  const sortBoardsByLeastCards = async (appData) => {
    const boardArr = await getAllBoardsAPI();
    boardArr.sort((a, b) => a.num_cards - b.num_cards);
    return setAppData(boardArr);
  };

  const sortbyOwnerNameAZ = async (appData) => {
    const boardArr = await getAllBoardsAPI();
    boardArr.sort((a, b) => a.owner.localeCompare(b.owner));
    return setAppData(boardArr);
  };

  const sortbyOwnerNameZA = async (appData) => {
    const boardArr = await getAllBoardsAPI();
    boardArr.sort((a, b) => b.owner.localeCompare(a.owner));
    return setAppData(boardArr);
  };

  const sortBoardArr = (value) => {
    switch (value) {
      case "1":
        getBoardArr();
        break;
      case "2":
        sortBoardsByMostRecent();
        break;
      case "3":
        sortBoardsByMostCards();
        break;
      case "4":
        sortBoardsByLeastCards();
        break;
      case "5":
        sortbyOwnerNameAZ();
        break;
      case "6":
        sortbyOwnerNameZA();
        break;
      default:
        getBoardArr();
    }
  };

  const getCardsByBoard = async (boardId) => {
    try {
      const response = await axios.get(`${kBaseUrl}/cards/board/${boardId}`);
      return response.data;
    } catch (err) {
      console.log(err);
    }
  };

  const getCardsArr = async (boardId) => {
    const cardArr = await getCardsByBoard(boardId);
    return setCardDataByBoard(cardArr);
  };

  useEffect(() => {
    if (loggedIn.userId) {
      getBoardArr();
    } else {
      setAppData([]);
    }
  }, [loggedIn.userId, cardDataByBoard]);

  const passCreateBoardProps = () => {
    return [{ onCreate: addBoard }];
  };

  // const passBoardPropsDummy = () => DUMMY_BOARD_DATA;

  const passBoardProps = (boardProps) => {
    return [
      {
        boardArr: appData,
        getBoardCards: getCardsArr,
        sortBoardMenu: sortBoardArr,
        handleLogOut: logUserOut,
      },
    ];
  };

  const passLogInProps = () => {
    return [{ loginState: loggedIn, onLogIn: handleLogIn }];
  };

  const passSignUpProps = () => {
    return [{ loginState: loggedIn, onSignUp: handleSignUp }];
  };

  const passSingleBoardProps = () => {
    return [
      {
        loginState: loggedIn,
        onSubmitCard: handleSubmitCard,
        cards: cardDataByBoard,
        getCardsByBoard: getCardsByBoard,
      },
    ];
  };

  const handleLogIn = async (formData) => {
    const username = formData.name.toLowerCase(); // avoids case-sensitivity problems; have to post to lowercase as well
    try {
      const response = await axios.get(`${kBaseUrl}/users/${username}`);
      return setLoggedIn({
        userId: response.data.id,
        repeatLogin: false,
        repeatSignUp: false,
      });
    } catch (err) {
      return setLoggedIn({
        userId: null,
        repeatLogin: true,
        repeatSignUp: false,
      });
    }
  };

  const handleSignUp = async (formData) => {
    const username = formData.name.toLowerCase(); // avoids case-sensitivity problems; have to post to lowercase as well
    const requestBody = { name: username };

    try {
      const response = await axios.post(`${kBaseUrl}/users`, requestBody);
      return setLoggedIn({
        userId: response.data.id,
        repeatLogin: false,
        repeatSignUp: false,
      });
    } catch (err) {
      return setLoggedIn({
        userId: null,
        repeatLogin: false,
        repeatSignUp: true,
      });
    }
  };

  const addBoard = async (boardData) => {
    const requestBody = {
      title: boardData.title,
      card_color: boardData.cardColor,
      user_id: loggedIn.userId,
    };

    try {
      await axios.post(`${kBaseUrl}/boards`, requestBody);
      const boardArr = getAllBoardsAPI();
      setAppData(boardArr);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitCard = async (newCardMessage, boardId) => {
    const requestBody = {
      message: newCardMessage,
      board_id: boardId,
      user_id: loggedIn.userId,
    };
    console.log(requestBody);
    try {
      await axios.post(`${kBaseUrl}/cards`, requestBody);
    } catch (err) {
      console.log(err);
    }
    getCardsArr();
  };

  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route
          path="/"
          element={
            loggedIn.userId ? <Navigate to="/boards" replace /> : <LogInView />
          }
          loader={passLogInProps}
          errorElement={<ErrorPage />}
        >
          <Route
            path="login"
            element={
              loggedIn.userId ? (
                <Navigate to="/boards" replace />
              ) : (
                <LogInForm />
              )
            }
            loader={passLogInProps}
            errorElement={<ErrorPage />}
          />
          <Route
            path="signup"
            element={
              loggedIn.userId ? (
                <Navigate to="/boards" replace />
              ) : (
                <SignUpForm />
              )
            }
            loader={passSignUpProps}
            errorElement={<ErrorPage />}
          />
        </Route>
        <Route
          path="/boards"
          element={loggedIn.userId ? <Home /> : <Navigate to="/" replace />}
          loader={passBoardProps}
          errorElement={<ErrorPage />}
        />
        <Route
          path="/create-board"
          element={<CreateBoard />}
          loader={passCreateBoardProps}
          errorElement={<ErrorPage />}
        />
        <Route
          path="/boards/:boardId"
          element={<SingleBoardView />}
          loader={passSingleBoardProps}
          errorElement={<ErrorPage />}
        />
        <Route path="*" element={<ErrorPage />} />
      </>
    )
  );

  return <RouterProvider router={router} />;
}

export default App;

import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Header from "../Header/Header";
import Main from "../Main/Main";
import About from "../About/About";
import Footer from "../Footer/Footer";
import SavedNews from "../SavedNews/SavedNews";
import LoginModal from "../LoginModal/LoginModal";
import RegisterModal from "../RegisterModal/RegisterModal";
import TestInfo from "../TestInfo/TestInfo";
import newsApi from "../../utils/newsApi";
import mockAuthApi from "../../utils/mockAuthApi";
import LocalStorageUtil from "../../utils/localStorage";
import "./App.css";

function App() {
  // Authentication state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
  // Articles state
  const [articles, setArticles] = useState([]);
  const [savedArticles, setSavedArticles] = useState([]);
  const [displayedArticlesCount, setDisplayedArticlesCount] = useState(3);
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [currentKeyword, setCurrentKeyword] = useState("");
  
  // Modal state
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  // Check for existing authentication on app load
  useEffect(() => {
    const token = LocalStorageUtil.getToken();
    if (token) {
      mockAuthApi.verifyToken(token)
        .then((response) => {
          setIsLoggedIn(true);
          setCurrentUser(response.data.user);
          setSavedArticles(LocalStorageUtil.getSavedArticles());
        })
        .catch(() => {
          // Token is invalid, remove it
          LocalStorageUtil.removeToken();
        })
        .finally(() => {
          setIsCheckingAuth(false);
        });
    } else {
      setIsCheckingAuth(false);
    }
  }, []);

  // Authentication handlers
  const handleSignIn = async (userData) => {
    try {
      const response = await mockAuthApi.login(userData);
      setIsLoggedIn(true);
      setCurrentUser(response.data.user);
      LocalStorageUtil.setToken(response.data.token);
      setSavedArticles(LocalStorageUtil.getSavedArticles());
      setIsLoginModalOpen(false);
    } catch (error) {
      console.error("Login error:", error);
      // You can add error handling here (show error message to user)
      alert(error.message || "Sign in failed. Please check your email and password and try again.");
    }
  };

  const handleSignUp = async (userData) => {
    try {
      const response = await mockAuthApi.register(userData);
      setIsLoggedIn(true);
      setCurrentUser(response.data.user);
      LocalStorageUtil.setToken(response.data.token);
      setSavedArticles(LocalStorageUtil.getSavedArticles());
      setIsRegisterModalOpen(false);
    } catch (error) {
      console.error("Registration error:", error);
      // You can add error handling here (show error message to user)
      alert(error.message || "Sign up failed. Please try again or use a different email.");
    }
  };

  const handleSignOut = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setSavedArticles([]);
    LocalStorageUtil.removeToken();
    // Note: We keep saved articles in localStorage for when user logs back in
  };

  // Search functionality
  const handleSearch = (keyword) => {
    // Validation
    if (!keyword.trim()) {
      setSearchError("Please enter a keyword");
      return;
    }

    // Clear previous state
    setSearchError("");
    setIsLoading(true);
    setHasSearched(true);
    setCurrentKeyword(keyword);
    setDisplayedArticlesCount(3);

    // API call
    newsApi
      .searchNews(keyword)
      .then((data) => {
        if (data.articles && data.articles.length > 0) {
          setArticles(data.articles);
          setSearchError("");
        } else {
          setArticles([]);
          setSearchError("Nothing found");
        }
      })
      .catch((error) => {
        console.error("Search error:", error);
        setArticles([]);
        setSearchError("We couldn't complete your search. Please check your connection and try again.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  // Show more articles
  const handleShowMore = () => {
    setDisplayedArticlesCount(prev => prev + 3);
  };

  // Saved articles handlers
  const handleSaveArticle = (article) => {
    const updatedSavedArticles = LocalStorageUtil.addSavedArticle(article);
    setSavedArticles(updatedSavedArticles);
  };

  const handleDeleteArticle = (article) => {
    const updatedSavedArticles = LocalStorageUtil.removeSavedArticle(article.url);
    setSavedArticles(updatedSavedArticles);
  };

  // Modal handlers
  const openLoginModal = () => {
    setIsLoginModalOpen(true);
    setIsRegisterModalOpen(false);
  };

  const openRegisterModal = () => {
    setIsRegisterModalOpen(true);
    setIsLoginModalOpen(false);
  };

  const closeModals = () => {
    setIsLoginModalOpen(false);
    setIsRegisterModalOpen(false);
  };

  // Show loading while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="app">
        <div className="app__loading">
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  // Basename must match where the app is served. On GitHub Pages it's /repo-name; locally it's /
  const getBasename = () => {
    if (typeof window === "undefined") return "/";
    const pathname = window.location.pathname.replace(/\/$/, "") || "/";
    const segments = pathname.split("/").filter(Boolean);
    const first = segments[0];
    return first ? `/${first}` : "/";
  };
  const basename = getBasename();

  return (
    <Router basename={basename}>
      <div className="app">
        <TestInfo />
        <Header
          isLoggedIn={isLoggedIn}
          currentUser={currentUser}
          onSignInClick={openLoginModal}
          onSignUpClick={openRegisterModal}
          onSignOut={handleSignOut}
        />

        <Routes>
          <Route
            path="/"
            element={
              <>
                <Main
                  isLoggedIn={isLoggedIn}
                  onSaveArticle={handleSaveArticle}
                  onDeleteArticle={handleDeleteArticle}
                  savedArticles={savedArticles}
                  articles={articles}
                  displayedArticlesCount={displayedArticlesCount}
                  onSearch={handleSearch}
                  onShowMore={handleShowMore}
                  isLoading={isLoading}
                  searchError={searchError}
                  hasSearched={hasSearched}
                  currentKeyword={currentKeyword}
                />
                <About />
              </>
            }
          />
          <Route
            path="/saved-news"
            element={
              isLoggedIn ? (
                <SavedNews
                  savedArticles={savedArticles}
                  onDeleteArticle={handleDeleteArticle}
                  currentUser={currentUser}
                />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
        </Routes>

        <Footer />

        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={closeModals}
          onSubmit={handleSignIn}
          onSwitchToRegister={openRegisterModal}
        />

        <RegisterModal
          isOpen={isRegisterModalOpen}
          onClose={closeModals}
          onSubmit={handleSignUp}
          onSwitchToLogin={openLoginModal}
        />
      </div>
    </Router>
  );
}

export default App;
